"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import type { Conversation, Message } from "@/lib/chat-data"
import {
  createConversation,
  deleteConversation,
  fetchConversationMessages,
  fetchConversations,
  sendChatMessage,
} from "@/lib/chat-api"
import { getSupabase } from "@/lib/supabase-client"
import { LoginForm } from "@/components/auth/login-form"
import { LoadingScreen } from "@/components/loading-screen"
import { ChatSidebar } from "./chat-sidebar"
import { ChatWindow } from "./chat-window"
import { ErrorBanner } from "./error-banner"
import { cn } from "@/lib/utils"
import { useMobileViewport } from "@/lib/mobile-keyboard"

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function ChatApp() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [bannerError, setBannerError] = useState<string | null>(null)
  const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { isMobile, height: viewportHeight, offsetTop: viewportOffsetTop } = useMobileViewport()

  const active = conversations.find((c) => c.id === activeId)

  const clearBannerError = useCallback(() => {
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current)
      bannerTimeoutRef.current = null
    }
    setBannerError(null)
  }, [])

  const showBannerError = useCallback((message: string, autoDismissMs = 6000) => {
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current)
      bannerTimeoutRef.current = null
    }
    setBannerError(message)
    if (autoDismissMs > 0) {
      bannerTimeoutRef.current = setTimeout(() => {
        setBannerError(null)
        bannerTimeoutRef.current = null
      }, autoDismissMs)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current)
    }
  }, [])

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
      showBannerError(getErrorMessage(error, "Auth configuration error"), 0)
      setAuthReady(true)
    }
  }, [showBannerError])

  useEffect(() => {
    if (!session) {
      setConversations([])
      setActiveId("")
      clearBannerError()
      setIsLoading(false)
      return
    }

    async function loadConversations() {
      setIsLoading(true)
      try {
        clearBannerError()
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
        showBannerError(getErrorMessage(error, "Failed to load conversations"), 0)
      } finally {
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [session, clearBannerError, showBannerError])

  async function handleSend(text: string) {
    if (!activeId) return

    const now = new Date().toISOString()

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

    setIsAiTyping(true)
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
        timestamp: data.data?.timestamp ?? new Date().toISOString(),
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, id: resolvedId, messages: [...c.messages, aiMessage] }
            : c,
        ),
      )
    } catch (error) {
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        role: "assistant",
        content: `❌ ${error instanceof Error ? error.message : "Connection error. Please try again."}`,
        timestamp: new Date().toISOString(),
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, messages: [...c.messages, errorMessage] }
            : c,
        ),
      )
    } finally {
      setIsAiTyping(false)
    }
  }

  async function handleNewChat() {
    try {
      const fresh = await createConversation()
      setConversations((prev) => [fresh, ...prev])
      setActiveId(fresh.id)
      setSidebarOpen(false)
    } catch (error) {
      showBannerError(getErrorMessage(error, "Failed to create a new chat. Please try again."))
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
      showBannerError(getErrorMessage(error, "Failed to load conversation. Please try again."))
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this chat? This cannot be undone.")) return

    try {
      await deleteConversation(id)
      const remaining = conversations.filter((conversation) => conversation.id !== id)

      if (remaining.length === 0) {
        const fresh = await createConversation()
        setConversations([fresh])
        setActiveId(fresh.id)
      } else {
        setConversations(remaining)
        if (activeId === id) {
          setActiveId(remaining[0].id)
        }
      }
      setSidebarOpen(false)
    } catch (error) {
      showBannerError(getErrorMessage(error, "Failed to delete chat. Please try again."))
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

  const chatContent = (
    <>
      {bannerError && <ErrorBanner message={bannerError} onDismiss={clearBannerError} />}

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
          onDelete={handleDelete}
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
            onDelete={handleDelete}
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
          isAiTyping={isAiTyping}
        />
      </main>
    </>
  )

  if (!isMobile) {
    return (
      <div className="relative flex h-dvh overflow-hidden bg-background">
        {chatContent}
      </div>
    )
  }

  return (
    <div
      className="fixed left-0 right-0 z-0 flex flex-col overflow-hidden bg-background"
      style={{
        top: viewportOffsetTop,
        height: viewportHeight > 0 ? viewportHeight : "100dvh",
      }}
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {chatContent}
      </div>
    </div>
  )
}
