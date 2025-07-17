import { tool } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import { getUserAssistantByUserId } from '@/lib/db/queries';

interface CallN8nFlowProps {
  session: Session;
}

export const callN8nFlow = ({ session }: CallN8nFlowProps) => tool({
  description: 'Call an n8n flow with assistantId, threadId, and query',
  inputSchema: z.object({
    query: z.string(),
  }),
  execute: async ({ query }) => {
    const userAssistant = await getUserAssistantByUserId({ userId: session.user.id });
    const response = await fetch(
      'https://zaviago.app.n8n.cloud/webhook/4141d0b1-1c54-49d0-9ebc-3f417955ed7b',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assistantId: userAssistant.assistantId, threadId: userAssistant.threadId, query }),
      }
    );
    const data = await response.json();
    return data;
  },
}); 