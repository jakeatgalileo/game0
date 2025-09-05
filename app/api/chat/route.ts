import { streamText, convertToModelMessages, UIMessage } from "ai";
import { loadPromptWithHotReload } from "@/lib/prompts";
import 'dotenv/config';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    
    const systemPrompt = await loadPromptWithHotReload("game-planning")

    // To enable tool calling for game descriptions, import the tool set
    // from '@/app/tools/game-descriptions' and pass it to `tools`.
    // Example (not enabled yet):
    // import { gameDescriptionsTools } from '@/app/tools/game-descriptions';
    // const result = streamText({
    //   model: 'openai/gpt-5-mini-2025-08-07',
    //   system: systemPrompt,
    //   messages: convertToModelMessages(messages),
    //   tools: gameDescriptionsTools,
    //   // Optionally: toolChoice or multi-step stopWhen
    //   // toolChoice: { type: 'tool', toolName: 'getGameDescription' },
    //   // stopWhen: stepCountIs(5),
    //   // providerOptions: { ... }
    // });

    const result = streamText({
      model: "openai/gpt-5-mini-2025-08-07",
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      providerOptions: {
        openai: {
          reasoningSummary: 'auto',
          textVerbosity: "low",
          reasoningEffort: "low",
        },
      },
    });

    return result.toUIMessageStreamResponse({sendReasoning: true});
  } catch (error) {
    console.log("Chat API Error:", error)
    return new Response("Internal Server Error", { status: 500 });
  }
}
