"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { PromptInput, PromptInputTextarea, PromptInputToolbar, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Loader } from "@/components/ai-elements/loader";
import { UIMessage, useChat } from '@ai-sdk/react';

type ChatProps = {
  className?: string;
  onAssistantTurnEnd?: (args: { messages: UIMessage[] }) => void;
};

export function Chat({ className, onAssistantTurnEnd }: ChatProps) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    api: '/api/chat',
    onFinish: (message, { finishReason }) => {
      console.log("🏁 Chat finished with reason:", finishReason);
      console.log("📨 Final message object:", message);
      console.log("📋 All messages after completion:", messages);
      onAssistantTurnEnd?.({ messages: [...messages, message] });
    },
    onError: (error) => {
      console.error("❌ Chat error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className={cn("bg-gray-900 text-white flex h-full flex-col", className)}>
      <Conversation>
        <ConversationContent className="flex min-w-0 flex-1 flex-col gap-4">
          {messages.length === 0 && (
            <div className="text-gray-400">
              <div className="text-lg font-medium mb-1">Start building your game</div>
              <div className="text-sm">Describe your game idea and I will help you create it.</div>
            </div>
          )}

          {messages.map((message) => {
            console.log(`🔍 Rendering message ${message.id} (${message.role}):`, message);
            console.log(`📦 Message parts (${message.parts?.length || 0}):`, message.parts);
            
            return (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts?.map((part, i) => {
                    console.log(`🧩 Rendering part ${i} of type "${part.type}":`, part);
                    
                    switch (part.type) {
                      case 'text':
                        console.log(`📝 Rendering text part: "${part.text?.substring(0, 100)}..."`);
                        return (
                          <Response key={`${message.id}-${i}`}>
                            {part.text}
                          </Response>
                        );
                      case 'reasoning':
                        console.log(`🧠 Rendering reasoning part: "${part.text?.substring(0, 100)}..."`);
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full"
                            isStreaming={status === 'streaming'}
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      default:
                        console.log(`❓ Unknown part type: "${part.type}"`);
                        return null;
                    }
                  }) || (
                    <div>
                      {console.log(`⚠️ No parts found for message ${message.id}, rendering as text fallback`)}
                      <Response>{message.content || 'No content'}</Response>
                    </div>
                  )}
                </MessageContent>
              </Message>
            );
          })}

          {status === 'streaming' && <Loader />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={handleSubmit} className="mx-auto w-full max-w-[48rem] px-4 pb-4 md:pb-6">
        <PromptInputTextarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your game idea..."
        />
        <PromptInputToolbar>
          <div></div>
          <PromptInputSubmit disabled={!input} status={status} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}
