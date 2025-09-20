import { readFile } from 'fs/promises';
import { join } from 'path';

import { tryGetLangfuseClient } from '@/lib/langfuse';

export type PromptType = 'game-planning' | 'code-generation';

export type PromptSource = 'langfuse' | 'local';

export type PromptLoadResult = {
  prompt: string;
  source: PromptSource;
  metadata?: Record<string, unknown>;
};

type LangfusePromptOptions = {
  variant?: string;
  slug?: string;
};

// Cache to store loaded prompts in memory
const promptCache = new Map<PromptType, string>();

/**
 * Load a system prompt from the prompts directory
 * @param promptType - The type of prompt to load
 * @returns The prompt content as a string
 */
export async function loadPrompt(promptType: PromptType): Promise<string> {
  // Check cache first
  if (promptCache.has(promptType)) {
    return promptCache.get(promptType)!;
  }

  try {
    const promptPath = join(process.cwd(), 'prompts', `${promptType}.txt`);
    const promptContent = await readFile(promptPath, 'utf-8');
    
    // Cache the prompt for future requests
    promptCache.set(promptType, promptContent.trim());
    
    return promptContent.trim();
  } catch (error) {
    console.error(`Failed to load prompt: ${promptType}`, error);
    throw new Error(`Failed to load system prompt: ${promptType}`);
  }
}

export async function loadPromptWithLangfuseFallback(
  promptType: PromptType,
  options: LangfusePromptOptions = {},
): Promise<PromptLoadResult> {
  const langfuse = tryGetLangfuseClient();

  if (langfuse) {
    const candidateSlugs: string[] = [];
    const addCandidate = (slug?: string) => {
      if (!slug || candidateSlugs.includes(slug)) {
        return;
      }
      candidateSlugs.push(slug);
    };

    addCandidate(options.slug);

    const envPrefix = process.env.LANGFUSE_PROMPT_PREFIX;
    if (envPrefix) {
      addCandidate(`${envPrefix}${promptType}`);
    }

    addCandidate(`game0/${promptType}`);
    addCandidate(promptType);

    let lastError: unknown;
    let lastSlug: string | undefined;

    for (const slug of candidateSlugs) {
      try {
        const prompt = await langfuse.prompt.get(
          slug,
          options.variant ? { variant: options.variant } : undefined,
        );

        return {
          prompt: prompt.prompt,
          source: 'langfuse',
          metadata: typeof prompt.toJSON === 'function' ? prompt.toJSON() : undefined,
        };
      } catch (error) {
        lastError = error;
        lastSlug = slug;
      }
    }

    if (lastError) {
      const variantLabel = options.variant ? ` (variant: ${options.variant})` : '';
      const slugLabel = lastSlug ? ` (slug: ${lastSlug})` : '';
      console.warn(
        `[langfuse] Prompt ${promptType}${variantLabel}${slugLabel} fallback to local`,
        lastError,
      );
    }
  }

  const prompt = await loadPromptWithHotReload(promptType);
  return {
    prompt,
    source: 'local',
  };
}

/**
 * Clear the prompt cache (useful for development)
 */
export function clearPromptCache(): void {
  promptCache.clear();
}

/**
 * Load a prompt with development-friendly cache clearing
 * In development mode, we clear the cache to allow for hot reloading of prompts
 */
export async function loadPromptWithHotReload(promptType: PromptType): Promise<string> {
  // Clear cache in development mode
  if (process.env.NODE_ENV === 'development') {
    promptCache.delete(promptType);
  }
  
  return loadPrompt(promptType);
}
