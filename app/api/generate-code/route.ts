import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import { loadPromptWithHotReload } from "@/lib/prompts";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY environment variable is not set");
      throw new Error("OpenAI API key is missing");
    }
    
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const system = body?.system as string | undefined;
    
    const systemPrompt = system || (await loadPromptWithHotReload("code-generation"));
   
    console.log("Messages:", messages);

    console.log("Initializing OpenAI model...");
    const result = streamText({
      model: openai("gpt-5-mini"),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      providerOptions: {
        openai: {
          textVerbosity: "medium",
          reasoningEffort: "low",
        },
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.log("ERROR: ", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error || "Unknown error",
      }),
      {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
    );
  }
}
