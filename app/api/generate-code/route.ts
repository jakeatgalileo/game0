import { openai } from "@ai-sdk/openai";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
} from "ai";
import { loadPromptWithHotReload } from "@/lib/prompts";

// Transform @assistant-ui messages to AI SDK format
const transformToAISDKFormat = (message: any): UIMessage => {
  return {
    role: message.role,
    content: message.content
  };
};

export async function POST(req: Request) {
  try {
    // Check environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY environment variable is not set');
      throw new Error('OpenAI API key is missing');
    }
    
    const { messages }: { messages: UIMessage[] } = await req.json();
    const systemPrompt = await loadPromptWithHotReload('code-generation');

    const cleanMessages = messages.map(transformToAISDKFormat);

    const result = streamText({
      model: openai("gpt-5-mini"),
      system: systemPrompt,
      messages: convertToModelMessages(cleanMessages),
      providerOptions:{
        openai:{
          textVerbosity: "medium",
          reasoningEffort: "low"
        }
      }
    });

    console.log('Returning stream response...');
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Code generation API error details:');
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      details: error?.message || 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}