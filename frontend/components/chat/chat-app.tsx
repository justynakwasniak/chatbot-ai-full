"use client"

import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import type { Conversation, Message } from "@/lib/chat-data"
import {
  createConversation,
  fetchConversationMessages,
  fetchConversations,
  sendChatMessage,
} from "@/lib/chat-api"
import { getSupabase } from "@/lib/supabase-client"
import { LoginForm } from "@/components/auth/login-form"
import { LoadingScreen } from "@/components/loading-screen"
import { ChatSidebar } from "./chat-sidebar"
import { ChatWindow } from "./chat-window"
import { cn } from "@/lib/utils"

export function ChatApp() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const active = conversations.find((c) => c.id === activeId)

  useEffect(() => {
    try {
      const supabase = getSupabase()
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        setSession(currentSession)
        setAuthReady(true)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        setSession(currentSession)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error(error)
      setLoadError(error instanceof Error ? error.message : "Auth configuration error")
      setAuthReady(true)
    }
  }, [])

  useEffect(() => {
    if (!session) {
      setConversations([])
      setActiveId("")
      setLoadError(null)
      setIsLoading(false)
      return
    }

    async function loadConversations() {
      setIsLoading(true)
      try {
        setLoadError(null)
        const data = await fetchConversations()

        if (data.length > 0) {
          setConversations(data)
          setActiveId(data[0].id)
          return
        }

        const created = await createConversation()
        setConversations([created])
        setActiveId(created.id)
      } catch (error) {
        console.error("Error loading conversations:", error)
        setLoadError(
          error instanceof Error ? error.message : "Failed to load conversations",
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [session])

  async function handleSend(text: string) {
    if (!activeId) return

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
      const resolvedId = data.conversation_id ?? activeId

      if (resolvedId !== activeId) {
        setActiveId(resolvedId)
      }

      const aiMessage: Message = {
        id: data.data?.id || `${Date.now()}-ai`,
        role: "assistant",
        content: data.response || data.data?.content || "Sorry, I couldn't process your message.",
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, id: resolvedId, messages: [...c.messages, aiMessage] }
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
      const fresh = await createConversation()
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

  async function handleLogout() {
    await getSupabase().auth.signOut()
  }

  if (!authReady) {
    return (
      <LoadingScreen
        message="Loading..."
        delayedMessage="Still loading..."
        delayedHint="Checking your session. This should only take a moment."
        delayMs={3000}
      />
    )
  }

  if (!session) {
    return <LoginForm />
  }

  if (isLoading) {
    return (
      <LoadingScreen
        message="Loading conversations..."
        delayedMessage="Starting server, please wait..."
        delayedHint="The backend may take up to a minute to wake up on first visit."
        delayMs={4000}
      />
    )
  }

  const userEmail = session.user.email ?? "User"
  const userInitials = userEmail.slice(0, 2).toUpperCase()

  return (
    <div className="relative flex h-dvh overflow-hidden bg-background">
      {loadError && (
        <div className="absolute left-0 right-0 top-0 z-20 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-xs text-destructive">
          {loadError}
        </div>
      )}

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
          userEmail={userEmail}
          userInitials={userInitials}
          onLogout={handleLogout}
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
            userEmail={userEmail}
            userInitials={userInitials}
            onLogout={handleLogout}
          />
        </div>
      </div>

      <main className="relative z-10 flex min-h-0 min-w-0 flex-1">
        <ChatWindow
          conversation={active}
          onSend={handleSend}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </main>
    </div>
  )
}
