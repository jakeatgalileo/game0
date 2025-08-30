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
import { useState, useEffect, useCallback } from "react";
import { useThreadRuntime } from "@assistant-ui/react";
import { Button } from "@/components/ui/button";

const extractHtmlFromMessage = (content: string): string | null => {
  const htmlCodeBlockRegex = /```html\n([\s\S]*?)\n```/g;
  const match = htmlCodeBlockRegex.exec(content);
  return match ? match[1].trim() : null;
};

const GamePreview = () => {
  const [gameCode, setGameCode] = useState("");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<Array<{
    level: 'log' | 'warn' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);
  const threadRuntime = useThreadRuntime();

  const addConsoleLog = useCallback((level: 'log' | 'warn' | 'error' | 'info', message: string) => {
    setConsoleLogs(prev => [...prev, { level, message, timestamp: new Date() }]);
  }, []);

  const clearConsoleLogs = useCallback(() => {
    setConsoleLogs([]);
  }, []);

  const generateGameCode = useCallback(async () => {
    setIsGeneratingCode(true);
    addConsoleLog('info', 'Starting code generation...');
    
    try {
      // Get current conversation messages
      const state = threadRuntime.getState();
      const messages = state.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content
          .filter(c => c.type === 'text')
          .map(c => c.text)
          .join('')
      }));

      addConsoleLog('info', 'Calling code generation API...');
      
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullResponse = '';
      addConsoleLog('info', 'Streaming code generation response...');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const data = JSON.parse(line.slice(2));
              if (data.content && data.content[0]?.text) {
                fullResponse += data.content[0].text;
              }
            } catch {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }

      addConsoleLog('info', 'Extracting HTML code from response...');
      const extractedCode = extractHtmlFromMessage(fullResponse);
      
      if (extractedCode) {
        setGameCode(extractedCode);
        addConsoleLog('log', 'Game code generated successfully!');
        addConsoleLog('log', `Generated ${extractedCode.length} characters of HTML/CSS/JS`);
      } else {
        addConsoleLog('warn', 'No HTML code found in response. Please try again.');
      }

    } catch (error) {
      console.error('Code generation error:', error);
      addConsoleLog('error', `Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingCode(false);
    }
  }, [threadRuntime, addConsoleLog]);

  useEffect(() => {
    const handleMessageUpdate = () => {
      // No longer auto-extract code from chat messages
      // Code generation now happens only when Generate Code button is clicked
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
                <BreadcrumbPage>
                  {gameCode ? "Game Preview" : "Game Planning"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <Button 
              onClick={generateGameCode}
              disabled={isGeneratingCode}
              variant="default"
              size="sm"
            >
              {isGeneratingCode ? "Generating..." : "Generate Code"}
            </Button>
          </div>
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
              <WebPreviewConsole 
                logs={consoleLogs}
                onClearLogs={clearConsoleLogs}
              />
            </WebPreview>
          ) : (
            <div className="flex h-full">
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-6xl opacity-20">💬</div>
                  <h2 className="text-2xl font-semibold text-muted-foreground">
                    Game Planning Phase
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Start by describing your game idea in the sidebar. I&apos;ll help you plan the game mechanics, design, and features before generating the code.
                  </p>
                  <p className="text-sm text-muted-foreground/75 max-w-md">
                    Once you&apos;re happy with the game plan, click &quot;Generate Code&quot; to create your playable HTML game.
                  </p>
                </div>
              </div>
              {consoleLogs.length > 0 && (
                <div className="w-96 border-l">
                  <WebPreviewConsole 
                    logs={consoleLogs}
                    onClearLogs={clearConsoleLogs}
                  />
                </div>
              )}
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
