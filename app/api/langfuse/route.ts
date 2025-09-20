import { NextResponse } from 'next/server';

import { loadPromptWithHotReload, type PromptType } from '@/lib/prompts';
import { tryGetLangfuseClient } from '@/lib/langfuse';

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

  const langfuse = tryGetLangfuseClient();

  if (langfuse) {
    try {
      const prompt = await langfuse.prompt.get(promptName, variant ? { variant } : undefined);
      const metadata = typeof prompt.toJSON === 'function' ? prompt.toJSON() : undefined;

      const response: PromptResponse = {
        source: 'langfuse',
        prompt: prompt.prompt,
        metadata,
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.warn('[langfuse] Falling back to local prompt:', error);
    }
  }

  if (!isPromptType(promptName)) {
    return NextResponse.json(
      { error: `Prompt ${promptName} not found` },
      { status: 404 },
    );
  }

  try {
    const prompt = await loadPromptWithHotReload(promptName);
    const response: PromptResponse = {
      source: 'local',
      prompt,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[langfuse] Unable to load prompt locally:', error);
    return NextResponse.json(
      { error: `Prompt ${promptName} not available` },
      { status: 404 },
    );
  }
}
