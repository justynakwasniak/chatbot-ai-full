"use client"

import { useEffect, useState } from "react"
import type { Conversation, Message } from "@/lib/chat-data"
import { conversations as mockConversations } from "@/lib/chat-data"
import {
  createConversation,
  fetchConversationMessages,
  fetchConversations,
  sendChatMessage,
} from "@/lib/chat-api"
import { ChatSidebar } from "./chat-sidebar"
import { ChatWindow } from "./chat-window"
import { cn } from "@/lib/utils"

export function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dbEnabled, setDbEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const active = conversations.find((c) => c.id === activeId)

  useEffect(() => {
    async function loadConversations() {
      try {
        const { conversations: data, dbEnabled: hasDatabase } = await fetchConversations()

        if (!hasDatabase) {
          setConversations(mockConversations)
          setActiveId(mockConversations[0].id)
          setDbEnabled(false)
          return
        }

        if (data.length > 0) {
          setConversations(data)
          setActiveId(data[0].id)
          setDbEnabled(true)
          return
        }

        const created = await createConversation()
        setConversations([created])
        setActiveId(created.id)
        setDbEnabled(true)
      } catch {
        setConversations(mockConversations)
        setActiveId(mockConversations[0].id)
        setDbEnabled(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [])

  async function handleSend(text: string) {
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

    const newMessage: Message = {
      id: `${Date.now()}`,
      role: "user",
      content: text,
      timestamp: now,
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMessage], preview: text, updatedAt: "Now" }
          : c,
      ),
    )

    try {
      const data = await sendChatMessage(activeId, text)

      const aiMessage: Message = {
        id: data.data?.id || `${Date.now()}-ai`,
        role: "assistant",
        content: data.response || data.data?.content || "Sorry, I couldn't process your message.",
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, messages: [...c.messages, aiMessage] }
            : c,
        ),
      )
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        role: "assistant",
        content: `❌ ${error instanceof Error ? error.message : "Connection error. Please try again."}`,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, messages: [...c.messages, errorMessage] }
            : c,
        ),
      )
    }
  }

  async function handleNewChat() {
    try {
      const fresh = dbEnabled
        ? await createConversation()
        : {
            id: `${Date.now()}`,
            title: "New chat",
            preview: "Start typing...",
            updatedAt: "Now",
            messages: [],
          }

      setConversations((prev) => [fresh, ...prev])
      setActiveId(fresh.id)
      setSidebarOpen(false)
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  async function handleSelect(id: string) {
    setActiveId(id)
    setSidebarOpen(false)

    if (!dbEnabled) return

    const selected = conversations.find((conversation) => conversation.id === id)
    if (!selected || selected.messages.length > 0) return

    try {
      const loaded = await fetchConversationMessages(id)
      setConversations((prev) =>
        prev.map((conversation) => (conversation.id === id ? loaded : conversation)),
      )
    } catch (error) {
      console.error("Error loading conversation:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
        Loading conversations...
      </div>
    )
  }

  return (
    <div className="relative flex h-dvh overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-primary/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-0 size-96 rounded-full bg-accent/15 blur-[140px]"
      />

      <div className="hidden md:flex">
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onNewChat={handleNewChat}
        />
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          sidebarOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity",
            sidebarOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 bg-background transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <ChatSidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
            onNewChat={handleNewChat}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      <main className="relative z-10 flex min-w-0 flex-1">
        <ChatWindow
          conversation={active}
          onSend={handleSend}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </main>
    </div>
  )
}
