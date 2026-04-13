# Charlie Management 🐱

Application web de cat sitting pour Charlie.

## Démarrage rapide

### 1. Supabase
1. Créer un compte et un projet sur [supabase.com](https://supabase.com)
2. Dans l'éditeur SQL, exécuter le contenu de `specs/schema.sql`
3. Dans Storage, créer un bucket nommé `charlie-photos` (public)

### 2. Variables d'environnement
```bash
cp .env.local.example .env.local
```
Remplir les valeurs dans `.env.local` :
- `NEXT_PUBLIC_SUPABASE_URL` — dans Settings > API de ton projet
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — dans Settings > API
- `OWNER_EMAIL` — ton adresse email (aura le rôle propriétaire)

### 3. Lancer en local
```bash
npm install
npm run dev
```
Ouvrir [http://localhost:3000](http://localhost:3000)

### 4. Photo de Charlie
Placer la photo de Charlie dans `public/charlie.jpg` — elle sera utilisée comme favicon et image de partage.

## Déploiement sur Vercel
1. Pousser le repo sur GitHub
2. Importer dans [vercel.com](https://vercel.com)
3. Ajouter les variables d'environnement dans les settings Vercel
4. Déployer

## Fonctionnalités
- **Propriétaire** : configurer les tâches, points de vigilance, tutoriels vidéo — consulter les photos et nouvelles envoyées par le cat sitter
- **Cat sitter** : cocher les tâches du jour, consulter les consignes, envoyer photos et nouvelles à la propriétaire
- **Auth** : connexion par magic link (email sans mot de passe)
