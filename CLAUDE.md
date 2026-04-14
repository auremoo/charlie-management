# CLAUDE.md — Charlie Management

## Contexte du projet
Application web de cat sitting pour Charlie. Deux rôles : `owner` (propriétaire) et `cat_sitter`.
Flux bidirectionnel : owner configure les consignes, cat sitter envoie photos et nouvelles.

## Stack
- **Frontend** : Next.js 14, App Router, TypeScript strict, 100% client-side (static export)
- **Styling** : Tailwind CSS — palette `charlie` (orange/ambre chaud)
- **Backend** : Supabase (auth magic link, PostgreSQL, Storage)
- **Déploiement** : GitHub Pages (via GitHub Actions)

## Architecture
- **Static export** (`output: "export"`) — pas de serveur, tout tourne côté navigateur
- **Pas de middleware** — la protection des routes se fait via le hook `useAuth`
- **Pas de Server Components** — toutes les pages sont `"use client"`
- **Sécurité** assurée par les politiques RLS de Supabase côté base de données

## Structure des routes
```
/login                  → magic link login
/auth/callback          → callback Supabase (client-side)
/sitter/checklist       → tâches (cat sitter)
/sitter/vigilance       → consignes (lecture)
/sitter/tutoriels       → tutoriels (lecture)
/sitter/photos          → photos + nouvelles (upload)
/owner                  → dashboard (photos + nouvelles reçues)
/owner/vigilance        → CRUD vigilances
/owner/tutoriels        → CRUD tutoriels
/owner/checklist        → CRUD tâches
```

## Fichiers clés
- `lib/supabase/client.ts` — client browser Supabase
- `lib/hooks/use-auth.ts` — hook d'authentification + protection routes
- `lib/compress-image.ts` — compression photos côté client avant upload
- `specs/schema.sql` — schéma DB complet à exécuter dans Supabase
- `specs/URS.md` — exigences utilisateur
- `specs/specs.md` — spécifications techniques
- `.github/workflows/deploy.yml` — déploiement automatique GitHub Pages

## Variables d'environnement
Copier `.env.local.example` → `.env.local` et remplir :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_OWNER_EMAIL` — cet email obtient automatiquement le rôle `owner`

Pour GitHub Actions, configurer ces mêmes valeurs comme **secrets** du repository.

## Identité visuelle
- Favicon et OG image : `public/charlie.jpg` (photo de Charlie)
- Palette : `charlie-500` (#f86c14) comme couleur principale

## Commandes
```bash
npm install       # installer les dépendances
npm run dev       # démarrer en local (http://localhost:3000)
npm run build     # build statique (output dans /out) + copie 404.html
npm run lint      # vérifier le code
```
