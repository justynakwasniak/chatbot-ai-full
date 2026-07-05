"use client"

import { useEffect, useRef, useState } from "react"
import type { FocusEvent, KeyboardEvent } from "react"
import { ArrowUp, Loader2, Paperclip, Mic } from "lucide-react"
import { useIsMobileLayout, scrollFocusedIntoView } from "@/lib/mobile-keyboard"

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  onFocus?: () => void
  focusKey?: string
}

export function ChatInput({ onSend, disabled = false, onFocus, focusKey }: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isMobile = useIsMobileLayout()

  useEffect(() => {
    if (isMobile || disabled) return

    const frame = requestAnimationFrame(() => {
      textareaRef.current?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [focusKey, isMobile, disabled])

  function handleInput() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    if (isMobile) onFocus?.()
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
    onFocus?.()
    scrollFocusedIntoView(e.currentTarget)
  }

  const inputBar = (
    <div className="mx-auto max-w-3xl">
      <div className="glass-strong flex items-end gap-2 rounded-2xl border border-border p-2 shadow-xl shadow-black/20 focus-within:ring-1 focus-within:ring-primary/40">
        <button
          type="button"
          className="focus-ring flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Attach file"
        >
          <Paperclip className="size-5" aria-hidden />
        </button>

        <label htmlFor="chat-message" className="sr-only">
          Message
        </label>
        <textarea
          id="chat-message"
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onInput={handleInput}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={disabled}
          placeholder={disabled ? "Waiting for response..." : "Message HablaAI..."}
          className="focus-ring max-h-40 flex-1 resize-none bg-transparent py-2 text-base leading-relaxed text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          className="focus-ring flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Record voice message"
        >
          <Mic className="size-5" aria-hidden />
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="focus-ring flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          aria-label={disabled ? "Waiting for response" : "Send message"}
        >
          {disabled ? (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          ) : (
            <ArrowUp className="size-5" aria-hidden />
          )}
        </button>
      </div>
      {!isMobile && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          HablaAI can make mistakes. Check important information.
        </p>
      )}
    </div>
  )

  return (
    <div className="shrink-0 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md sm:px-6 sm:pb-4">
      {inputBar}
    </div>
  )
}
