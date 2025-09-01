"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { PromptInput, PromptInputTextarea, PromptInputToolbar, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { UIMessage, useChat } from "@ai-sdk/react";

type ChatProps = {
  className?: string;
  onAssistantTurnEnd?: (args: { messages: UIMessage[] }) => void;
};

export function Chat({ className, onAssistantTurnEnd }: ChatProps) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className={cn("bg-background text-foreground flex h-full flex-col", className)}>
      <div className="mx-auto w-full max-w-[48rem] flex-1 px-4">
        <Conversation>
          <ConversationContent className="flex min-w-0 flex-1 flex-col gap-4">
            {messages.length === 0 && (
              <div className="text-muted-foreground">
                <div className="text-lg font-medium mb-1">Start building your game</div>
                <div className="text-sm">Describe your game idea and I will help you create it.</div>
              </div>
            )}

            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts?.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <Response
                            key={`${message.id}-${i}`}
                            className={cn(
                              message.role === "assistant"
                                ? "bg-transparent text-foreground border-none shadow-none p-0"
                                : ""
                            )}
                          >
                            {part.text}
                          </Response>
                        );
                      case "reasoning":
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full text-foreground border-border"
                            isStreaming={status === "streaming"}
                          >
                            <ReasoningTrigger />
                            <ReasoningContent className="text-muted-foreground">{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      default:
                        return null;
                    }
                  })}
                </MessageContent>
              </Message>
            ))}

          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="mx-auto w-full max-w-[48rem] px-4">
        <PromptInput onSubmit={handleSubmit} className="relative w-full border-border">
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your game idea..."
            className="text-foreground placeholder:text-muted-foreground bg-input border-input focus:border-ring resize-none pr-14 pb-14"
          />

          <PromptInputToolbar className="absolute inset-x-0 bottom-0 flex items-center justify-end p-3">
            <PromptInputSubmit disabled={!input} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
