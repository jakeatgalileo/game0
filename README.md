# Game0 - AI Game Generator

This is an AI-powered game generation application built with [Vercel AI SDK 5](https://ai-sdk.dev) and streaming chat UI. It allows users to describe games in natural language and generates complete, playable HTML games.

## Getting Started

First, add your Vercel AI Gateway API key to `.env.local` file:

```
AI_GATEWAY_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **AI Game Planning**: Discuss and refine your game ideas through natural language conversation
- **Code Generation**: Automatically generate complete HTML games with embedded CSS and JavaScript
- **Live Preview**: See your generated games running immediately in an integrated web preview
- **Console Logging**: Monitor game generation process and debug any issues
- **Responsive Design**: Generated games work on both desktop and mobile devices

## How to Use

1. Start by describing your game idea in the chat interface
2. The AI will help you plan and refine the game concept
3. Click "Generate Code" to create your HTML game
4. Play your generated game directly in the browser preview

You can modify the system prompts in the `prompts/` directory to customize the AI behavior for game planning and code generation.

# TODO + Improvements

1. Either websearch for references to existing games and pull in those resources during runtimes or build an asset library to reference from.
2. Some things like the tools are hard-coded so need to implement a mechanism to get game design + UI elements. Maybe separate LLM calls?
