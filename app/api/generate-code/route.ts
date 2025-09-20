import { after } from 'next/server';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { observe, updateActiveObservation, updateActiveTrace } from '@langfuse/tracing';
import { trace } from '@opentelemetry/api';

import { loadPromptWithHotReload } from '@/lib/prompts';
import { tryGetLangfuseClient } from '@/lib/langfuse';
import { langfuseSpanProcessor } from '@/instrumentation';
import 'dotenv/config';

export const runtime = 'nodejs';
export const maxDuration = 30;

const PROMPT_SLUG = 'code-generation';

const handler = async (req: Request) => {
  try {
    const body = await req.json();
    const messages: UIMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const overrideSystem = typeof body?.system === 'string' ? body.system : undefined;
    const chatId: string | undefined = body?.chatId ?? body?.sessionId ?? undefined;
    const userId: string | undefined = body?.userId ?? undefined;

    if (messages.length === 0 && !overrideSystem) {
      return new Response(
        JSON.stringify({ error: 'messages or system prompt required' }),
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
      name: 'code-generation',
      sessionId: chatId,
      userId,
      input: lastText ?? overrideSystem,
    });

    const langfuse = tryGetLangfuseClient();
    let langfusePrompt: unknown;
    let systemPrompt = overrideSystem;

    if (!systemPrompt) {
      if (langfuse) {
        try {
          const prompt = await langfuse.prompt.get(PROMPT_SLUG);
          langfusePrompt = typeof prompt.toJSON === 'function' ? prompt.toJSON() : undefined;
          systemPrompt = prompt.prompt;
        } catch (error) {
          console.warn(`[langfuse] Prompt ${PROMPT_SLUG} fallback to local`, error);
          systemPrompt = await loadPromptWithHotReload(PROMPT_SLUG);
        }
      } else {
        systemPrompt = await loadPromptWithHotReload(PROMPT_SLUG);
      }
    }

    if (!systemPrompt) {
      return new Response('Failed to resolve system prompt', { status: 500 });
    }

    const telemetryMetadata: Record<string, unknown> = {
      route: 'generate-code',
      prompt: overrideSystem ? 'custom' : PROMPT_SLUG,
    };

    if (langfusePrompt) {
      telemetryMetadata.langfusePrompt = langfusePrompt;
    }

    const result = streamText({
      model: 'openai/gpt-5-2025-08-07',
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      providerOptions: {
        openai: {
          textVerbosity: 'high',
          reasoningEffort: 'medium',
        },
      },
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'code-generation',
        metadata: telemetryMetadata,
      },
      onFinish: async ({ text, usage }) => {
        updateActiveObservation({ output: text, usage });
        updateActiveTrace({ output: text, usage });
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

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('ERROR:', error);
    trace.getActiveSpan()?.end();
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error ?? 'Unknown error'),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};

export const POST = observe(handler, {
  name: 'handle-code-generation',
  endOnExit: false,
});
