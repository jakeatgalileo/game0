import { LangfuseSpanProcessor, type ShouldExportSpan } from '@langfuse/otel';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

type GlobalWithLangfuse = typeof globalThis & {
  __langfuseTracerProvider?: NodeTracerProvider;
  __langfuseSpanProcessor?: LangfuseSpanProcessor;
};

const globalRef = globalThis as GlobalWithLangfuse;

if (!globalRef.__langfuseSpanProcessor) {
  const shouldExportSpan: ShouldExportSpan = (span) =>
    span.otelSpan.instrumentationScope.name !== 'next.js';

  const environment =
    process.env.LANGFUSE_TRACING_ENVIRONMENT ??
    process.env.LANGFUSE_ENVIRONMENT ??
    process.env.NODE_ENV ??
    'development';

  globalRef.__langfuseSpanProcessor = new LangfuseSpanProcessor({
    shouldExportSpan,
    baseUrl: process.env.LANGFUSE_BASE_URL,
    environment,
  });

  globalRef.__langfuseTracerProvider = new NodeTracerProvider({
    spanProcessors: [globalRef.__langfuseSpanProcessor],
  });

  globalRef.__langfuseTracerProvider.register();
}

export const langfuseSpanProcessor = (globalRef.__langfuseSpanProcessor as LangfuseSpanProcessor)!;
