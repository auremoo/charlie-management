# CLAUDE.md — Charlie Management

## Contexte du projet
Application web de cat sitting pour Charlie. Deux rôles : `owner` (propriétaire) et `cat_sitter`.
Flux bidirectionnel : owner configure les consignes, cat sitter envoie photos et nouvelles.

## Stack
- **Frontend** : Next.js 14, App Router, TypeScript strict
- **Styling** : Tailwind CSS — palette `charlie` (orange/ambre chaud)
- **Backend** : Supabase (auth magic link, PostgreSQL, Storage)
- **Déploiement** : Vercel

## Structure des routes
```
/login                  → magic link login
/auth/callback          → callback Supabase
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
- `lib/supabase/client.ts` — client browser
- `lib/supabase/server.ts` — client server (cookies)
- `middleware.ts` — protection des routes par rôle
- `specs/schema.sql` — schéma DB complet à exécuter dans Supabase
- `specs/URS.md` — exigences utilisateur
- `specs/specs.md` — spécifications techniques

## Variables d'environnement
Copier `.env.local.example` → `.env.local` et remplir :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OWNER_EMAIL` — cet email obtient automatiquement le rôle `owner`

## Identité visuelle
- Favicon et OG image : `public/charlie.jpg` (photo de Charlie)
- Palette : `charlie-500` (#f86c14) comme couleur principale

## Commandes
```bash
npm install       # installer les dépendances
npm run dev       # démarrer en local (http://localhost:3000)
npm run build     # build de production
npm run lint      # vérifier le code
```
