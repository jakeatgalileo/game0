"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import StreamedCode, { StreamedCodeHandle } from "@/components/StreamedCode";
import TetrisLoadingGame from "@/components/tetris-loading-game";
import { Button } from "@/components/ui/button";
import { PauseIcon, PlayIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";

type LoadingScreenProps = {
  codeRef: React.RefObject<StreamedCodeHandle | null>;
  bytes: number;
  lines: number;
  startedAt: number; // epoch ms
  onCancel?: () => void;
};

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatElapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return m > 0 ? `${m}:${ss.toString().padStart(2, "0")}` : `${ss}s`;
}

export default function LoadingScreen({ codeRef, bytes, lines, startedAt, onCancel }: LoadingScreenProps) {
  const [paused, setPaused] = useState(false);
  const [showStream, setShowStream] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsed = Math.max(0, now - startedAt);

  return (
    <div className="flex h-full w-full flex-col p-4" aria-busy="true">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary animate-pulse" aria-hidden />
          <div className="text-sm font-medium">Generating Game HTML…</div>
          <span className="sr-only" role="status" aria-live="polite">
            Streaming game HTML. {formatBytes(bytes)} received, {lines} lines.
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div><span className="text-foreground font-medium">{formatBytes(bytes)}</span> streamed</div>
          <div><span className="text-foreground font-medium">{lines}</span> lines</div>
          <div><span className="text-foreground font-medium">{formatElapsed(elapsed)}</span> elapsed</div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setPaused(p => !p)}>
            {paused ? <PlayIcon className="size-4" /> : <PauseIcon className="size-4" />}
            <span className="ml-1 hidden sm:inline">{paused ? "Resume" : "Pause"} Tetris</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowStream(s => !s)}>
            {showStream ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            <span className="ml-1 hidden sm:inline">{showStream ? "Hide" : "Show"} Stream</span>
          </Button>
          <Button size="sm" variant="destructive" onClick={onCancel}>
            <XIcon className="size-4" />
            <span className="ml-1 hidden sm:inline">Cancel</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2">
        {/* Stream panel */}
        {showStream && (
          <div className="min-h-0 overflow-hidden rounded-lg border bg-card">
            <div className="border-b px-3 py-2 text-xs text-muted-foreground">HTML Stream</div>
            <div className="min-h-0 h-full max-h-full">
              <StreamedCode ref={codeRef as any} title="Generating Game Code..." language="markup" className="h-[60vh] md:h-full w-full" />
            </div>
          </div>
        )}

        {/* Tetris panel */}
        <div className={cn("min-h-0 overflow-hidden rounded-lg border bg-card", !showStream && "md:col-span-2")}> 
          <div className="border-b px-3 py-2 text-xs text-muted-foreground">Play Tetris while you wait</div>
          <div className="min-h-0 h-full max-h-full p-3">
            <TetrisLoadingGame size={showStream ? "mini" : "focus"} paused={paused} onPausedChange={setPaused} captureKeyboardWhenFocusedOnly className="mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
