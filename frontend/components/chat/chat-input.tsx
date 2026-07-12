"use client"

import { useEffect, useRef, useState } from "react"
import type { FocusEvent, KeyboardEvent } from "react"
import { ArrowUp, Loader2, Mic, MicOff, Paperclip } from "lucide-react"
import { useIsMobileLayout, scrollFocusedIntoView } from "@/lib/mobile-keyboard"
import {
  DICTATION_LANGS,
  type DictationLang,
  isRecognitionSupported,
  startSpeechRecognition,
  stopSpeechRecognition,
} from "@/lib/speech-recognition"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  onFocus?: () => void
  focusKey?: string
}

export function ChatInput({ onSend, disabled = false, onFocus, focusKey }: ChatInputProps) {
  const [value, setValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [canDictate, setCanDictate] = useState(false)
  const [dictationLang, setDictationLang] = useState<DictationLang>("es-ES")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dictationPrefixRef = useRef("")
  const isMobile = useIsMobileLayout()

  useEffect(() => {
    setCanDictate(isRecognitionSupported())
  }, [])

  useEffect(() => {
    if (disabled && isListening) {
      stopSpeechRecognition()
      setIsListening(false)
    }
  }, [disabled, isListening])

  useEffect(() => {
    return () => stopSpeechRecognition()
  }, [])

  function resizeTextarea() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  useEffect(() => {
    resizeTextarea()
  }, [value])

  useEffect(() => {
    if (isMobile || disabled) return

    const frame = requestAnimationFrame(() => {
      textareaRef.current?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [focusKey, isMobile, disabled])

  function handleInput() {
    if (isMobile) onFocus?.()
  }

  function setDictationLanguage(lang: DictationLang) {
    if (lang === dictationLang) return
    if (isListening) {
      stopSpeechRecognition()
      setIsListening(false)
    }
    setDictationLang(lang)
  }

  function toggleDictation() {
    if (disabled || !canDictate) return

    if (isListening) {
      stopSpeechRecognition()
      setIsListening(false)
      return
    }

    dictationPrefixRef.current = value.trim() ? `${value.trim()} ` : ""

    const started = startSpeechRecognition({
      lang: dictationLang,
      onTranscript: (text) => {
        setValue(dictationPrefixRef.current + text.trim())
      },
      onEnd: () => setIsListening(false),
    })

    if (started) {
      setIsListening(true)
      textareaRef.current?.focus({ preventScroll: true })
    }
  }

  function submit() {
    if (disabled) return
    if (isListening) {
      stopSpeechRecognition()
      setIsListening(false)
    }
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
      <div className="input-bar glass-strong flex items-end gap-2 rounded-2xl border border-border p-2 shadow-xl shadow-black/20">
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
          placeholder={
            disabled
              ? "Waiting for response..."
              : isListening
                ? "Listening..."
                : "Message HablaAI..."
          }
          className="max-h-40 flex-1 resize-none bg-transparent py-2 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />

        {canDictate && (
          <div
            className="flex shrink-0 flex-col items-center gap-1"
            role="group"
            aria-label="Dictation language"
          >
            <div className="flex rounded-lg border border-border bg-secondary/50 p-0.5">
              {DICTATION_LANGS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDictationLanguage(id)}
                  disabled={disabled}
                  className={cn(
                    "focus-ring rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors",
                    dictationLang === id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                  aria-pressed={dictationLang === id}
                  title={id === "es-ES" ? "Dictate in Spanish" : "Dictate in English"}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={toggleDictation}
              disabled={disabled}
              className={cn(
                "focus-ring flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                isListening
                  ? "bg-destructive/15 text-destructive ring-1 ring-destructive/40"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                disabled && "cursor-not-allowed opacity-40",
              )}
              aria-label={isListening ? "Stop dictation" : `Dictate in ${dictationLang === "es-ES" ? "Spanish" : "English"}`}
              aria-pressed={isListening}
              title={isListening ? "Stop listening" : "Speak instead of typing"}
            >
              {isListening ? (
                <MicOff className="size-5" aria-hidden />
              ) : (
                <Mic className="size-5" aria-hidden />
              )}
            </button>
          </div>
        )}

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
