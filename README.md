# Charlie Management

Application web de cat sitting pour Charlie. Deux rôles : propriétaire et cat sitter.
Le propriétaire configure les consignes, le cat sitter envoie photos et nouvelles.

**[Voir l'app en ligne](https://auremoo.github.io/charlie-management/)**

## Fonctionnalités

### Propriétaire (owner)
- Tableau de bord avec fil chronologique des photos et messages reçus
- Gestion des tâches quotidiennes (CRUD, emoji personnalisable, ordre d'affichage)
- Gestion des points de vigilance (3 niveaux : info, attention, danger)
- Gestion des tutoriels avec vidéos YouTube intégrées

### Cat sitter
- Checklist quotidienne avec barre de progression (reset chaque jour)
- Consultation des points de vigilance (lecture seule)
- Consultation des tutoriels vidéo (lecture seule)
- Envoi de photos (compression automatique) et messages au propriétaire

### Authentification & sécurité
- Connexion par magic link (email, sans mot de passe)
- Attribution automatique du rôle selon l'email
- Protection des routes côté client via hook `useAuth`
- Row Level Security (RLS) sur toutes les tables Supabase

### UX
- Design épuré inspiré Apple/luxe (palette terre chaude, typographie Inter)
- Mobile-first responsive, optimisé tactile
- Navigation avec effet frosted glass (backdrop-blur)
- PWA : installable sur l'écran d'accueil (manifest.json)
- Compression photos côté client avant upload (max 1200px, JPEG 80%)

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14, App Router, TypeScript, React 18 |
| Styling | Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Déploiement | GitHub Pages (static export via GitHub Actions) |

## Démarrage rapide

### 1. Supabase
1. Créer un projet sur [supabase.com](https://supabase.com)
2. Dans **SQL Editor**, exécuter le contenu de `specs/schema.sql`
3. Dans **Storage**, créer un bucket `charlie-photos` (public, 10 MB max)
4. Ajouter 2 policies sur le bucket : SELECT + INSERT pour `authenticated`
5. Dans **Authentication > URL Configuration** :
   - Site URL : `https://votre-pseudo.github.io/charlie-management`
   - Redirect URLs : `https://votre-pseudo.github.io/charlie-management/auth/callback`

### 2. Variables d'environnement
```bash
cp .env.local.example .env.local
```
Remplir dans `.env.local` :
- `NEXT_PUBLIC_SUPABASE_URL` — Settings > API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Settings > API
- `NEXT_PUBLIC_OWNER_EMAIL` — l'email qui aura le rôle propriétaire

### 3. Photo de Charlie
Placer une photo dans `public/charlie.jpg` (favicon, icône PWA, avatar login).

### 4. Lancer en local
```bash
npm install
npm run dev
```

### 5. Déploiement GitHub Pages
Le déploiement est automatique à chaque push sur `main` via GitHub Actions.

Configurer dans **Settings > Secrets and variables > Actions** :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_OWNER_EMAIL`

Activer **Settings > Pages** avec source **GitHub Actions**.

## Structure du projet

```
app/
  login/          → connexion magic link
  auth/callback/  → callback Supabase (client-side)
  owner/          → dashboard + CRUD tâches, vigilance, tutoriels
  sitter/         → checklist, vigilance, tutoriels (lecture), photos
lib/
  supabase/       → client Supabase (browser)
  hooks/          → useAuth (protection routes)
  compress-image  → compression photos côté client
  types           → types TypeScript
specs/
  schema.sql      → schéma DB complet (tables + RLS + données initiales)
public/
  charlie.jpg     → photo de Charlie
  manifest.json   → configuration PWA
.github/
  workflows/      → déploiement GitHub Pages
```
