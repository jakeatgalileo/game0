'use client'

import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from "react"
import { Highlight, themes, Language } from "prism-react-renderer"
import { cn } from "@/lib/utils"

// Public API for parents to push chunks
export type StreamedCodeHandle = {
  append: (chunk: string) => void
  clear: () => void
}

type StreamedCodeProps = {
  language?: Language // e.g., "markup" for HTML
  className?: string
  autoScroll?: boolean
  maxLines?: number // optional soft cap to prevent runaway buffers
  stream?: AsyncIterable<string> // optional async source of chunks
  onReady?: (api: StreamedCodeHandle) => void // alternative to ref
  title?: string
}

// Helper: turn a browser Response with a ReadableStream into an AsyncIterable<string>
export async function* responseToTextStream(res: Response): AsyncIterable<string> {
  const reader = res.body?.getReader()
  if (!reader) return
  const decoder = new TextDecoder()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      yield decoder.decode(value, { stream: true })
    }
  } finally {
    reader.releaseLock()
  }
}

// Helper to keep only last N lines if maxLines is set
function clampLines(input: string, maxLines?: number) {
  if (!maxLines) return input
  const lines = input.split("\n")
  if (lines.length <= maxLines) return input
  return lines.slice(lines.length - maxLines).join("\n")
}

const StreamedCode = forwardRef<StreamedCodeHandle, StreamedCodeProps>(
  (
    {
      language = "markup",
      className,
      autoScroll = true,
      maxLines,
      stream,
      onReady,
      title = "Streaming HTML"
    },
    ref
  ) => {
    const [code, setCode] = useState("")
    const viewportRef = useRef<HTMLDivElement | null>(null)

    const append = useCallback((chunk: string) => {
      setCode(prev => clampLines(prev + chunk, maxLines))
    }, [maxLines])
    
    const clear = useCallback(() => setCode(""), [])

    useImperativeHandle(ref, () => ({ append, clear }), [append, clear])
    useEffect(() => { onReady?.({ append, clear }) }, [onReady, append, clear])

    // If a stream is provided, consume it
    useEffect(() => {
      if (!stream) return
      let cancelled = false
      ;(async () => {
        try {
          for await (const chunk of stream) {
            if (cancelled) break
            append(String(chunk))
          }
        } catch {
          // no-op: consumer can handle errors upstream
        }
      })()
      return () => { cancelled = true }
    }, [stream, append])

    // Auto scroll to bottom on updates
    useEffect(() => {
      if (!autoScroll || !viewportRef.current) return
      const el = viewportRef.current
      el.scrollTop = el.scrollHeight
    }, [code, autoScroll])

    const theme = useMemo(() => themes.github, [])

    return (
      <div className={cn("relative rounded-xl bg-background text-foreground p-6 md:p-8", className)}>
        {/* Code viewport (fills container) */}
        <div ref={viewportRef} className="h-full overflow-auto no-scrollbar">
          <Highlight theme={theme} code={code} language={language}>
            {({ className: c, style, tokens, getLineProps, getTokenProps }) => (
              <pre className={`${c} m-0 font-mono text-[13px] leading-6`} style={{ ...style, background: "transparent" }}>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>

        {/* Edge fades (top & bottom) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-background to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background to-transparent" />
      </div>
    )
  }
)

StreamedCode.displayName = "StreamedCode"

export default StreamedCode
