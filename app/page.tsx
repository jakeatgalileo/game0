"use client"

import { useState } from "react"
import { LandingPage } from "@/components/landing-page"
import { HomePage } from "@/components/home-page"

export default function Page() {
  const [showHome, setShowHome] = useState(false)
  const [initialMessage, setInitialMessage] = useState("")

  const handleStart = (message: string) => {
    setInitialMessage(message)
    setShowHome(true)
  }

  if (showHome) {
    return <HomePage initialMessage={initialMessage} />
  }

  return <LandingPage onStart={handleStart} />
}
