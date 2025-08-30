import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, UIMessage } from "ai";
import { loadPromptWithHotReload } from "@/lib/prompts";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response("OpenAI API key is missing", { status: 500 });
    }
    
    const { messages }: { messages: UIMessage[] } = await req.json();
    
    const systemPrompt = await loadPromptWithHotReload("game-planning")

    const result = streamText({
      model: openai("gpt-5-mini-2025-08-07"),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      providerOptions: {
        openai: {
          reasoningSummary: 'auto',
          textVerbosity: "medium",
          reasoningEffort: "medium",
        },
      },
    });

    return result.toUIMessageStreamResponse({sendReasoning: true});
  } catch (error) {
    console.log("Chat API Error:", error)
    return new Response("Internal Server Error", { status: 500 });
  }
}
