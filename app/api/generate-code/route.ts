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
    const systemPrompt = await loadPromptWithHotReload('code-generation');

    const result = streamText({
      model: openai("gpt-5"),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      providerOptions:{
        openai:{
          textVerbosity: "medium",
          reasoningEffort: "low"
        }
      }
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Code generation API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}