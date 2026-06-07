"use client"

import { useState } from "react"
import { conversations as initialConversations } from "@/lib/chat-data"
import type { Conversation, Message } from "@/lib/chat-data"
import { ChatSidebar } from "./chat-sidebar"
import { ChatWindow } from "./chat-window"
import { cn } from "@/lib/utils"

export function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeId, setActiveId] = useState<string>(initialConversations[0].id)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const active = conversations.find((c) => c.id === activeId)

  async function handleSend(text: string) {
    const now = new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })
    
    // Add user message immediately
    const newMessage: Message = {
      id: `${Date.now()}`,
      role: "user",
      content: text,
      timestamp: now,
    }
    
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMessage], preview: text, updatedAt: "Teraz" }
          : c,
      ),
    )

    try {
      // Send message to backend
      const response = await fetch("http://localhost:5000/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      })

      const data = await response.json()

      if (data.success) {
        const aiMessage: Message = {
          id: data.data?.id || `${Date.now()}-ai`,
          role: "assistant",
          content: data.response || data.data?.content || "Przepraszam, nie udało mi się przetworzyć Twojej wiadomości.",
          timestamp: new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? { ...c, messages: [...c.messages, aiMessage] }
              : c,
          ),
        )
      } else {
        const errorMessage: Message = {
          id: `${Date.now()}-error`,
          role: "assistant",
          content: `❌ ${data.error || "Nie udało się uzyskać odpowiedzi od AI."}`,
          timestamp: new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? { ...c, messages: [...c.messages, errorMessage] }
              : c,
          ),
        )
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // Add error message
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        role: "assistant",
        content: "❌ Błąd połączenia z serwerem. Spróbuj ponownie.",
        timestamp: new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
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

  function handleNewChat() {
    const id = `${Date.now()}`
    const fresh: Conversation = {
      id,
      title: "Nowa rozmowa",
      preview: "Zacznij pisać...",
      updatedAt: "Teraz",
      messages: [],
    }
    setConversations((prev) => [fresh, ...prev])
    setActiveId(id)
    setSidebarOpen(false)
  }

  function handleSelect(id: string) {
    setActiveId(id)
    setSidebarOpen(false)
  }

  return (
    <div className="relative flex h-dvh overflow-hidden bg-background">
      {/* Subtle ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-primary/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-0 size-96 rounded-full bg-accent/15 blur-[140px]"
      />

      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Mobile sidebar overlay */}
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

      {/* Main */}
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
