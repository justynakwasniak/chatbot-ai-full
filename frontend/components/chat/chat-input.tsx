"use client"



import { useEffect, useRef, useState } from "react"

import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react"

import { ArrowUp, Loader2, Mic, MicOff, Paperclip } from "lucide-react"

import {

  MAX_ATTACHMENTS,

  type PendingAttachment,

  processAttachmentFile,

  revokeAttachmentPreview,

  toMessageAttachment,

} from "@/lib/attachments"

import type { MessageAttachment } from "@/lib/chat-data"

import { useIsMobileLayout, scrollFocusedIntoView } from "@/lib/mobile-keyboard"

import {

  DICTATION_LANGS,

  type DictationLang,

  isRecognitionSupported,

  startSpeechRecognition,

  stopSpeechRecognition,

} from "@/lib/speech-recognition"

import { cn } from "@/lib/utils"

import { AttachmentPreviewList } from "./attachment-preview-list"



interface ChatInputProps {

  onSend: (text: string, attachments?: MessageAttachment[]) => void

  disabled?: boolean

  onFocus?: () => void

  onError?: (message: string) => void

  focusKey?: string

}



export function ChatInput({

  onSend,

  disabled = false,

  onFocus,

  onError,

  focusKey,

}: ChatInputProps) {

  const [value, setValue] = useState("")

  const [isListening, setIsListening] = useState(false)

  const [canDictate, setCanDictate] = useState(false)

  const [dictationLang, setDictationLang] = useState<DictationLang>("es-ES")

  const [attachments, setAttachments] = useState<PendingAttachment[]>([])

  const [isProcessingFiles, setIsProcessingFiles] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const dictationPrefixRef = useRef("")
  const attachmentsRef = useRef<PendingAttachment[]>([])
  const isMobile = useIsMobileLayout()

  const canSend = value.trim().length > 0 || attachments.length > 0

  useEffect(() => {
    attachmentsRef.current = attachments
  }, [attachments])



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
    return () => {
      stopSpeechRecognition()
      attachmentsRef.current.forEach(revokeAttachmentPreview)
    }
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



  function removeAttachment(id: string) {

    setAttachments((prev) => {

      const removed = prev.find((item) => item.id === id)

      if (removed) revokeAttachmentPreview(removed)

      return prev.filter((item) => item.id !== id)

    })

  }



  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {

    const files = Array.from(event.target.files ?? [])

    event.target.value = ""



    if (!files.length || disabled) return



    if (attachments.length + files.length > MAX_ATTACHMENTS) {

      onError?.(`You can attach up to ${MAX_ATTACHMENTS} files.`)

      return

    }



    setIsProcessingFiles(true)

    try {

      const processed = await Promise.all(files.map((file) => processAttachmentFile(file)))

      setAttachments((prev) => [...prev, ...processed])

      textareaRef.current?.focus({ preventScroll: true })

    } catch (error) {

      onError?.(error instanceof Error ? error.message : "Could not add attachment.")

    } finally {

      setIsProcessingFiles(false)

    }

  }



  function submit() {

    if (disabled || !canSend) return

    if (isListening) {

      stopSpeechRecognition()

      setIsListening(false)

    }



    const trimmed = value.trim()

    const payload = attachments.map(toMessageAttachment)



    onSend(trimmed, payload.length > 0 ? payload : undefined)



    setValue("")

    attachments.forEach(revokeAttachmentPreview)

    setAttachments([])

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

      <AttachmentPreviewList

        attachments={attachments}

        onRemove={removeAttachment}

        disabled={disabled || isProcessingFiles}

      />



      <div className="input-bar glass-strong flex items-end gap-2 rounded-2xl border border-border p-2 shadow-xl shadow-black/20">

        <input

          ref={fileInputRef}

          type="file"

          accept="image/jpeg,image/png,image/webp,image/gif,.txt,text/plain"

          multiple

          className="sr-only"

          onChange={handleFileChange}

          disabled={disabled || isProcessingFiles}

        />

        <button

          type="button"

          onClick={() => fileInputRef.current?.click()}

          disabled={disabled || isProcessingFiles || attachments.length >= MAX_ATTACHMENTS}

          className={cn(

            "focus-ring flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",

            (disabled || isProcessingFiles || attachments.length >= MAX_ATTACHMENTS) &&

              "cursor-not-allowed opacity-40",

          )}

          aria-label="Attach file"

          title="Attach image or .txt file"

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

          disabled={disabled || !canSend}

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


