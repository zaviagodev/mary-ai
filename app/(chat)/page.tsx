import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';
import { getChatsByUserId } from '@/lib/db/queries';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Check for existing chats for the user
  let userChatId: string | null = null;
  if (session.user?.id) {
    const chatsResult = await getChatsByUserId({
      id: session.user.id,
      limit: 1,
      startingAfter: null,
      endingBefore: null,
    });
    if (chatsResult.chats && chatsResult.chats.length > 0) {
      userChatId = chatsResult.chats[0].id;
    }
  }

  if (userChatId) {
    redirect(`/chat/${userChatId}`);
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType="private"
          isReadonly={false}
          session={session}
          autoResume={false}
        />
        <DataStreamHandler />
      </>
    );
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={modelIdFromCookie.value}
        initialVisibilityType="private"
        isReadonly={false}
        session={session}
        autoResume={false}
      />
      <DataStreamHandler />
    </>
  );
}
