import { getSupabase } from '../config/supabase';

export interface DbConversation {
  id: string;
  user_id: string;
  title: string;
  preview: string;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

function formatTimestamp(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function listConversations(userId: string) {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as DbConversation[];
}

export async function createConversation(userId: string, title = 'New chat') {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title })
    .select('*')
    .single();

  if (error) throw error;
  return data as DbConversation;
}

export async function getConversationMessages(conversationId: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (conversationError || !conversation) {
    throw new Error('Conversation not found');
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as DbMessage[];
}

export async function ensureConversation(userId: string, conversationId?: string): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  if (conversationId) {
    const { data } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (data?.id) return data.id;
  }

  const created = await createConversation(userId);
  return created.id;
}

export async function addMessage(
  conversationId: string,
  userId: string,
  role: 'user' | 'assistant',
  content: string,
) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .select('id, title')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (conversationError || !conversation) {
    throw new Error('Conversation not found');
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, content })
    .select('*')
    .single();

  if (error) throw error;

  const preview = content.slice(0, 120);
  const title =
    conversation.title === 'New chat' && role === 'user'
      ? content.slice(0, 40) + (content.length > 40 ? '...' : '')
      : conversation.title;

  await supabase
    .from('conversations')
    .update({
      preview,
      title,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  return data as DbMessage;
}

export function mapConversationForApi(conversation: DbConversation, messages: DbMessage[] = []) {
  return {
    id: conversation.id,
    title: conversation.title,
    preview: conversation.preview,
    updatedAt: formatRelativeTime(conversation.updated_at),
    messages: messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: formatTimestamp(message.created_at),
    })),
  };
}
