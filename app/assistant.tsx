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
import { useState, useEffect, useCallback, useRef } from "react";
import { useThreadRuntime } from "@assistant-ui/react";

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
  const lastProcessedMessageId = useRef<string | null>(null);

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
      const messages = state.messages;
      
      // Debug: Log the actual message structure
      console.log('=== DEBUGGING MESSAGES ===');
      console.log('state.messages length:', messages?.length);
      console.log('First message structure:', messages[0]);
      console.log('First message content:', messages[0]?.content);
      console.log('All messages:', JSON.stringify(messages, null, 2));
      console.log('=========================');

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
      const state = threadRuntime.getState();
      const messages = state.messages;
      
      // Only process when streaming is complete
      if (state.isRunning) {
        return;
      }
      
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        
        // Check if this is a new assistant message we haven't processed yet
        if (lastMessage.role === 'assistant' && 
            lastMessage.id !== lastProcessedMessageId.current &&
            lastMessage.content.some(c => c.type === 'text' && c.text.trim().length > 0) &&
            !isGeneratingCode && 
            !gameCode) {
          
          // Mark this message as processed
          lastProcessedMessageId.current = lastMessage.id;
          
          // Generate code immediately (no delay needed since streaming is done)
          generateGameCode();
        }
      }
    };

    // Initial check
    handleMessageUpdate();

    // Subscribe to thread updates
    return threadRuntime.subscribe(() => {
      handleMessageUpdate();
    });
  }, [threadRuntime, generateGameCode, isGeneratingCode, gameCode]);

  return (
    <div className="flex h-dvh w-full pr-0.5">
      <AppSidebar />
      <SidebarInset className="bg-gray-900">
        <div className="flex-1 overflow-hidden p-4 bg-gray-900">
          <WebPreview>
            <WebPreviewNavigation>
              <WebPreviewUrl disabled value={gameCode ? "Generated Game" : "Ready for your game..."} />
            </WebPreviewNavigation>
            {gameCode ? (
              <WebPreviewBody 
                src={`data:text/html;charset=utf-8,${encodeURIComponent(gameCode)}`}
              />
            ) : (
              <div className="flex-1 bg-white flex items-center justify-center rounded-b-lg">
                <div className="text-center space-y-4 text-muted-foreground">
                  <div className="text-4xl opacity-30">🎮</div>
                  <p className="text-lg">Your game will appear here</p>
                </div>
              </div>
            )}
            {consoleLogs.length > 0 && (
              <WebPreviewConsole 
                logs={consoleLogs}
                onClearLogs={clearConsoleLogs}
              />
            )}
          </WebPreview>
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
