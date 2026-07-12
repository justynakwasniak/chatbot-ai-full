-- Run in Supabase SQL Editor if attachments are not stored yet.

alter table messages
  add column if not exists attachments jsonb not null default '[]'::jsonb;
