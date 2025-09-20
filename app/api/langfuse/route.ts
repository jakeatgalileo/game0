import { NextResponse } from 'next/server';

import { loadPromptWithLangfuseFallback, type PromptType } from '@/lib/prompts';

export const runtime = 'nodejs';

type PromptResponse = {
  source: 'langfuse' | 'local';
  prompt: string;
  metadata?: Record<string, unknown>;
};

const isPromptType = (value: string): value is PromptType =>
  value === 'game-planning' || value === 'code-generation';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const promptName = url.searchParams.get('prompt');
  const variant = url.searchParams.get('variant') ?? undefined;

  if (!promptName) {
    return NextResponse.json(
      { error: 'Missing required "prompt" query parameter' },
      { status: 400 },
    );
  }

  const envPrefix = process.env.LANGFUSE_PROMPT_PREFIX;

  let normalizedPromptName = promptName;

  if (envPrefix && promptName.startsWith(envPrefix)) {
    normalizedPromptName = promptName.slice(envPrefix.length);
  } else if (promptName.startsWith('game0/')) {
    normalizedPromptName = promptName.slice('game0/'.length);
  }

  if (!isPromptType(normalizedPromptName)) {
    return NextResponse.json(
      { error: `Prompt ${promptName} not found` },
      { status: 404 },
    );
  }

  try {
    const result = await loadPromptWithLangfuseFallback(normalizedPromptName, {
      slug: promptName,
      variant,
    });

    const response: PromptResponse = {
      source: result.source,
      prompt: result.prompt,
    };

    if (result.metadata) {
      response.metadata = result.metadata;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[langfuse] Unable to load prompt:', error);
    return NextResponse.json(
      { error: `Prompt ${promptName} not available` },
      { status: 404 },
    );
  }
}
