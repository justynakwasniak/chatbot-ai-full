import { cn } from "@/lib/utils"
import type { Message } from "@/lib/chat-data"
import { Sparkles, User } from "lucide-react"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

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
        <span className="px-1 text-xs text-muted-foreground">{message.timestamp}</span>
      </div>

      {isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <User className="size-4" />
        </div>
      )}
    </div>
  )
}
