"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  WebPreview, 
  WebPreviewNavigation, 
  WebPreviewUrl, 
  WebPreviewBody,
  WebPreviewConsole 
} from "@/components/web-preview";
import { useState, useEffect } from "react";
import { useThreadRuntime } from "@assistant-ui/react";

const extractHtmlFromMessage = (content: string): string | null => {
  const htmlCodeBlockRegex = /```html\n([\s\S]*?)\n```/g;
  const match = htmlCodeBlockRegex.exec(content);
  return match ? match[1].trim() : null;
};

const GamePreview = () => {
  const [gameCode, setGameCode] = useState("");
  const threadRuntime = useThreadRuntime();

  useEffect(() => {
    const handleMessageUpdate = () => {
      try {
        const state = threadRuntime.getState();
        if (!state.messages || state.messages.length === 0) return;
        
        const lastAssistantMessage = state.messages
          .filter(m => m.role === 'assistant')
          .pop();
        
        if (lastAssistantMessage && lastAssistantMessage.content) {
          const content = lastAssistantMessage.content
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('');
          
          const extractedCode = extractHtmlFromMessage(content);
          if (extractedCode) {
            setGameCode(extractedCode);
          }
        }
      } catch (error) {
        console.error('Error extracting game code:', error);
      }
    };

    // Initial check
    handleMessageUpdate();

    // Subscribe to thread updates
    return threadRuntime.subscribe(() => {
      handleMessageUpdate();
    });
  }, [threadRuntime]);

  return (
    <div className="flex h-dvh w-full pr-0.5">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="https://www.assistant-ui.com/docs/getting-started" target="_blank" rel="noopener noreferrer">
                  Game Generator
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Game Preview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex-1 overflow-hidden p-4">
          {gameCode ? (
            <WebPreview>
              <WebPreviewNavigation>
                <WebPreviewUrl disabled value="Generated Game" />
              </WebPreviewNavigation>
              <WebPreviewBody 
                src={`data:text/html;charset=utf-8,${encodeURIComponent(gameCode)}`}
              />
              <WebPreviewConsole />
            </WebPreview>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl opacity-20">🎮</div>
                <h2 className="text-2xl font-semibold text-muted-foreground">
                  Game Preview
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Start chatting in the sidebar to generate your first game! Describe any game you want to create.
                </p>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </div>
  );
};

export const Assistant = () => {
  const runtime = useChatRuntime();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <GamePreview />
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
