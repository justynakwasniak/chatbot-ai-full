import type { Conversation } from '@/lib/chat-data';
import { getAccessToken } from '@/lib/supabase-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function authHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not signed in. Please sign in again.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

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
  const headers = await authHeaders();
  const response = await fetchWithRetry(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
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

export async function fetchConversations(): Promise<Conversation[]> {
  const data = await request<{ success: true; data: Conversation[] }>('/api/chat/conversations');
  return data.data;
}

export async function createConversation(): Promise<Conversation> {
  const data = await request<{ success: true; data: Conversation }>('/api/chat/conversations', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return data.data;
}

export async function fetchConversationMessages(conversationId: string): Promise<Conversation> {
  const data = await request<{ success: true; data: Conversation }>(
    `/api/chat/conversations/${conversationId}`,
  );
  return data.data;
}

export async function sendChatMessage(conversationId: string, message: string) {
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
    }),
  });
}
