
import { LangfuseClient } from '@langfuse/client';

let client: LangfuseClient | null = null;

const hasCredentials = () =>
  Boolean(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY);

export function getLangfuseClient(): LangfuseClient {
  if (!hasCredentials()) {
    throw new Error('Missing Langfuse credentials');
  }

  if (!client) {
    client = new LangfuseClient({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
      secretKey: process.env.LANGFUSE_SECRET_KEY!,
      baseUrl: process.env.LANGFUSE_BASE_URL,
    });
  }

  return client;
}

export function tryGetLangfuseClient(): LangfuseClient | null {
  if (!hasCredentials()) {
    return null;
  }

  return getLangfuseClient();
}
