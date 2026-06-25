-- Run this in Supabase SQL Editor if you already have the old schema with session_id

alter table conversations add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Old anonymous sessions used session_id; new auth flow uses user_id
alter table conversations alter column session_id drop not null;

create index if not exists idx_conversations_user_id on conversations(user_id);
