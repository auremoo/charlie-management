-- ============================================================
-- Charlie Management — Schéma Supabase
-- À exécuter dans l'éditeur SQL de ton projet Supabase
-- ============================================================

-- Activer les extensions nécessaires
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null check (role in ('owner', 'cat_sitter')),
  name       text,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Lecture publique des profils" on profiles
  for select using (auth.uid() is not null);

create policy "Mise à jour de son propre profil" on profiles
  for update using (auth.uid() = id);

create policy "Insertion de son propre profil" on profiles
  for insert with check (auth.uid() = id);

-- ============================================================
-- TASKS
-- ============================================================
create table tasks (
  id         uuid primary key default uuid_generate_v4(),
  title      text not null,
  emoji      text default '🐾',
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

alter table tasks enable row level security;

create policy "Lecture par tous les connectés" on tasks
  for select using (auth.uid() is not null);

create policy "Écriture par owner uniquement" on tasks
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'owner')
  );

-- Données initiales
insert into tasks (title, emoji, sort_order) values
  ('Croquettes', '🥣', 1),
  ('Eau fraîche', '💧', 2),
  ('Robinet pour boire', '🚿', 3),
  ('Câlins', '🤗', 4);

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

create policy "Lecture par tous les connectés" on task_completions
  for select using (auth.uid() is not null);

create policy "Écriture par cat_sitter" on task_completions
  for all using (auth.uid() is not null);

-- ============================================================
-- VIGILANCE_POINTS
-- ============================================================
create table vigilance_points (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  severity    text not null default 'warning' check (severity in ('info', 'warning', 'danger')),
  sort_order  int default 0,
  created_at  timestamp with time zone default now()
);

alter table vigilance_points enable row level security;

create policy "Lecture par tous les connectés" on vigilance_points
  for select using (auth.uid() is not null);

create policy "Écriture par owner" on vigilance_points
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'owner')
  );

-- Données initiales
insert into vigilance_points (title, description, severity, sort_order) values
  ('Fenêtres', 'Ne pas ouvrir les fenêtres — Charlie peut fuguer !', 'danger', 1),
  ('Salle de bain', 'Ne pas ouvrir la salle de bain, il y a une plante toxique pour les chats.', 'danger', 2),
  ('La porte d''entrée', 'Attention à Charlie en entrant et en sortant — il peut se faufiler très vite.', 'warning', 3);

-- ============================================================
-- TUTORIALS
-- ============================================================
create table tutorials (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  video_url   text,
  sort_order  int default 0,
  created_at  timestamp with time zone default now()
);

alter table tutorials enable row level security;

create policy "Lecture par tous les connectés" on tutorials
  for select using (auth.uid() is not null);

create policy "Écriture par owner" on tutorials
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'owner')
  );

-- Données initiales (placeholders)
insert into tutorials (title, description, video_url, sort_order) values
  ('Où sont les croquettes', 'Placard cuisine, étagère du bas. Dose : 50g matin + 50g soir.', null, 1),
  ('Où sont les friandises', 'Tiroir du bureau. Maximum 5 friandises par jour !', null, 2),
  ('Le robinet pour boire', 'Charlie adore boire au robinet de la salle de bain. Laisser couler un filet.', null, 3);

-- ============================================================
-- NEWS
-- ============================================================
create table news (
  id         uuid primary key default uuid_generate_v4(),
  content    text not null,
  author_id  uuid not null references profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

alter table news enable row level security;

create policy "Lecture par tous les connectés" on news
  for select using (auth.uid() is not null);

create policy "Écriture par cat_sitter" on news
  for insert with check (auth.uid() = author_id);

create policy "Suppression de ses propres news" on news
  for delete using (auth.uid() = author_id);

-- ============================================================
-- PHOTOS
-- ============================================================
create table photos (
  id         uuid primary key default uuid_generate_v4(),
  url        text not null,
  caption    text,
  author_id  uuid not null references profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

alter table photos enable row level security;

create policy "Lecture par tous les connectés" on photos
  for select using (auth.uid() is not null);

create policy "Upload par cat_sitter" on photos
  for insert with check (auth.uid() = author_id);

create policy "Suppression de ses propres photos" on photos
  for delete using (auth.uid() = author_id);

-- ============================================================
-- STORAGE — bucket "charlie-photos"
-- ============================================================
-- À créer manuellement dans Supabase Storage avec :
-- Nom : charlie-photos
-- Public : true (pour afficher les images sans token)
