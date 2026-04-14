# Charlie

Plateforme web de cat sitting. Créez une fiche pour votre animal, invitez un cat sitter, suivez les nouvelles en temps réel.

Charlie est la mascotte de l'application.

**[Voir l'app en ligne](https://auremoo.github.io/charlie-management/)**

## Fonctionnalités

### Propriétaire
- Créer une fiche animal (nom)
- Tableau de bord avec fil chronologique des photos et messages reçus
- Gestion des tâches quotidiennes (emoji personnalisable, ordre d'affichage)
- Gestion des points de vigilance (3 niveaux : info, attention, danger)
- Gestion des tutoriels avec vidéos YouTube intégrées
- Inviter un cat sitter par code d'invitation

### Cat sitter
- Rejoindre une fiche animal via code d'invitation
- Checklist quotidienne avec barre de progression (reset chaque jour)
- Consultation des points de vigilance (lecture seule)
- Consultation des tutoriels vidéo (lecture seule)
- Envoi de photos (compression automatique) et messages au propriétaire

### Multi-rôles
- Un utilisateur peut être propriétaire de plusieurs animaux
- Un utilisateur peut être sitter de plusieurs animaux
- Un utilisateur peut être propriétaire ET sitter (de différents animaux)
- Le rôle est contextuel par fiche animal, pas global

### Authentification & sécurité
- Connexion par magic link (email, sans mot de passe)
- Protection des routes côté client via hook `useAuth`
- Row Level Security (RLS) sur toutes les tables Supabase
- Fonctions SQL `has_pet_access()` et `is_pet_owner()` pour les politiques

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
2. Dans **SQL Editor**, exécuter le contenu de `specs/schema-v2.sql`
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

### 3. Photo mascotte
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

Activer **Settings > Pages** avec source **GitHub Actions**.

## Structure du projet

```
app/
  login/                → connexion magic link
  auth/callback/        → callback Supabase (client-side)
  onboarding/           → choix propriétaire / sitter
  join/                 → saisir un code d'invitation
  join/[code]/          → rejoindre via lien direct
  pet/new/              → créer une fiche animal
  pet/[id]/owner/       → dashboard + CRUD (tâches, vigilance, tutoriels, invitation)
  pet/[id]/sitter/      → checklist, vigilance, tutoriels, photos
lib/
  supabase/             → client Supabase (browser)
  hooks/                → useAuth (protection routes)
  compress-image.ts     → compression photos côté client
  types.ts              → types TypeScript
specs/
  schema-v2.sql         → schéma DB v2 multi-tenant
public/
  charlie.jpg           → photo mascotte
  manifest.json         → configuration PWA
.github/
  workflows/            → déploiement GitHub Pages
```
