"use client"

import { useRef, useState } from "react"
import type { FocusEvent, KeyboardEvent } from "react"
import { ArrowUp, Paperclip, Mic } from "lucide-react"
import { scrollFocusedIntoView, useVisualViewportBottom } from "@/lib/mobile-keyboard"

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { isMobile, bottomOffset } = useVisualViewportBottom()

  function handleInput() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  function submit() {
    if (disabled) return
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function handleFocus(e: FocusEvent<HTMLTextAreaElement>) {
    scrollFocusedIntoView(e.currentTarget)
  }

  const inputBar = (
    <div className="mx-auto max-w-3xl">
      <div className="glass-strong flex items-end gap-2 rounded-2xl border border-border p-2 shadow-xl shadow-black/20 focus-within:ring-1 focus-within:ring-primary/40">
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Attach file"
        >
          <Paperclip className="size-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onInput={handleInput}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={disabled}
          placeholder={disabled ? "Waiting for response..." : "Message HablaAI..."}
          className="max-h-40 flex-1 resize-none bg-transparent py-2 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Record voice message"
        >
          <Mic className="size-5" />
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          aria-label="Send message"
        >
          <ArrowUp className="size-5" />
        </button>
      </div>
      {!isMobile && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          HablaAI can make mistakes. Check important information.
        </p>
      )}
    </div>
  )

  if (!isMobile) {
    return <div className="shrink-0 px-4 pb-4 pt-2 sm:px-6">{inputBar}</div>
  }

  return (
    <>
      <div className="h-[5.5rem] shrink-0" aria-hidden />
      <div
        className="fixed inset-x-0 z-30 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md"
        style={{ bottom: bottomOffset }}
      >
        {inputBar}
      </div>
    </>
  )
}
