"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { getSupabase } from "@/lib/supabase-client"
import { scrollFocusedIntoView } from "@/lib/mobile-keyboard"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await getSupabase().auth.signUp({ email, password })
        if (signUpError) throw signUpError
        if (data.session) return
        setMessage("Account created. You can sign in now.")
        setIsSignUp(false)
      } else {
        const { error: signInError } = await getSupabase().auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh overflow-y-auto bg-background px-4 py-8 sm:flex sm:min-h-dvh sm:items-center sm:justify-center sm:py-4">
      <div className="glass-strong mx-auto w-full max-w-md rounded-2xl border border-border p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <Sparkles className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">HablaAI</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to practice Spanish with your AI tutor
          </p>
          <p className="text-xs text-muted-foreground/80">
            Demo app — any email works, no confirmation needed
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => scrollFocusedIntoView(e.currentTarget)}
              className="auth-input w-full rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-base caret-primary placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="name@gmail.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => scrollFocusedIntoView(e.currentTarget)}
              className="auth-input auth-input-password w-full rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-base caret-primary placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          {message && (
            <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
              setMessage(null)
            }}
            className="font-medium text-primary hover:underline"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  )
}
