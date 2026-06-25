-- Run this in Supabase: SQL Editor → New query → Run

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  preview text not null default 'Start typing...',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_conversations_user_id on conversations(user_id);
create index if not exists idx_conversations_updated_at on conversations(updated_at desc);
create index if not exists idx_messages_conversation_id on messages(conversation_id);

alter table conversations enable row level security;
alter table messages enable row level security;

-- Backend uses service_role key and bypasses RLS.
-- Enable Email provider in Supabase: Authentication → Providers → Email.
