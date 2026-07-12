"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { formatMessageTime } from "@/lib/format-time"
import { isSpeechSupported, speakSpanish } from "@/lib/speech"
import type { Message } from "@/lib/chat-data"
import { Sparkles, User, Volume2 } from "lucide-react"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const isError = message.content.startsWith("❌")
  const [canSpeak, setCanSpeak] = useState(false)

  useEffect(() => {
    setCanSpeak(isSpeechSupported())
  }, [])

  function handleSpeak() {
    if (!canSpeak || isError) return
    speakSpanish(message.content)
  }

  return (
    <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
          <Sparkles className="size-4" />
        </div>
      )}

      <div className={cn("flex max-w-[78%] flex-col gap-1 sm:max-w-[70%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "glass rounded-bl-md border border-border text-foreground",
          )}
        >
          <p className="whitespace-pre-wrap text-pretty">{message.content}</p>
        </div>
        <div className="flex items-center gap-1 px-1">
          <span className="text-xs text-muted-foreground">{formatMessageTime(message.timestamp)}</span>
          {!isUser && canSpeak && !isError && (
            <button
              type="button"
              onClick={handleSpeak}
              className="focus-ring rounded p-0.5 text-muted-foreground transition-colors hover:text-primary"
              aria-label="Listen to pronunciation"
              title="Listen in Spanish"
            >
              <Volume2 className="size-3.5" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <User className="size-4" />
        </div>
      )}
    </div>
  )
}
