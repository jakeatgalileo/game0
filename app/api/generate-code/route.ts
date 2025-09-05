import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import { loadPromptWithHotReload } from "@/lib/prompts";
import 'dotenv/config';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const system = body?.system as string | undefined;
    
    const systemPrompt = system || (await loadPromptWithHotReload("code-generation"));

    const result = streamText({
      model: "openai/gpt-5-2025-08-07",
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      providerOptions: {
        openai: {
          textVerbosity: "high",
          reasoningEffort: "minimal",
        },
      },
    });

    // Return AI SDK UI Message Stream (SSE) so the client can parse `data: { type, delta }` frames.
    return result.toUIMessageStreamResponse();
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
