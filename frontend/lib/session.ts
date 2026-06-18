const SESSION_KEY = 'hablaai_session_id';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const sessionId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}
