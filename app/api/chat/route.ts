import { streamText, convertToModelMessages, UIMessage, stepCountIs } from "ai";
import { loadPromptWithHotReload } from "@/lib/prompts";
import { gameDescriptionsTools } from '@/app/tools/game-descriptions';
import 'dotenv/config';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    
    const systemPrompt = await loadPromptWithHotReload("game-planning")

    const result = streamText({
      model: "openai/gpt-5-mini-2025-08-07",
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      tools: gameDescriptionsTools,
      stopWhen: stepCountIs(5),
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
