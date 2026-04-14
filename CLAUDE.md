# CLAUDE.md — Charlie Management

## Contexte du projet
Plateforme web de cat sitting multi-utilisateurs. Chaque utilisateur peut être propriétaire (créer des fiches animaux) et/ou cat sitter (garder les animaux d'autres utilisateurs).
Charlie est la mascotte de l'application.

## Stack
- **Frontend** : Next.js 14, App Router, TypeScript strict, 100% client-side (static export)
- **Styling** : Tailwind CSS — palette `charlie` (tons chauds terre/luxe)
- **Backend** : Supabase (auth magic link, PostgreSQL, Storage)
- **Déploiement** : GitHub Pages (via GitHub Actions)

## Architecture
- **Static export** (`output: "export"`) — pas de serveur, tout tourne côté navigateur
- **Pas de middleware** — la protection des routes se fait via le hook `useAuth`
- **Pas de Server Components** — toutes les pages sont `"use client"` (wrappées pour `generateStaticParams`)
- **Sécurité** assurée par les politiques RLS de Supabase + fonctions `has_pet_access()` / `is_pet_owner()`
- **Multi-tenant** : chaque donnée est scopée à un `pet_id`

## Concepts clés
- **Pet** : fiche animal, concept central. Possède un `owner_id`.
- **PetSitter** : relation entre un pet et un sitter invité.
- **InviteCode** : code à usage unique pour inviter un sitter sur une fiche.
- Le rôle (owner/sitter) est **contextuel par pet**, pas global.

## Structure des routes
```
/login                          → magic link login
/auth/callback                  → callback Supabase (client-side)
/onboarding                     → choix : propriétaire ou sitter
/                               → hub (mes animaux + mes gardes)
/pet/new                        → créer une fiche animal
/pet/[id]/owner/                → dashboard owner (nouvelles reçues)
/pet/[id]/owner/checklist       → CRUD tâches
/pet/[id]/owner/vigilance       → CRUD points de vigilance
/pet/[id]/owner/tutoriels       → CRUD tutoriels
/pet/[id]/owner/invite          → inviter un sitter (code)
/pet/[id]/sitter/               → checklist du jour (sitter)
/pet/[id]/sitter/vigilance      → consignes (lecture)
/pet/[id]/sitter/tutoriels      → tutoriels (lecture)
/pet/[id]/sitter/photos         → photos + nouvelles (upload)
/join                           → saisir un code d'invitation
/join/[code]                    → rejoindre via lien direct
```

## Fichiers clés
- `lib/supabase/client.ts` — client browser Supabase
- `lib/hooks/use-auth.ts` — hook d'authentification
- `lib/compress-image.ts` — compression photos côté client avant upload
- `lib/types.ts` — types TypeScript (Pet, PetSitter, InviteCode, Task, etc.)
- `specs/schema-v2.sql` — schéma DB v2 multi-tenant
- `.github/workflows/deploy.yml` — déploiement automatique GitHub Pages

## Variables d'environnement
Copier `.env.local.example` → `.env.local` et remplir :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Pour GitHub Actions, configurer ces mêmes valeurs comme **secrets** du repository.

## Identité visuelle
- Mascotte : Charlie (photo `public/charlie.jpg`)
- Palette : tons chauds terre/luxe (charlie-50 à charlie-950)
- Typographie : Inter, style Apple/luxe
- Navigation : frosted glass (backdrop-blur)

## Commandes
```bash
npm install       # installer les dépendances
npm run dev       # démarrer en local (http://localhost:3000)
npm run build     # build statique (output dans /out) + copie 404.html
npm run lint      # vérifier le code
```
