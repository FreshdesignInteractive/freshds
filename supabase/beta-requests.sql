-- Run this in the Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- 1. Create the beta_requests table
create table if not exists public.beta_requests (
  id         uuid        default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  name       text        not null,
  email      text        not null,
  company    text,
  message    text,
  status     text        not null default 'pending',
  constraint beta_requests_status_check check (status in ('pending', 'approved', 'rejected'))
);

-- 2. Unique index on lowercased email (prevents duplicate requests)
create unique index if not exists beta_requests_email_lower_idx
  on public.beta_requests (lower(email));

-- 3. Enable Row Level Security
alter table public.beta_requests enable row level security;

-- 4. Anyone (including anonymous visitors) can submit a request
create policy "anon_insert_beta_requests"
  on public.beta_requests
  for insert
  to anon
  with check (true);

-- 5. Authenticated users can read only their own record (used by auth/callback.html)
create policy "auth_select_own_beta_request"
  on public.beta_requests
  for select
  to authenticated
  using (lower(email) = lower(auth.email()));

-- 6. Update beta_seat_count RPC to count approved requests
--    (replaces the old function if it existed)
create or replace function public.beta_seat_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*) from public.beta_requests where status = 'approved';
$$;

-- ─────────────────────────────────────────────────────────────
-- Admin workflow
-- ─────────────────────────────────────────────────────────────
-- View pending requests:
--   select id, created_at, name, email, company, message
--   from beta_requests where status = 'pending' order by created_at;
--
-- Approve a user:
--   update beta_requests set status = 'approved' where email = 'user@example.com';
--
-- Reject a user:
--   update beta_requests set status = 'rejected' where email = 'user@example.com';
