import { after } from 'next/server';
import { streamText, convertToModelMessages, type UIMessage, stepCountIs } from 'ai';
import { observe, updateActiveObservation, updateActiveTrace } from '@langfuse/tracing';
import { trace } from '@opentelemetry/api';

import { loadPromptWithLangfuseFallback } from '@/lib/prompts';
import { langfuseSpanProcessor } from '@/instrumentation';
import { gameDescriptionsTools } from '@/app/tools/game-descriptions';
import 'dotenv/config';

export const runtime = 'nodejs';
export const maxDuration = 30;

const PROMPT_SLUG = 'game-planning';

const handler = async (req: Request) => {
  try {
    const body = await req.json();
    const messages: UIMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const chatId: string | undefined = body?.chatId ?? body?.sessionId ?? undefined;
    const userId: string | undefined = body?.userId ?? undefined;

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messages array is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const lastMessage = messages[messages.length - 1];
    const lastText = lastMessage?.parts?.find((part) => part.type === 'text')?.text;

    updateActiveObservation({ input: lastText });
    updateActiveTrace({
      name: 'chat-game-planning',
      sessionId: chatId,
      userId,
      input: lastText,
    });

    const { prompt: systemPrompt, metadata: langfusePrompt, source: promptSource } =
      await loadPromptWithLangfuseFallback(PROMPT_SLUG, {
        slug: `game0/${PROMPT_SLUG}`,
      });

    const telemetryMetadata: Record<string, unknown> = {
      route: 'chat',
      prompt: PROMPT_SLUG,
    };

    if (promptSource === 'langfuse' && langfusePrompt) {
      telemetryMetadata.langfusePrompt = langfusePrompt;
    }

    const result = streamText({
      model: 'openai/gpt-5-mini-2025-08-07',
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      tools: gameDescriptionsTools,
      stopWhen: stepCountIs(5),
      providerOptions: {
        openai: {
          reasoningSummary: 'auto',
          textVerbosity: 'medium',
          reasoningEffort: 'low',
        },
      },
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'chat-game-planning'
      },
      onFinish: async ({ text, usage }) => {
        updateActiveObservation({ output: text });
        updateActiveTrace({ output: text });
        trace.getActiveSpan()?.end();
      },
      onError: async (error) => {
        const message = error instanceof Error ? error.message : String(error);
        updateActiveObservation({ output: message, level: 'ERROR' });
        updateActiveTrace({ output: message });
        trace.getActiveSpan()?.end();
      },
    });

    after(async () => {
      try {
        await langfuseSpanProcessor.forceFlush();
      } catch (error) {
        console.error('[langfuse] forceFlush failed', error);
      }
    });

    return result.toUIMessageStreamResponse({ sendReasoning: true });
  } catch (error) {
    console.error('Chat API Error:', error);
    trace.getActiveSpan()?.end();
    return new Response('Internal Server Error', { status: 500 });
  }
};

export const POST = observe(handler, {
  name: 'handle-chat-message',
  endOnExit: false,
});
