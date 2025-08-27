import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: openai("gpt-4o"),
    system: `You are game0, an AI assistant specialized in helping users create games. You can help with:
    - Game concept development and design
    - Code generation for various game frameworks
    - Game mechanics and balancing
    - Art and asset suggestions
    - Technical implementation guidance
    
    Keep responses focused on game development and be creative and helpful.`,
    messages,
  })

  return result.toDataStreamResponse()
}
