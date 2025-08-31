"use client";

import { useCallback, useRef, useState } from "react";
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

const extractHtmlFromMessage = (content: string): string | null => {
  const htmlCodeBlockRegex = /```html\n([\s\S]*?)\n```/g;
  const match = htmlCodeBlockRegex.exec(content);
  return match ? match[1].trim() : null;
};

const GamePreview = ({
  onAssistantTurnEnd,
  gameCode,
}: {
  onAssistantTurnEnd?: (args: { messages: UIMessage[] }) => void;
  gameCode: string;
}) => {
  return (
    <div className="flex h-dvh w-full pr-0.5">
      <AppSidebar onAssistantTurnEnd={onAssistantTurnEnd} />
      <SidebarInset className="bg-background">
        <div className="flex-1 overflow-hidden pl-2 pr-4 py-4 bg-background">
          <WebPreview>
            <WebPreviewNavigation>
              <WebPreviewUrl disabled value={gameCode ? "Generated Game" : "Ready for your game..."} />
            </WebPreviewNavigation>
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
            <WebPreviewConsole />
          </WebPreview>
        </div>
      </SidebarInset>
    </div>
  );
};

export const Assistant = () => {
  const [gameCode, setGameCode] = useState("");
  const isGeneratingRef = useRef(false);
  const lastProcessedAssistantId = useRef<string | null>(null);

  const generateFromConversation = useCallback(
    async (payload: { messages: UIMessage[] }) => {
      if (isGeneratingRef.current || gameCode) return;
      const last = payload.messages[payload.messages.length - 1];
      if (!last || last.role !== "assistant") return;
      if (lastProcessedAssistantId.current === last.id) return;

      lastProcessedAssistantId.current = last.id;
      isGeneratingRef.current = true;
      try {
        const sanitized = payload.messages.map((m) => ({
          ...m,
          parts: m.parts?.filter((p) => p.type === "text"),
        }));
        const response = await fetch("/api/generate-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: sanitized }),
        });
        if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          // Minimal parsing for AI SDK DataStream frames: lines starting with "data: {..}"
          const lines = buffer.split(/\n/);
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const json = trimmed.slice(5).trim();
            if (json === "[DONE]") continue;
            try {
              const evt = JSON.parse(json);
              // Accumulate incremental text deltas
              if (evt.type === "text-delta" && typeof evt.delta === "string") {
                fullText += evt.delta;
              }
              if (evt.type === "message" && typeof evt.text === "string") {
                fullText += evt.text;
              }
            } catch {
              // ignore partial frames
            }
          }
        }

        const extracted = extractHtmlFromMessage(fullText);
        if (extracted) setGameCode(extracted);
      } catch (err) {
        console.error("Code generation error:", err);
      } finally {
        isGeneratingRef.current = false;
      }
    },
    [gameCode]
  );

  return (
    <SidebarProvider>
      <GamePreview onAssistantTurnEnd={generateFromConversation} gameCode={gameCode} />
    </SidebarProvider>
  );
};
