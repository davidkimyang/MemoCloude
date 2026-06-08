create extension if not exists pgcrypto;

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete set null,
  title text not null default '새 메모',
  content text default '',
  is_pinned boolean default false,
  is_deleted boolean default false,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.note_attachments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_url text not null,
  file_path text not null,
  file_name text,
  file_type text,
  created_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_folders_updated_at on public.folders;
create trigger set_folders_updated_at
before update on public.folders
for each row execute function public.set_updated_at();

drop trigger if exists set_notes_updated_at on public.notes;
create trigger set_notes_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

alter table public.folders enable row level security;
alter table public.notes enable row level security;
alter table public.note_attachments enable row level security;

drop policy if exists "Users can view own folders" on public.folders;
create policy "Users can view own folders"
on public.folders for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own folders" on public.folders;
create policy "Users can insert own folders"
on public.folders for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own folders" on public.folders;
create policy "Users can update own folders"
on public.folders for update
using (auth.uid() = user_id);

drop policy if exists "Users can delete own folders" on public.folders;
create policy "Users can delete own folders"
on public.folders for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view own notes" on public.notes;
create policy "Users can view own notes"
on public.notes for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own notes" on public.notes;
create policy "Users can insert own notes"
on public.notes for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own notes" on public.notes;
create policy "Users can update own notes"
on public.notes for update
using (auth.uid() = user_id);

drop policy if exists "Users can delete own notes" on public.notes;
create policy "Users can delete own notes"
on public.notes for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view own attachments" on public.note_attachments;
create policy "Users can view own attachments"
on public.note_attachments for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own attachments" on public.note_attachments;
create policy "Users can insert own attachments"
on public.note_attachments for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own attachments" on public.note_attachments;
create policy "Users can delete own attachments"
on public.note_attachments for delete
using (auth.uid() = user_id);

