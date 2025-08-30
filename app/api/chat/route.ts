import { openai } from "@ai-sdk/openai";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
} from "ai";
import { loadPromptWithHotReload } from "@/lib/prompts";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  
  try {
    const systemPrompt = await loadPromptWithHotReload('game-planning');

    const result = streamText({
      model: openai("gpt-5-mini"),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      providerOptions:{
        openai:{
          textVerbosity: "medium",
          reasoningEffort: "medium"
        }
      }
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
