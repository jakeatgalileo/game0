"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Plus } from "lucide-react"
import { useChat } from "ai/react"

interface ChatComponentProps {
  initialMessage?: string
}

export function ChatComponent({ initialMessage }: ChatComponentProps) {
  const [inputMessage, setInputMessage] = useState("")

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      // Create a synthetic form event to trigger the chat
      const syntheticEvent = {
        preventDefault: () => {},
        target: { message: { value: initialMessage } },
      } as any

      // Set the input value and submit
      handleInputChange({ target: { value: initialMessage } } as any)
      setTimeout(() => {
        handleSubmit(syntheticEvent)
      }, 100)
    }
  }, [initialMessage, messages.length, handleInputChange, handleSubmit])

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">game0</h2>
          <Button variant="ghost" size="sm" className="rounded-[6px]">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Start building your game!</p>
              <p className="text-sm mt-2">Ask me to create any type of game you can imagine.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-[6px] ${
                  msg.role === "user" ? "bg-primary text-primary-foreground ml-4" : "bg-muted mr-4"
                }`}
              >
                {msg.content}
              </div>
            ))
          )}
          {isLoading && (
            <div className="bg-muted mr-4 p-3 rounded-[6px]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Describe your game idea..."
            className="flex-1 rounded-[6px]"
            disabled={isLoading}
          />
          <Button type="submit" size="sm" className="rounded-[6px]" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
