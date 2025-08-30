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

    console.log("📥 Incoming Messages:", messages);

    const result = streamText({
      // Use a reasoning-capable model; gpt-5 with reasoningEffort or switch to o3-mini
      model: openai("gpt-5-mini"),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      providerOptions: {
        openai: {
          textVerbosity: "medium",
          reasoningEffort: "medium",
        },
      },
    });

    // Log the response structure when complete
    result.finishReason.then((finishReason) => {
      console.log("✅ Stream finished with reason:", finishReason);
    });

    result.text.then((text) => {
      console.log("📝 Final text response:", text);
    });

    result.reasoning.then((reasoning) => {
      console.log("🧠 Reasoning content:", reasoning);
    });

    const response = result.toUIMessageStreamResponse({sendReasoning: true});
    console.log("🚀 Sending UIMessage stream response with reasoning enabled");
    
    return response;
  } catch (error) {
    console.log("ERROR: ", error)
    return new Response("Internal Server Error", { status: 500 });
  }
}
