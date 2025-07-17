import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from 'ai';
import { auth, type UserType } from '@/app/(auth)/auth';
import { type RequestHints, systemPrompt } from '@/lib/ai/prompts';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { callN8nFlow } from '@/lib/ai/tools/call-n8n-flow';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from 'resumable-stream';
import { after } from 'next/server';
import { ChatSDKError } from '@/lib/errors';
import type { ChatMessage } from '@/lib/types';
import type { ChatModel } from '@/lib/ai/models';
import type { VisibilityType } from '@/components/visibility-selector';

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        console.log(
          ' > Resumable streams are disabled due to missing REDIS_URL',
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  console.log('[POST] /api/chat called');
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    console.log('[POST] Parsed JSON:', json);
    requestBody = postRequestBodySchema.parse(json);
    console.log('[POST] Parsed requestBody:', requestBody);
  } catch (err) {
    console.error('[POST] Error parsing request body:', err);
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel['id'];
      selectedVisibilityType: VisibilityType;
    } = requestBody;

    const session = await auth();
    console.log('[POST] Session:', session);

    if (!session?.user) {
      console.warn('[POST] No user in session');
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });
    console.log('[POST] Message count for user', session.user.id, ':', messageCount);

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      console.warn('[POST] Rate limit exceeded for user', session.user.id);
      return new ChatSDKError('rate_limit:chat').toResponse();
    }

    const chat = await getChatById({ id });
    console.log('[POST] Chat:', chat);

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });
      console.log('[POST] Generated title:', title);

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
      console.log('[POST] Chat saved');
    } else {
      if (chat.userId !== session.user.id) {
        console.warn('[POST] Chat userId mismatch:', chat.userId, '!=', session.user.id);
        return new ChatSDKError('forbidden:chat').toResponse();
      }
    }

    const messagesFromDb = await getMessagesByChatId({ id });
    console.log('[POST] Messages from DB:', messagesFromDb);
    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

    const { longitude, latitude, city, country } = geolocation(request);
    console.log('[POST] Geolocation:', { longitude, latitude, city, country });

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });
    console.log('[POST] User message saved');

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });
    console.log('[POST] Stream ID created:', streamId);

    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        console.log('[POST] Executing createUIMessageStream');
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel, requestHints }),
          messages: convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(5),
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'getWeather',
                  'subAgent',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          tools: {
            getWeather,
            subAgent: callN8nFlow({session}),
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        console.log('[POST] onFinish saving messages:', messages);
        await saveMessages({
          messages: messages.map((message) => ({
            id: message.id,
            role: message.role,
            parts: message.parts,
            createdAt: new Date(),
            attachments: [],
            chatId: id,
          })),
        });
      },
      onError: (error) => {
        console.error('[POST] Error occurred in stream:', error);
        return 'Oops, an error occurred!';
      },
    });

    const streamContext = getStreamContext();
    console.log('[POST] Stream context:', streamContext);

    if (streamContext) {
      console.log('[POST] Returning resumable stream response');
      return new Response(
        await streamContext.resumableStream(streamId, () =>
          stream.pipeThrough(new JsonToSseTransformStream()),
        ),
      );
    } else {
      console.log('[POST] Returning non-resumable stream response');
      return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
    }
  } catch (error) {
    console.error('[POST] Caught error:', error);
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    // Ensure a response is always returned
    return new ChatSDKError('bad_request:chat').toResponse();
  }
}

export async function DELETE(request: Request) {
  console.log('[DELETE] /api/chat called');
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  console.log('[DELETE] Chat ID:', id);

  if (!id) {
    console.warn('[DELETE] No id provided');
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();
  console.log('[DELETE] Session:', session);

  if (!session?.user) {
    console.warn('[DELETE] No user in session');
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chat = await getChatById({ id });
  console.log('[DELETE] Chat:', chat);

  if (chat.userId !== session.user.id) {
    console.warn('[DELETE] Chat userId mismatch:', chat.userId, '!=', session.user.id);
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  const deletedChat = await deleteChatById({ id });
  console.log('[DELETE] Deleted chat:', deletedChat);

  return Response.json(deletedChat, { status: 200 });
}
