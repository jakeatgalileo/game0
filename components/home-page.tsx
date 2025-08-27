"use client"

import { ChatComponent } from "@/components/chat-component"
import { MainComponent } from "@/components/main-component"

interface HomePageProps {
  initialMessage?: string
}

export function HomePage({ initialMessage }: HomePageProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Chat sidebar */}
      <div className="w-80 border-r border-border">
        <ChatComponent initialMessage={initialMessage} />
      </div>

      {/* Main content area */}
      <div className="flex-1">
        <MainComponent />
      </div>
    </div>
  )
}
