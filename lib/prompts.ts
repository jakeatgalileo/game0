import { readFile } from 'fs/promises';
import { join } from 'path';

export type PromptType = 'game-planning' | 'code-generation';

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