"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUp } from "lucide-react"

interface LandingPageProps {
  onStart: (message: string) => void
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [prompt, setPrompt] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onStart(prompt.trim())
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* Main heading */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 text-balance">
            What can I help you build?
          </h1>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask game0 to build..."
              className="w-full h-14 px-4 pr-12 text-lg bg-card border-border rounded-[6px] focus:ring-2 focus:ring-ring"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Button
                type="submit"
                size="sm"
                className={`h-8 w-8 p-0 rounded-[6px] ${
                  prompt.trim()
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
                disabled={!prompt.trim()}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
