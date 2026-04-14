-- ============================================================
-- Charlie Management v2 — Schéma multi-tenant
-- À exécuter dans l'éditeur SQL APRÈS avoir supprimé les
-- anciennes tables (ou sur un projet Supabase vierge)
-- ============================================================

-- Activer les extensions nécessaires
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (simplifié — plus de champ role)
-- ============================================================
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Lecture par tous les connectés" on profiles
  for select using (auth.uid() is not null);

create policy "Insertion de son propre profil" on profiles
  for insert with check (auth.uid() = id);

create policy "Mise à jour de son propre profil" on profiles
  for update using (auth.uid() = id);

-- ============================================================
-- PETS (fiche animal — le concept central)
-- ============================================================
create table pets (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  photo_url  text,
  owner_id   uuid not null references profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

alter table pets enable row level security;

-- Le propriétaire peut tout faire sur ses animaux
create policy "Owner full access" on pets
  for all using (auth.uid() = owner_id);

-- Les sitters invités peuvent lire la fiche
create policy "Sitter read access" on pets
  for select using (
    exists (
      select 1 from pet_sitters
      where pet_sitters.pet_id = pets.id
        and pet_sitters.sitter_id = auth.uid()
    )
  );

-- ============================================================
-- PET_SITTERS (partage d'une fiche avec un sitter)
-- ============================================================
create table pet_sitters (
  id         uuid primary key default uuid_generate_v4(),
  pet_id     uuid not null references pets(id) on delete cascade,
  sitter_id  uuid not null references profiles(id) on delete cascade,
  invited_at timestamp with time zone default now(),
  unique(pet_id, sitter_id)
);

alter table pet_sitters enable row level security;

-- Le owner du pet peut gérer les sitters
create policy "Owner manages sitters" on pet_sitters
  for all using (
    exists (
      select 1 from pets where pets.id = pet_sitters.pet_id and pets.owner_id = auth.uid()
    )
  );

-- Le sitter peut voir ses propres invitations
create policy "Sitter sees own invitations" on pet_sitters
  for select using (auth.uid() = sitter_id);

-- ============================================================
-- INVITE_CODES (codes d'invitation pour les sitters)
-- ============================================================
create table invite_codes (
  id         uuid primary key default uuid_generate_v4(),
  pet_id     uuid not null references pets(id) on delete cascade,
  code       text not null unique default substring(uuid_generate_v4()::text from 1 for 8),
  used_by    uuid references profiles(id),
  created_at timestamp with time zone default now()
);

alter table invite_codes enable row level security;

-- Le owner du pet peut créer/voir les codes
create policy "Owner manages invite codes" on invite_codes
  for all using (
    exists (
      select 1 from pets where pets.id = invite_codes.pet_id and pets.owner_id = auth.uid()
    )
  );

-- Tout utilisateur connecté peut lire un code (pour le valider)
create policy "Anyone can read codes" on invite_codes
  for select using (auth.uid() is not null);

-- ============================================================
-- Fonction helper : vérifier l'accès à un pet
-- (owner OU sitter invité)
-- ============================================================
create or replace function has_pet_access(p_pet_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from pets where id = p_pet_id and owner_id = auth.uid()
  ) or exists (
    select 1 from pet_sitters where pet_id = p_pet_id and sitter_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Fonction helper : vérifier qu'on est owner du pet
create or replace function is_pet_owner(p_pet_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from pets where id = p_pet_id and owner_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- ============================================================
-- TASKS (liées à un pet)
-- ============================================================
create table tasks (
  id         uuid primary key default uuid_generate_v4(),
  pet_id     uuid not null references pets(id) on delete cascade,
  title      text not null,
  emoji      text default '🐾',
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

alter table tasks enable row level security;

create policy "Read by pet members" on tasks
  for select using (has_pet_access(pet_id));

create policy "Write by pet owner" on tasks
  for all using (is_pet_owner(pet_id));

-- ============================================================
-- TASK_COMPLETIONS
-- ============================================================
create table task_completions (
  id           uuid primary key default uuid_generate_v4(),
  task_id      uuid not null references tasks(id) on delete cascade,
  completed_by uuid not null references profiles(id) on delete cascade,
  completed_at timestamp with time zone default now(),
  date         date not null default current_date,
  unique(task_id, date)
);

alter table task_completions enable row level security;

create policy "Read by pet members" on task_completions
  for select using (
    exists (
      select 1 from tasks where tasks.id = task_completions.task_id and has_pet_access(tasks.pet_id)
    )
  );

create policy "Write by pet members" on task_completions
  for all using (
    exists (
      select 1 from tasks where tasks.id = task_completions.task_id and has_pet_access(tasks.pet_id)
    )
  );

-- ============================================================
-- VIGILANCE_POINTS (liés à un pet)
-- ============================================================
create table vigilance_points (
  id          uuid primary key default uuid_generate_v4(),
  pet_id      uuid not null references pets(id) on delete cascade,
  title       text not null,
  description text,
  severity    text not null default 'warning' check (severity in ('info', 'warning', 'danger')),
  sort_order  int default 0,
  created_at  timestamp with time zone default now()
);

alter table vigilance_points enable row level security;

create policy "Read by pet members" on vigilance_points
  for select using (has_pet_access(pet_id));

create policy "Write by pet owner" on vigilance_points
  for all using (is_pet_owner(pet_id));

-- ============================================================
-- TUTORIALS (liés à un pet)
-- ============================================================
create table tutorials (
  id          uuid primary key default uuid_generate_v4(),
  pet_id      uuid not null references pets(id) on delete cascade,
  title       text not null,
  description text,
  video_url   text,
  sort_order  int default 0,
  created_at  timestamp with time zone default now()
);

alter table tutorials enable row level security;

create policy "Read by pet members" on tutorials
  for select using (has_pet_access(pet_id));

create policy "Write by pet owner" on tutorials
  for all using (is_pet_owner(pet_id));

-- ============================================================
-- NEWS (liées à un pet)
-- ============================================================
create table news (
  id         uuid primary key default uuid_generate_v4(),
  pet_id     uuid not null references pets(id) on delete cascade,
  content    text not null,
  author_id  uuid not null references profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

alter table news enable row level security;

create policy "Read by pet members" on news
  for select using (has_pet_access(pet_id));

create policy "Insert by pet members" on news
  for insert with check (has_pet_access(pet_id) and auth.uid() = author_id);

create policy "Delete own news" on news
  for delete using (auth.uid() = author_id);

-- ============================================================
-- PHOTOS (liées à un pet)
-- ============================================================
create table photos (
  id         uuid primary key default uuid_generate_v4(),
  pet_id     uuid not null references pets(id) on delete cascade,
  url        text not null,
  caption    text,
  author_id  uuid not null references profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

alter table photos enable row level security;

create policy "Read by pet members" on photos
  for select using (has_pet_access(pet_id));

create policy "Insert by pet members" on photos
  for insert with check (has_pet_access(pet_id) and auth.uid() = author_id);

create policy "Delete own photos" on photos
  for delete using (auth.uid() = author_id);

-- ============================================================
-- STORAGE — bucket "charlie-photos"
-- ============================================================
-- Garder le bucket existant charlie-photos (public)
-- Policies Storage : SELECT + INSERT pour authenticated
