-- ─────────────────────────────────────────────
-- FreshDS Supabase schema
-- Run this in: Supabase dashboard → SQL Editor
-- ─────────────────────────────────────────────

-- 1. Profiles — one row per beta user (created automatically on sign-in)
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text,
  full_name   text,
  avatar_url  text,
  provider    text,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);


-- 2. Waitlist — email capture for users who arrive after the beta is full
create table if not exists public.waitlist (
  id         uuid default gen_random_uuid() primary key,
  email      text unique not null,
  name       text,
  created_at timestamptz default now()
);

alter table public.waitlist enable row level security;

create policy "Anyone can join waitlist"
  on public.waitlist for insert
  with check (true);


-- 3. Feedback — in-product "Send feedback" submissions
create table if not exists public.feedback (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete set null,
  message    text not null,
  page       text,
  created_at timestamptz default now()
);

alter table public.feedback enable row level security;

create policy "Authenticated users can submit feedback"
  on public.feedback for insert
  with check (auth.uid() = user_id);


-- 4. RPC — seat counter (callable with anon key, no auth required)
create or replace function public.beta_seat_count()
returns integer
language sql
security definer
as $$
  select count(*)::integer from public.profiles;
$$;


-- 5. Trigger — auto-create profile when a new user signs in via OAuth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, provider)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_app_meta_data->>'provider'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
