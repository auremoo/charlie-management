-- ============================================================
-- Charlie Management v2 — Schéma multi-tenant
-- Copier-coller tout ce script dans Supabase > SQL Editor > Run
-- ============================================================

-- Nettoyage des anciennes tables
drop table if exists photos cascade;
drop table if exists news cascade;
drop table if exists task_completions cascade;
drop table if exists tasks cascade;
drop table if exists tutorials cascade;
drop table if exists vigilance_points cascade;
drop table if exists invite_codes cascade;
drop table if exists pet_sitters cascade;
drop table if exists pets cascade;
drop table if exists profiles cascade;
drop function if exists has_pet_access(uuid);
drop function if exists is_pet_owner(uuid);

-- Extension UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- ÉTAPE 1 : Créer toutes les tables
-- ============================================================

create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  created_at timestamp with time zone default now()
);

create table pets (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  photo_url  text,
  owner_id   uuid not null references profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create table pet_sitters (
  id         uuid primary key default uuid_generate_v4(),
  pet_id     uuid not null references pets(id) on delete cascade,
  sitter_id  uuid not null references profiles(id) on delete cascade,
  invited_at timestamp with time zone default now(),
  unique(pet_id, sitter_id)
);

create table invite_codes (
  id         uuid primary key default uuid_generate_v4(),
  pet_id     uuid not null references pets(id) on delete cascade,
  code       text not null unique default substring(uuid_generate_v4()::text from 1 for 8),
  used_by    uuid references profiles(id),
  created_at timestamp with time zone default now()
);

create table tasks (
  id         uuid primary key default uuid_generate_v4(),
  pet_id     uuid not null references pets(id) on delete cascade,
  title      text not null,
  emoji      text default '🐾',
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

create table task_completions (
  id           uuid primary key default uuid_generate_v4(),
  task_id      uuid not null references tasks(id) on delete cascade,
  completed_by uuid not null references profiles(id) on delete cascade,
  completed_at timestamp with time zone default now(),
  date         date not null default current_date,
  unique(task_id, date)
);

create table vigilance_points (
  id          uuid primary key default uuid_generate_v4(),
  pet_id      uuid not null references pets(id) on delete cascade,
  title       text not null,
  description text,
  severity    text not null default 'warning' check (severity in ('info', 'warning', 'danger')),
  sort_order  int default 0,
  created_at  timestamp with time zone default now()
);

create table tutorials (
  id          uuid primary key default uuid_generate_v4(),
  pet_id      uuid not null references pets(id) on delete cascade,
  title       text not null,
  description text,
  video_url   text,
  sort_order  int default 0,
  created_at  timestamp with time zone default now()
);

create table news (
  id         uuid primary key default uuid_generate_v4(),
  pet_id     uuid not null references pets(id) on delete cascade,
  content    text not null,
  author_id  uuid not null references profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create table photos (
  id         uuid primary key default uuid_generate_v4(),
  pet_id     uuid not null references pets(id) on delete cascade,
  url        text not null,
  caption    text,
  author_id  uuid not null references profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- ÉTAPE 2 : Fonctions helpers
-- ============================================================

create or replace function has_pet_access(p_pet_id uuid)
returns boolean as $$
begin
  return exists (select 1 from pets where id = p_pet_id and owner_id = auth.uid())
      or exists (select 1 from pet_sitters where pet_id = p_pet_id and sitter_id = auth.uid());
end;
$$ language plpgsql security definer;

create or replace function is_pet_owner(p_pet_id uuid)
returns boolean as $$
begin
  return exists (select 1 from pets where id = p_pet_id and owner_id = auth.uid());
end;
$$ language plpgsql security definer;

-- ============================================================
-- ÉTAPE 3 : Activer RLS + Policies (après que toutes les tables existent)
-- ============================================================

-- Profiles
alter table profiles enable row level security;
create policy "profiles_select" on profiles for select using (auth.uid() is not null);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Pets
alter table pets enable row level security;
create policy "pets_owner_all" on pets for all using (auth.uid() = owner_id);
create policy "pets_sitter_select" on pets for select using (
  exists (select 1 from pet_sitters where pet_sitters.pet_id = pets.id and pet_sitters.sitter_id = auth.uid())
);

-- Pet Sitters
alter table pet_sitters enable row level security;
create policy "pet_sitters_owner_all" on pet_sitters for all using (
  exists (select 1 from pets where pets.id = pet_sitters.pet_id and pets.owner_id = auth.uid())
);
create policy "pet_sitters_sitter_select" on pet_sitters for select using (auth.uid() = sitter_id);

-- Invite Codes
alter table invite_codes enable row level security;
create policy "invite_codes_owner_all" on invite_codes for all using (
  exists (select 1 from pets where pets.id = invite_codes.pet_id and pets.owner_id = auth.uid())
);
create policy "invite_codes_read" on invite_codes for select using (auth.uid() is not null);

-- Tasks
alter table tasks enable row level security;
create policy "tasks_select" on tasks for select using (has_pet_access(pet_id));
create policy "tasks_owner_all" on tasks for all using (is_pet_owner(pet_id));

-- Task Completions
alter table task_completions enable row level security;
create policy "task_completions_select" on task_completions for select using (
  exists (select 1 from tasks where tasks.id = task_completions.task_id and has_pet_access(tasks.pet_id))
);
create policy "task_completions_all" on task_completions for all using (
  exists (select 1 from tasks where tasks.id = task_completions.task_id and has_pet_access(tasks.pet_id))
);

-- Vigilance Points
alter table vigilance_points enable row level security;
create policy "vigilance_select" on vigilance_points for select using (has_pet_access(pet_id));
create policy "vigilance_owner_all" on vigilance_points for all using (is_pet_owner(pet_id));

-- Tutorials
alter table tutorials enable row level security;
create policy "tutorials_select" on tutorials for select using (has_pet_access(pet_id));
create policy "tutorials_owner_all" on tutorials for all using (is_pet_owner(pet_id));

-- News
alter table news enable row level security;
create policy "news_select" on news for select using (has_pet_access(pet_id));
create policy "news_insert" on news for insert with check (has_pet_access(pet_id) and auth.uid() = author_id);
create policy "news_delete" on news for delete using (auth.uid() = author_id);

-- Photos
alter table photos enable row level security;
create policy "photos_select" on photos for select using (has_pet_access(pet_id));
create policy "photos_insert" on photos for insert with check (has_pet_access(pet_id) and auth.uid() = author_id);
create policy "photos_delete" on photos for delete using (auth.uid() = author_id);
