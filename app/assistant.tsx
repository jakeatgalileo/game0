"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
  WebPreviewConsole,
} from "@/components/web-preview";
import { UIMessage } from "@ai-sdk/react";
import StreamedCode, { StreamedCodeHandle } from "@/components/StreamedCode";
import LoadingScreen from "@/components/loading-screen";

const extractHtmlFromMessage = (content: string): string | null => {
  // Be lenient: allow optional newline before closing backticks and CRLFs
  const htmlFence = /```html\r?\n([\s\S]*?)\r?\n?```/i;
  const m = htmlFence.exec(content);
  if (m && m[1]) return m[1].trim();
  // Fallback: if the content looks like raw HTML, return it directly
  if (/<!DOCTYPE html|<html[\s>]/i.test(content)) return content.trim();
  return null;
};

const wrapGameHtml = (html: string) =>
  [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<style>',
    'html, body { height:100%; margin:0; }',
    '#game-container { position: relative; width:100%; height:100%; overflow:visible; }',
    'canvas, img, video { max-width:100%; height:auto; display:block; }',
    '</style>',
    '</head>',
    '<body>',
    '<div id="game-container">',
    html,
    '</div>',
    '</body>',
    '</html>',
  ].join('\n');

const GamePreview = ({
  onAssistantTurnEnd,
  gameCode,
  isGenerating,
  streamedCodeRef,
  bytes,
  lines,
  startedAt,
  onCancel,
}: {
  onAssistantTurnEnd?: (args: { messages: UIMessage[] }) => void;
  gameCode: string;
  isGenerating: boolean;
  streamedCodeRef: React.RefObject<StreamedCodeHandle | null>;
  bytes: number;
  lines: number;
  startedAt: number;
  onCancel: () => void;
}) => {
  const [showLoading, setShowLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (isGenerating) {
      setShowLoading(true);
      setFadeOut(false);
    } else {
      if (gameCode) {
        setFadeOut(true);
        const t = setTimeout(() => setShowLoading(false), 350);
        return () => clearTimeout(t);
      } else {
        setShowLoading(false);
        setFadeOut(false);
      }
    }
  }, [isGenerating, gameCode]);

  return (
    <div className="flex h-dvh w-full pr-0.5">
      <AppSidebar onAssistantTurnEnd={onAssistantTurnEnd} />
      <SidebarInset className="bg-background">
        <div className="flex-1 overflow-hidden pl-2 pr-4 py-4 bg-background">
          <WebPreview>
            <WebPreviewNavigation>
              <WebPreviewUrl disabled value={gameCode ? "Generated Game" : "Ready for your game..."} />
            </WebPreviewNavigation>
            <span className="sr-only" role="status" aria-live="polite">
              {isGenerating ? "Generating game…" : gameCode ? "Game ready" : "Idle"}
            </span>
            <div className="relative flex-1 min-h-[50vh]">
              {gameCode ? (
                <WebPreviewBody src={`data:text/html;charset=utf-8,${encodeURIComponent(gameCode)}`} />
              ) : (
                <div className="flex-1 bg-background flex items-center justify-center rounded-b-lg">
                  <div className="text-center space-y-4 text-muted-foreground">
                    <div className="text-4xl opacity-30">🎮</div>
                    <p className="text-lg">Your game will appear here</p>
                  </div>
                </div>
              )}
              {showLoading && (
                <div className={`absolute inset-0 transition-opacity duration-300 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} aria-busy={!fadeOut}>
                  <LoadingScreen
                    codeRef={streamedCodeRef}
                    bytes={bytes}
                    lines={lines}
                    startedAt={startedAt}
                    onCancel={onCancel}
                  />
                </div>
              )}
            </div>
            <WebPreviewConsole />
          </WebPreview>
        </div>
      </SidebarInset>
    </div>
  );
};

export const Assistant = () => {
  const [gameCode, setGameCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);
  const lastProcessedAssistantId = useRef<string | null>(null);
  const streamedCodeRef = useRef<StreamedCodeHandle | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [bytes, setBytes] = useState(0);
  const [lines, setLines] = useState(0);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());

  // Disable persistence for now: ensure any previously saved HTML is removed.
  useEffect(() => {
    try { localStorage.removeItem("gameCodeHtml"); } catch {}
  }, []);

  const generateFromConversation = useCallback(
    async (payload: { messages: UIMessage[] }) => {
      if (isGeneratingRef.current) return;
      const last = payload.messages[payload.messages.length - 1];
      if (!last || last.role !== "assistant") return;
      if (lastProcessedAssistantId.current === last.id) return;

      lastProcessedAssistantId.current = last.id;
      isGeneratingRef.current = true;
      setIsGenerating(true);
      setBytes(0);
      setLines(0);
      setStartedAt(Date.now());
      streamedCodeRef.current?.clear();
      try {
        const sanitized = payload.messages.map((m) => ({
          ...m,
          parts: m.parts?.filter((p) => p.type === "text"),
        }));
        const controller = new AbortController();
        abortRef.current = controller;
        const response = await fetch("/api/generate-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: sanitized }),
          signal: controller.signal,
        });
        if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const isSSE = /text\/event-stream/i.test(response.headers.get("content-type") || "");
        let buffer = "";
        let fullText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          if (isSSE) {
            // Parse AI SDK UI Message Stream frames: lines starting with "data: {..}"
            const lines = buffer.split(/\n/);
            buffer = lines.pop() || "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const json = trimmed.slice(5).trim();
              if (json === "[DONE]") continue;
              try {
                const evt = JSON.parse(json);
                if (evt.type === "text-delta" && typeof evt.delta === "string") {
                  fullText += evt.delta;
                  streamedCodeRef.current?.append(evt.delta);
                  try {
                    const b = new TextEncoder().encode(evt.delta).length;
                    setBytes((x) => x + b);
                  } catch {
                    setBytes((x) => x + evt.delta.length);
                  }
                  const nl = (evt.delta.match(/\n/g) || []).length;
                  if (nl) setLines((x) => x + nl);
                }
                // Some streams may emit full message text at the end
                if (evt.type === "message" && typeof evt.text === "string") {
                  fullText += evt.text;
                }
              } catch {
                // ignore partial frames
              }
            }
          } else {
            // Fallback: plain text streaming (no SSE)
            fullText += buffer;
            streamedCodeRef.current?.append(buffer);
            try {
              const b = new TextEncoder().encode(buffer).length;
              setBytes((x) => x + b);
            } catch {
              setBytes((x) => x + buffer.length);
            }
            const nl = (buffer.match(/\n/g) || []).length;
            if (nl) setLines((x) => x + nl);
            buffer = "";
          }
        }

        const extracted = extractHtmlFromMessage(fullText);
        if (extracted) {
          const wrapped = wrapGameHtml(extracted);
          setGameCode(wrapped);
        }
      } catch (err) {
        if ((err as any)?.name === 'AbortError') {
          // cancelled
        } else {
          console.error("Code generation error:", err);
        }
      } finally {
        isGeneratingRef.current = false;
        setIsGenerating(false);
        abortRef.current = null;
      }
    },
    []
  );

  return (
    <SidebarProvider>
      <GamePreview 
        onAssistantTurnEnd={generateFromConversation} 
        gameCode={gameCode}
        isGenerating={isGenerating}
        streamedCodeRef={streamedCodeRef}
        bytes={bytes}
        lines={lines}
        startedAt={startedAt}
        onCancel={() => abortRef.current?.abort()}
      />
    </SidebarProvider>
  );
};
