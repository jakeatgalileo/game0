"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Download, Share, Settings } from "lucide-react"

export function MainComponent() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Game Preview</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-[6px] bg-transparent">
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
            <Button variant="outline" size="sm" className="rounded-[6px] bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="rounded-[6px] bg-transparent">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="sm" className="rounded-[6px]">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <Card className="h-full flex items-center justify-center rounded-[6px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-[6px] flex items-center justify-center mx-auto">
              <Play className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Ready to build your game?</h3>
              <p className="text-muted-foreground max-w-md">
                Start by describing your game idea in the chat. I'll help you create everything from simple puzzles to
                complex adventures.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm" className="rounded-[6px] bg-transparent">
                Platformer Game
              </Button>
              <Button variant="outline" size="sm" className="rounded-[6px] bg-transparent">
                Puzzle Game
              </Button>
              <Button variant="outline" size="sm" className="rounded-[6px] bg-transparent">
                Card Game
              </Button>
              <Button variant="outline" size="sm" className="rounded-[6px] bg-transparent">
                RPG Adventure
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
