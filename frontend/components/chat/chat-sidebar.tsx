"use client"

import { cn } from "@/lib/utils"
import type { Conversation } from "@/lib/chat-data"
import { Plus, MessageSquare, Search, Sparkles, LogOut, PanelLeftClose } from "lucide-react"

interface ChatSidebarProps {
  conversations: Conversation[]
  activeId: string
  onSelect: (id: string) => void
  onNewChat: () => void
  userEmail: string
  userInitials: string
  onLogout: () => void
  onClose?: () => void
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  userEmail,
  userInitials,
  onLogout,
  onClose,
}: ChatSidebarProps) {
  return (
    <aside className="glass flex h-full w-72 shrink-0 flex-col border-r border-border">
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
            <Sparkles className="size-4" />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">HablaAI</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="size-4" />
          </button>
        )}
      </div>

      <div className="px-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="size-4" />
          New chat
        </button>
      </div>

      <div className="px-3 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <p className="px-2 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Recent
        </p>
        <ul className="flex flex-col gap-1">
          {conversations.map((c) => {
            const isActive = c.id === activeId
            return (
              <li key={c.id}>
                <button
                  onClick={() => onSelect(c.id)}
                  className={cn(
                    "group flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                    isActive
                      ? "bg-primary/12 ring-1 ring-primary/25"
                      : "hover:bg-secondary/60",
                  )}
                >
                  <MessageSquare
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-sm",
                          isActive ? "font-medium text-foreground" : "text-foreground/90",
                        )}
                      >
                        {c.title}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{c.preview}</p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{userEmail}</p>
            <p className="truncate text-xs text-muted-foreground">Signed in</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
