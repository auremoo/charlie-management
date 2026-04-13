# TODO — Mise en production de Charlie Management

## 1. Installer Node.js
- [ ] Installer Homebrew : `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
- [ ] Installer Node : `brew install node`
- [ ] Vérifier : `node --version` et `npm --version`

## 2. Créer le projet Supabase
- [ ] Créer un compte sur [supabase.com](https://supabase.com) si pas encore fait
- [ ] Créer un nouveau projet
- [ ] Dans **SQL Editor**, coller et exécuter le contenu de `specs/schema.sql`
- [ ] Dans **Storage**, créer un bucket nommé `charlie-photos` (cocher "Public bucket")

## 3. Configurer les variables d'environnement
- [ ] Copier `.env.local.example` → `.env.local`
- [ ] Remplir `NEXT_PUBLIC_SUPABASE_URL` (Settings > API dans Supabase)
- [ ] Remplir `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Settings > API dans Supabase)
- [ ] Remplir `OWNER_EMAIL` avec ton email (ce sera le compte propriétaire)

## 4. Ajouter la photo de Charlie
- [ ] Déposer la photo de Charlie dans `public/charlie.jpg`
  → Elle sera utilisée comme favicon, icône Apple et image de partage

## 5. Lancer l'app en local
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] Ouvrir [http://localhost:3000](http://localhost:3000)
- [ ] Se connecter avec son email → vérifier le magic link reçu
- [ ] Tester les deux rôles (owner + cat_sitter avec un autre email)

## 6. Déployer sur Vercel
- [ ] Pousser le repo sur GitHub
- [ ] Créer un compte sur [vercel.com](https://vercel.com)
- [ ] Importer le repo GitHub dans Vercel
- [ ] Ajouter les 3 variables d'environnement dans Vercel (Settings > Environment Variables)
- [ ] Déployer 🚀
