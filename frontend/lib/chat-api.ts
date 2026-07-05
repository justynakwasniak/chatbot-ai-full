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

  const contentType = response.headers.get('content-type') ?? '';
  const body = await response.text();

  if (!contentType.includes('application/json')) {
    if (response.status === 404) {
      throw new Error(
        'Delete is not available on the server yet. Redeploy the backend on Render, then try again.',
      );
    }
    throw new Error(
      `Unexpected server response (${response.status}). Check NEXT_PUBLIC_API_URL on Vercel.`,
    );
  }

  let data: { success?: boolean; error?: string };
  try {
    data = JSON.parse(body) as { success?: boolean; error?: string };
  } catch {
    throw new Error('Invalid response from server. Check NEXT_PUBLIC_API_URL on Vercel.');
  }

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Request failed');
  }
  return data as T;
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

export async function deleteConversation(conversationId: string): Promise<void> {
  await request<{ success: true }>(`/api/chat/conversations/${conversationId}`, {
    method: 'DELETE',
  });
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
