import type { Conversation } from '@/lib/chat-data';
import { getOrCreateSessionId } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function fetchWithRetry(url: string, init?: RequestInit, retries = 3): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeout);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Cannot reach backend at ${API_URL}. Check NEXT_PUBLIC_API_URL on Vercel.`);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetchWithRetry(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export async function fetchChatStatus(): Promise<boolean> {
  const response = await fetch(`${API_URL}/api/chat/status`);
  const data = await response.json();
  return Boolean(data.success && data.dbEnabled);
}

export async function fetchConversations(): Promise<{ conversations: Conversation[]; dbEnabled: boolean }> {
  const sessionId = getOrCreateSessionId();
  const response = await fetchWithRetry(
    `${API_URL}/api/chat/conversations?session_id=${encodeURIComponent(sessionId)}`,
  );
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Request failed');
  }

  return {
    conversations: data.data,
    dbEnabled: Boolean(data.dbEnabled),
  };
}

export async function createConversation(): Promise<Conversation> {
  const sessionId = getOrCreateSessionId();
  const data = await request<{ success: true; data: Conversation }>('/api/chat/conversations', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  });
  return data.data;
}

export async function fetchConversationMessages(conversationId: string): Promise<Conversation> {
  const sessionId = getOrCreateSessionId();
  const data = await request<{ success: true; data: Conversation }>(
    `/api/chat/conversations/${conversationId}?session_id=${encodeURIComponent(sessionId)}`,
  );
  return data.data;
}

export async function sendChatMessage(conversationId: string, message: string) {
  const sessionId = getOrCreateSessionId();
  return request<{
    success: true;
    response: string;
    conversation_id?: string;
    data: {
      id: string;
      content: string;
      sender: string;
      timestamp: string;
    };
  }>('/api/chat/message', {
    method: 'POST',
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
      session_id: sessionId,
    }),
  });
}
