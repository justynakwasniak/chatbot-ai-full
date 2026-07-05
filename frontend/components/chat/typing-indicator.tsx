import { Sparkles } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="flex w-full gap-3 justify-start">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
        <Sparkles className="size-4" />
      </div>
      <div className="glass flex items-center gap-1 rounded-2xl rounded-bl-md border border-border px-4 py-3">
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
        <span className="sr-only">AI is typing</span>
      </div>
    </div>
  )
}
