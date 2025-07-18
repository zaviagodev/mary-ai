import { PreviewMessage, ThinkingMessage } from './message';
import { Greeting } from './greeting';
import { memo } from 'react';
import type { Vote } from '@/lib/db/schema';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { motion } from 'framer-motion';
import { useMessages } from '@/hooks/use-messages';
import type { ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers<ChatMessage>['status'];
  votes: Array<Vote> | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  regenerate: UseChatHelpers<ChatMessage>['regenerate'];
  isReadonly: boolean;
  isArtifactVisible: boolean;
}

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  regenerate,
  isReadonly,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  } = useMessages({
    chatId,
    status,
  });

  useDataStream();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 relative"
    >
      {messages.length === 0 && <Greeting />}

      {messages.slice(0, -1).map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={false}
          vote={
            votes
              ? votes.find((vote) => vote.messageId === message.id)
              : undefined
          }
          setMessages={setMessages}
          regenerate={regenerate}
          isReadonly={isReadonly}
          requiresScrollPadding={
            hasSentMessage && index === messages.length - 1
          }
        />
      ))}

      {/* Handle the last message specially to avoid blank state */}
      {messages.length > 0 && (() => {
        const lastMessage = messages[messages.length - 1];
        // Check if the last message is an assistant message and if it has any visible part
        const hasVisiblePart = lastMessage.parts?.some(
          (part) => {
            // Show if text, reasoning, or any tool output is available
            if (part.type === 'text' && part.text?.trim().length > 0) return true;
            if (part.type === 'reasoning' && part.text?.trim().length > 0) return true;
            // For tool calls, only check state if it exists
            if (part.type?.startsWith('tool-') && 'state' in part && part.state === 'output-available') return true;
            return false;
          }
        );
        if (
          lastMessage.role === 'assistant' &&
          (status === 'streaming' || status === 'submitted') &&
          !hasVisiblePart
        ) {
          // Still waiting for a response, show thinking
          return <ThinkingMessage />;
        }
        // Otherwise, show the message as normal
        return (
          <PreviewMessage
            key={lastMessage.id}
            chatId={chatId}
            message={lastMessage}
            isLoading={status === 'streaming'}
            vote={
              votes
                ? votes.find((vote) => vote.messageId === lastMessage.id)
                : undefined
            }
            setMessages={setMessages}
            regenerate={regenerate}
            isReadonly={isReadonly}
            requiresScrollPadding={
              hasSentMessage && messages.length - 1 === messages.length - 1
            }
          />
        );
      })()}

      <motion.div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
        onViewportLeave={onViewportLeave}
        onViewportEnter={onViewportEnter}
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return false;
});
