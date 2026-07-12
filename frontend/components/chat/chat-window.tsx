"use client"

import { useEffect, useRef } from "react"
import type { Conversation, Message } from "@/lib/chat-data"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { TypingIndicator } from "./typing-indicator"
import { PanelLeft, Sparkles } from "lucide-react"

interface ChatWindowProps {
  conversation: Conversation | undefined
  onSend: (text: string, attachments?: Message["attachments"]) => void
  onOpenSidebar: () => void
  onError?: (message: string) => void
  isAiTyping?: boolean
}

export function ChatWindow({ conversation, onSend, onOpenSidebar, onError, isAiTyping = false }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scrollToBottom() {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages.length, conversation?.id, isAiTyping])

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      {/* Header */}
      <header className="glass flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="focus-ring rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          aria-label="Open sidebar"
        >
          <PanelLeft className="size-5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-foreground">
            {conversation?.title ?? "New chat"}
          </h1>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            HablaAI 1.0 · online
          </p>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
          {conversation && conversation.messages.length > 0 ? (
            <>
              {conversation.messages.map((m: Message) => <ChatMessage key={m.id} message={m} />)}
              {isAiTyping && <TypingIndicator />}
            </>
          ) : isAiTyping ? (
            <TypingIndicator />
          ) : (
            <EmptyState onSend={onSend} />
          )}
        </div>
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSend}
        disabled={isAiTyping}
        onFocus={scrollToBottom}
        onError={onError}
        focusKey={conversation?.id}
      />
    </div>
  )
}

function EmptyState({ onSend }: { onSend: (text: string) => void }) {
  const suggestions = [
    "How do I say hello in Spanish?",
    "Correct my Spanish sentence",
    "Practice ordering food in Spanish",
    "Quiz me on basic vocabulary",
  ]
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
        <Sparkles className="size-7" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-balance text-xl font-semibold text-foreground">
          What would you like to practice today?
        </h2>
        <p className="text-pretty text-sm text-muted-foreground">
          Ask a question or pick a suggestion below.
        </p>
      </div>
      <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSend(s)}
            className="glass rounded-xl border border-border px-4 py-3 text-left text-sm text-foreground/90 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground active:scale-[0.98]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
