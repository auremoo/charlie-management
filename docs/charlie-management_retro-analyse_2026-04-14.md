# Rétro-Analyse Fonctionnelle — Charlie Management

**Date** : 14 avril 2026  
**Projet** : Charlie Management — Application de cat sitting  
**Version analysée** : branche `main`, commit `da8c5df`

---

## 1. Contexte et Perimetre

### Description du systeme

Charlie Management est une application web de **gestion de garde de chat**. Elle met en relation un propriétaire de chat (Charlie) avec un ou plusieurs cat sitters. Le flux est **bidirectionnel** :

- **Propriétaire → Cat sitter** : consignes (tâches quotidiennes, points de vigilance, tutoriels vidéo)
- **Cat sitter → Propriétaire** : nouvelles (photos, messages texte)

L'application est conçue pour un usage **mobile-first**, optimisée pour être utilisée depuis un smartphone lors des visites du cat sitter.

### Technologies

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | Next.js 14 (App Router) + React 18 | Interface utilisateur SSR/CSR hybride |
| Styling | Tailwind CSS | Design responsive, palette orange "Charlie" |
| Backend | Supabase (PostgreSQL + Auth + Storage) | Base de données, authentification, stockage photos |
| Authentification | Supabase Auth (Magic Link OTP) | Connexion sans mot de passe par email |
| Déploiement | Vercel | Hébergement et CDN |

### Architecture

```
┌─────────────────────────────────────────────────┐
│                   NAVIGATEUR                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Owner   │  │  Sitter  │  │    Login      │  │
│  │  Pages   │  │  Pages   │  │    Page       │  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │               │           │
│       └──────────┬───┘               │           │
│                  │                   │           │
│       ┌──────────▼───────────────────▼──────┐   │
│       │        Middleware (routage rôle)      │   │
│       └──────────────────┬───────────────────┘   │
└──────────────────────────┼───────────────────────┘
                           │
              ┌────────────▼────────────┐
              │       SUPABASE          │
              │  ┌──────────────────┐   │
              │  │   Auth (OTP)     │   │
              │  ├──────────────────┤   │
              │  │   PostgreSQL     │   │
              │  │   + RLS Policies │   │
              │  ├──────────────────┤   │
              │  │   Storage        │   │
              │  │   (charlie-photos)│  │
              │  └──────────────────┘   │
              └─────────────────────────┘
```

**Particularité** : il n'y a **aucune API REST custom**. Toutes les opérations passent directement par le SDK JavaScript Supabase côté client, avec la sécurité assurée par les politiques RLS (Row Level Security) au niveau base de données.

---

## 2. Domaines Fonctionnels

### Cartographie des domaines

| Domaine | Description | Rôle principal |
|---------|-------------|----------------|
| **Authentification** | Connexion, attribution de rôle, protection des routes | Tous |
| **Gestion des tâches** | Définition et suivi quotidien des tâches de garde | Owner (config) / Sitter (exécution) |
| **Vigilance** | Documentation des risques et consignes de sécurité | Owner (rédaction) / Sitter (consultation) |
| **Tutoriels** | Guides visuels avec vidéos YouTube intégrées | Owner (création) / Sitter (consultation) |
| **Communication** | Envoi de photos et messages texte du sitter vers l'owner | Sitter (émission) / Owner (réception) |

### Matrice domaines / fichiers sources

| Domaine | Pages Owner | Pages Sitter | Fichiers partagés |
|---------|-------------|--------------|-------------------|
| Auth | — | — | `middleware.ts`, `app/login/page.tsx`, `app/auth/callback/route.ts` |
| Tâches | `app/owner/checklist/page.tsx` | `app/sitter/checklist/page.tsx` | `lib/types.ts` (Task, TaskCompletion) |
| Vigilance | `app/owner/vigilance/page.tsx` | `app/sitter/vigilance/page.tsx` | `lib/types.ts` (VigilancePoint) |
| Tutoriels | `app/owner/tutoriels/page.tsx` | `app/sitter/tutoriels/page.tsx` | `lib/types.ts` (Tutorial) |
| Communication | `app/owner/page.tsx` | `app/sitter/photos/page.tsx` | `lib/types.ts` (Photo, NewsItem) |

---

## 3. Inventaire des Processus Metier

### Vue d'ensemble

| # | Processus | Domaine | Déclencheur | Criticité |
|---|-----------|---------|-------------|-----------|
| P1 | S'authentifier par magic link | Auth | UI (formulaire login) | **Haute** |
| P2 | Attribuer un rôle au premier login | Auth | Callback auth automatique | **Haute** |
| P3 | Créer une tâche quotidienne | Tâches | UI (owner) | Moyenne |
| P4 | Supprimer une tâche | Tâches | UI (owner) | Basse |
| P5 | Compléter une tâche du jour | Tâches | UI (sitter) | **Haute** |
| P6 | Décocher une tâche du jour | Tâches | UI (sitter) | Basse |
| P7 | Créer un point de vigilance | Vigilance | UI (owner) | Moyenne |
| P8 | Supprimer un point de vigilance | Vigilance | UI (owner) | Basse |
| P9 | Consulter les consignes de vigilance | Vigilance | UI (sitter) | **Haute** |
| P10 | Créer un tutoriel | Tutoriels | UI (owner) | Moyenne |
| P11 | Supprimer un tutoriel | Tutoriels | UI (owner) | Basse |
| P12 | Consulter les tutoriels | Tutoriels | UI (sitter) | Moyenne |
| P13 | Envoyer une photo de Charlie | Communication | UI (sitter) | **Haute** |
| P14 | Envoyer un message (nouvelle) | Communication | UI (sitter) | **Haute** |
| P15 | Consulter le fil d'actualités | Communication | UI (owner) | **Haute** |

### Detail des processus

---

#### P1 — S'authentifier par magic link

**Domaine** : Authentification  
**Criticité** : Haute  
**Déclencheur** : L'utilisateur accède à l'application sans session active  
**Acteur** : Tout utilisateur (owner ou cat sitter)

**Flux principal** :

```
Utilisateur           App (Login)           Supabase Auth         Email
    │                     │                      │                  │
    ├─ Accède à /login ──►│                      │                  │
    │                     │                      │                  │
    ├─ Saisit email ─────►│                      │                  │
    │                     ├─ signInWithOtp() ───►│                  │
    │                     │                      ├─ Envoie OTP ───►│
    │                     │◄─ OK ────────────────┤                  │
    │◄─ "Vérifie tes     │                      │                  │
    │    emails" ─────────┤                      │                  │
    │                     │                      │                  │
    │◄─────────────── Clic sur magic link ──────────────────────────┤
    │                     │                      │                  │
    ├─ /auth/callback ───►│                      │                  │
    │                     ├─ exchangeCode() ────►│                  │
    │                     │◄─ Session JWT ───────┤                  │
    │◄─ Redirect rôle ───┤                      │                  │
```

**Pré-conditions** : Aucune session active  
**Post-conditions** : Session JWT active, cookie de session posé  
**Règles de gestion** :
- R1.1 : La connexion se fait uniquement par email magic link (pas de mot de passe)
- R1.2 : L'OTP est envoyé avec `emailRedirectTo` pointant vers `/auth/callback`

**Références** : `app/login/page.tsx:13-30`, `app/auth/callback/route.ts:5-46`

---

#### P2 — Attribuer un role au premier login

**Domaine** : Authentification  
**Criticité** : Haute  
**Déclencheur** : Premier callback d'authentification réussi (profil inexistant)  
**Acteur** : Système (automatique)

**Flux principal** :

```
Auth Callback          Supabase DB
     │                      │
     ├─ SELECT profiles ───►│
     │◄─ null (1er login) ──┤
     │                      │
     ├─ Vérifie email vs   │
     │  OWNER_EMAIL         │
     │                      │
     ├─ INSERT profiles ───►│
     │  (role = résultat)   │
     │◄─ OK ────────────────┤
     │                      │
     ├─ Redirect selon rôle │
```

**Pré-conditions** : Authentification OTP réussie, profil inexistant en base  
**Post-conditions** : Profil créé avec rôle attribué  
**Règles de gestion** :
- R2.1 : Si l'email correspond à la variable d'environnement `OWNER_EMAIL` → rôle `owner`
- R2.2 : Pour tout autre email → rôle `cat_sitter`
- R2.3 : Le rôle est attribué une seule fois au premier login et ne change plus
- R2.4 : Le nom affiché (`name`) est extrait de la partie locale de l'email (avant @), avec la première lettre en majuscule

**Références** : `app/auth/callback/route.ts:15-41`

---

#### P5 — Completer une tache du jour

**Domaine** : Gestion des tâches  
**Criticité** : Haute  
**Déclencheur** : Le cat sitter coche une tâche dans sa checklist  
**Acteur** : Cat sitter

**Flux principal** :

```
Cat Sitter            Checklist Page        Supabase DB
     │                     │                     │
     │◄─ Affiche tâches ──┤◄─ SELECT tasks ─────┤
     │   + complétions     │◄─ SELECT completions│
     │   du jour           │   (date = today)    │
     │                     │                     │
     ├─ Coche tâche X ───►│                     │
     │                     ├─ INSERT completion ►│
     │                     │  (task_id, user_id, │
     │                     │   date=today)       │
     │◄─ ✓ affiché ───────┤◄─ OK ───────────────┤
     │   + barre progress  │                     │
     │     mise à jour     │                     │
```

**Pré-conditions** :
- Sitter connecté
- La tâche n'est pas déjà complétée pour le jour courant

**Post-conditions** :
- Enregistrement `task_completions` créé pour (tâche, date du jour)
- Barre de progression mise à jour

**Règles de gestion** :
- R5.1 : Une tâche ne peut être complétée qu'une fois par jour (contrainte UNIQUE `task_id + date`)
- R5.2 : La date de complétion est automatiquement la date du jour (`CURRENT_DATE`)
- R5.3 : La barre de progression affiche le ratio `tâches complétées / total tâches`
- R5.4 : Quand toutes les tâches sont complétées, un message de félicitations apparaît

**Flux alternatif (P6 — décocher)** :
- Le sitter clique à nouveau sur une tâche complétée → DELETE de la complétion pour cette tâche et cette date

**Références** : `app/sitter/checklist/page.tsx:27-50`

---

#### P9 — Consulter les consignes de vigilance

**Domaine** : Vigilance  
**Criticité** : Haute  
**Déclencheur** : Le cat sitter navigue vers l'onglet Vigilance  
**Acteur** : Cat sitter

**Flux** : Chargement des points de vigilance triés par `sort_order`, affichage en lecture seule avec code couleur selon sévérité :
- `danger` (rouge) : risque critique pour le chat
- `warning` (ambre) : précaution importante
- `info` (bleu) : information utile

**Références** : `app/sitter/vigilance/page.tsx:1-69`

---

#### P13 — Envoyer une photo de Charlie

**Domaine** : Communication  
**Criticité** : Haute  
**Déclencheur** : Le cat sitter prend/sélectionne une photo  
**Acteur** : Cat sitter

**Flux principal** :

```
Cat Sitter         Photos Page          Supabase Storage    Supabase DB
     │                  │                      │                 │
     ├─ Sélectionne    │                      │                 │
     │  photo ────────►│                      │                 │
     │                  │                      │                 │
     ├─ (opt) Légende ►│                      │                 │
     │                  │                      │                 │
     ├─ Clic Envoyer ─►│                      │                 │
     │                  ├─ upload(bucket,     │                 │
     │                  │   path, file) ─────►│                 │
     │                  │◄─ OK ───────────────┤                 │
     │                  │                      │                 │
     │                  ├─ getPublicUrl() ───►│                 │
     │                  │◄─ URL publique ─────┤                 │
     │                  │                      │                 │
     │                  ├─ INSERT photos ─────────────────────►│
     │                  │  (url, caption,      │                │
     │                  │   author_id)         │                │
     │                  │◄─────────────────────────── OK ──────┤
     │◄─ Photo ajoutée │                      │                 │
     │   dans galerie ──┤                      │                 │
```

**Pré-conditions** : Sitter connecté, fichier image sélectionné  
**Post-conditions** : Image stockée dans le bucket, référence en base, visible par l'owner  

**Règles de gestion** :
- R13.1 : Le chemin de stockage est `{user_id}/{timestamp}-{filename}` (unicité garantie)
- R13.2 : Le bucket `charlie-photos` est public (images accessibles sans token)
- R13.3 : L'input file utilise `capture="environment"` pour proposer la caméra sur mobile
- R13.4 : La légende est optionnelle
- R13.5 : Les 20 dernières photos sont affichées dans la galerie

**Références** : `app/sitter/photos/page.tsx:31-59`

---

#### P14 — Envoyer un message (nouvelle)

**Domaine** : Communication  
**Criticité** : Haute  
**Déclencheur** : Le cat sitter tape un message et l'envoie  
**Acteur** : Cat sitter

**Flux** : Insert dans la table `news` avec `content` et `author_id`. Le message est immédiatement visible dans l'historique du sitter (10 derniers) et sur le dashboard de l'owner (20 derniers) après rafraîchissement.

**Règles de gestion** :
- R14.1 : Le message ne peut pas être vide (bouton désactivé si champ vide)
- R14.2 : Les 10 derniers messages sont affichés côté sitter

**Références** : `app/sitter/photos/page.tsx:61-74`

---

#### P15 — Consulter le fil d'actualites

**Domaine** : Communication  
**Criticité** : Haute  
**Déclencheur** : L'owner accède à son dashboard  
**Acteur** : Owner

**Flux** : Chargement des 20 dernières photos et 20 derniers messages, affichés chronologiquement (plus récents en premier). Les photos sont affichées en grille avec légende, les messages en cartes texte.

**Références** : `app/owner/page.tsx:1-73`

---

#### P3 — Creer une tache quotidienne

**Domaine** : Gestion des tâches  
**Criticité** : Moyenne  
**Déclencheur** : L'owner ajoute une tâche via le formulaire  
**Acteur** : Owner

**Flux** : Saisie d'un titre + sélection d'un emoji parmi 10 choix prédéfinis → INSERT dans `tasks`. La tâche apparaît immédiatement dans la liste et sera visible par le sitter.

**Règles de gestion** :
- R3.1 : Le titre est obligatoire
- R3.2 : L'emoji par défaut est `🐾`
- R3.3 : 10 emojis sont proposés : 🐱 🐾 🥣 💧 🧹 💊 🎾 😺 🚿 🤗
- R3.4 : L'ordre d'affichage est contrôlé par `sort_order`

**Références** : `app/owner/checklist/page.tsx:23-43`

---

#### P7 — Creer un point de vigilance

**Domaine** : Vigilance  
**Criticité** : Moyenne  
**Déclencheur** : L'owner documente un risque  
**Acteur** : Owner

**Flux** : Saisie titre + description optionnelle + sélection niveau de sévérité (info/warning/danger) → INSERT dans `vigilance_points`.

**Règles de gestion** :
- R7.1 : Titre obligatoire, description optionnelle
- R7.2 : Trois niveaux de sévérité : `info` (information), `warning` (attention), `danger` (danger)
- R7.3 : Sévérité par défaut : `info`

**Références** : `app/owner/vigilance/page.tsx:37-59`

---

#### P10 — Creer un tutoriel

**Domaine** : Tutoriels  
**Criticité** : Moyenne  
**Déclencheur** : L'owner crée un guide  
**Acteur** : Owner

**Flux** : Saisie titre + description + URL YouTube optionnelle → INSERT dans `tutorials`. Si URL YouTube fournie, conversion automatique en URL embed pour lecture intégrée.

**Règles de gestion** :
- R10.1 : Titre obligatoire
- R10.2 : URL vidéo optionnelle, doit être YouTube
- R10.3 : Conversion automatique `watch?v=` → `embed/` pour l'iframe YouTube

**Références** : `app/owner/tutoriels/page.tsx:25-47`

---

## 4. Modele de Donnees Metier

### Diagramme entités-relations

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│  auth.users  │       │    profiles       │       │    tasks      │
│──────────────│       │──────────────────│       │──────────────│
│ id (PK)      │◄──────│ id (PK, FK)      │       │ id (PK)      │
│ email        │       │ role             │       │ title        │
│              │       │ name             │       │ emoji        │
│              │       │ created_at       │       │ sort_order   │
└──────────────┘       └──────┬───────────┘       │ created_at   │
                              │                    └──────┬───────┘
                              │                           │
              ┌───────────────┼───────────┐               │
              │               │           │               │
              ▼               ▼           ▼               ▼
   ┌──────────────┐  ┌────────────┐  ┌─────────────────────────┐
   │    photos     │  │    news    │  │   task_completions       │
   │──────────────│  │────────────│  │─────────────────────────│
   │ id (PK)      │  │ id (PK)    │  │ id (PK)                 │
   │ url          │  │ content    │  │ task_id (FK → tasks)     │
   │ caption      │  │ author_id  │  │ completed_by (FK → prof) │
   │ author_id(FK)│  │ created_at │  │ date                     │
   │ created_at   │  └────────────┘  │ completed_at             │
   └──────────────┘                   │ UNIQUE(task_id, date)    │
                                      └─────────────────────────┘

   ┌──────────────────┐    ┌──────────────┐
   │ vigilance_points  │    │  tutorials   │
   │──────────────────│    │──────────────│
   │ id (PK)          │    │ id (PK)      │
   │ title            │    │ title        │
   │ description      │    │ description  │
   │ severity         │    │ video_url    │
   │ sort_order       │    │ sort_order   │
   │ created_at       │    │ created_at   │
   └──────────────────┘    └──────────────┘
```

### Etats et transitions

#### Tache quotidienne (par jour)

```
  ┌──────────┐    Sitter coche     ┌──────────┐
  │ A faire  │ ──────────────────► │ Faite    │
  └──────────┘                     └──────────┘
       ▲         Sitter décoche         │
       └────────────────────────────────┘
```

- L'état est porté par la **présence ou absence** d'un enregistrement `task_completions` pour le couple `(task_id, date_du_jour)`.
- Chaque nouveau jour, toutes les tâches reviennent à l'état "A faire" (pas de complétion pour la nouvelle date).

#### Severite d'un point de vigilance

```
  info ─── warning ─── danger
  (bleu)    (ambre)    (rouge)
```

Pas de transition automatique — le niveau est fixé à la création par l'owner.

---

## 5. Interfaces et Communication

### API (Supabase SDK — pas de REST custom)

L'application n'expose **aucune API REST**. Toutes les opérations sont effectuées via le SDK JavaScript Supabase directement depuis le navigateur. La sécurité repose sur les politiques RLS.

| Table | SELECT | INSERT | DELETE | Condition RLS |
|-------|--------|--------|--------|---------------|
| `profiles` | Tous connectés | Soi-même | — | `auth.uid() = id` |
| `tasks` | Tous connectés | Owner | Owner | `role = 'owner'` via profil |
| `task_completions` | Tous connectés | Tous connectés | Tous connectés | `auth.uid() IS NOT NULL` |
| `vigilance_points` | Tous connectés | Owner | Owner | `role = 'owner'` via profil |
| `tutorials` | Tous connectés | Owner | Owner | `role = 'owner'` via profil |
| `news` | Tous connectés | Auteur | Auteur | `auth.uid() = author_id` |
| `photos` | Tous connectés | Auteur | Auteur | `auth.uid() = author_id` |

### Communication inter-roles

```
OWNER                                          CAT SITTER
  │                                                │
  ├─ Crée tâches ──────── tasks ──────────────────►│ Consulte + complète
  ├─ Crée vigilance ───── vigilance_points ───────►│ Consulte (lecture seule)
  ├─ Crée tutoriels ───── tutorials ──────────────►│ Consulte (lecture seule)
  │                                                │
  │◄────────────────────── photos ─────────────────┤ Envoie photos
  │◄────────────────────── news ───────────────────┤ Envoie messages
  │                                                │
  │  Consulte dashboard                            │
  │  (fil chronologique)                           │
```

**Mode de communication** : Pull-based (rechargement manuel). Pas de temps réel, pas de notifications push.

### Parcours utilisateur — Owner

```
/login → /auth/callback → /owner (dashboard)
                              │
                    ┌─────────┼─────────┬──────────┐
                    ▼         ▼         ▼          ▼
              /owner      /owner/    /owner/     /owner/
            (Nouvelles)  checklist  vigilance   tutoriels
              Photos +    CRUD       CRUD        CRUD
              Messages   tâches     points      tutoriels
```

### Parcours utilisateur — Cat Sitter

```
/login → /auth/callback → /sitter/checklist
                              │
                    ┌─────────┼─────────┬──────────┐
                    ▼         ▼         ▼          ▼
              /sitter/    /sitter/   /sitter/    /sitter/
              checklist   vigilance  tutoriels   photos
              Cocher      Lire       Lire        Envoyer
              tâches      consignes  vidéos      photos +
              du jour                            messages
```

---

## 6. Regles de Gestion Consolidees

| # | Règle | Domaine | Référence |
|---|-------|---------|-----------|
| R1.1 | La connexion se fait uniquement par email magic link (OTP) | Auth | `app/login/page.tsx:19` |
| R2.1 | L'email correspondant à `OWNER_EMAIL` obtient le rôle `owner` | Auth | `app/auth/callback/route.ts:23` |
| R2.2 | Tout autre email obtient le rôle `cat_sitter` | Auth | `app/auth/callback/route.ts:26` |
| R2.3 | Le rôle est attribué au premier login et ne change plus | Auth | `app/auth/callback/route.ts:15-19` |
| R2.4 | Le nom est déduit de l'email (partie avant @, capitalisée) | Auth | `app/auth/callback/route.ts:30` |
| R3.1 | Le titre d'une tâche est obligatoire | Tâches | `app/owner/checklist/page.tsx:26` |
| R3.2 | L'emoji par défaut est `🐾` | Tâches | `specs/schema.sql:37` |
| R5.1 | Une tâche ne peut être complétée qu'une fois par jour | Tâches | `specs/schema.sql:68` (UNIQUE) |
| R5.2 | Les complétions sont réinitialisées chaque jour (filtre date) | Tâches | `app/sitter/checklist/page.tsx:18` |
| R7.1 | Un point de vigilance a un titre obligatoire | Vigilance | `app/owner/vigilance/page.tsx:44` |
| R7.2 | Trois niveaux de sévérité : info, warning, danger | Vigilance | `specs/schema.sql:85` |
| R10.1 | Un tutoriel a un titre obligatoire | Tutoriels | `app/owner/tutoriels/page.tsx:32` |
| R10.3 | Les URL YouTube sont converties en URL embed | Tutoriels | `app/sitter/tutoriels/page.tsx:25-27` |
| R13.1 | Les photos sont stockées sous `{user_id}/{timestamp}-{filename}` | Communication | `app/sitter/photos/page.tsx:41` |
| R13.2 | Le bucket photos est public | Communication | Configuration Supabase |
| R13.3 | L'input fichier propose la caméra sur mobile | Communication | `app/sitter/photos/page.tsx:98` |
| R14.1 | Un message ne peut pas être vide | Communication | `app/sitter/photos/page.tsx:65` |

---

## 7. Glossaire

| Terme technique | Terme métier | Description |
|-----------------|-------------|-------------|
| `owner` | Propriétaire | La personne qui possède le chat Charlie |
| `cat_sitter` | Cat sitter / Gardien | La personne qui garde Charlie en l'absence du propriétaire |
| `tasks` | Tâches quotidiennes | Actions à réaliser chaque jour (nourriture, eau, câlins...) |
| `task_completions` | Complétions | Enregistrement qu'une tâche a été faite un jour donné |
| `vigilance_points` | Points de vigilance | Consignes de sécurité ou précautions pour le chat |
| `severity` | Niveau de sévérité | Criticité d'un point de vigilance (info/attention/danger) |
| `tutorials` | Tutoriels | Guides avec vidéo pour expliquer les gestes de soin |
| `news` | Nouvelles / Messages | Messages texte envoyés par le sitter au propriétaire |
| `photos` | Photos | Images de Charlie prises par le sitter |
| `magic link` | Lien magique | Méthode de connexion sans mot de passe, par email |
| `RLS` | Sécurité par ligne | Politiques de sécurité au niveau base de données |
| `checklist` | Liste de tâches | Vue du sitter pour cocher les tâches accomplies |
| `dashboard` | Tableau de bord | Vue du propriétaire pour consulter les nouvelles |
| `sort_order` | Ordre d'affichage | Position d'un élément dans la liste |
| `bucket` | Espace de stockage | Zone de stockage Supabase pour les fichiers photos |

---

## 8. Alertes et Points de Vigilance

| # | Constat | Catégorie | Sévérité | Processus impacté | Référence |
|---|---------|-----------|----------|-------------------|-----------|
| A1 | **Pas de validation côté serveur** : toutes les insertions sont faites côté client. Un utilisateur malveillant pourrait contourner les validations du formulaire (ex: titre vide). La sécurité repose uniquement sur les contraintes SQL (NOT NULL) et les RLS. | Sécurité | **Critique** | P3, P7, P10, P13, P14 | Toutes les pages owner/sitter |
| A2 | **Pas de limite de taille sur les uploads photos** : aucune vérification de la taille ou du type de fichier avant upload dans le bucket Storage. Un utilisateur pourrait uploader des fichiers très volumineux ou non-images. | Sécurité | **Critique** | P13 | `app/sitter/photos/page.tsx:40` |
| A3 | **Bucket photos public** : toutes les photos sont accessibles sans authentification via leur URL directe. Si l'URL est partagée ou devinée, n'importe qui peut voir les photos. | Sécurité | **Important** | P13, P15 | Configuration Supabase Storage |
| A4 | **Pas de mécanisme de rafraîchissement automatique** : l'owner doit recharger manuellement la page pour voir les nouvelles photos/messages. Le sitter doit recharger pour voir les nouvelles tâches. | Stabilité | **Important** | P5, P13, P14, P15 | `app/owner/page.tsx`, `app/sitter/checklist/page.tsx` |
| A5 | **Pas de confirmation de suppression** : les tâches, points de vigilance et tutoriels sont supprimés immédiatement sans confirmation. Pas de soft-delete ni de corbeille. | Fiabilité | **Important** | P4, P8, P11 | `app/owner/checklist/page.tsx:41`, etc. |
| A6 | **Rôle immuable** : une fois attribué, le rôle ne peut pas être changé via l'interface. Si l'email owner change ou si un sitter doit devenir owner, il faut intervenir directement en base. | Stabilité | **A surveiller** | P2 | `app/auth/callback/route.ts:15-28` |
| A7 | **Pas de gestion d'erreurs visible** : les erreurs Supabase sont loggées en console (`console.error`) mais ne sont pas affichées à l'utilisateur dans la plupart des pages. | Fiabilité | **A surveiller** | Tous | Toutes les pages |
| A8 | **Complétions sans contrôle de rôle côté RLS** : la politique RLS sur `task_completions` autorise INSERT/DELETE pour tous les utilisateurs connectés, pas uniquement les cat sitters. L'owner pourrait techniquement cocher des tâches. | Sécurité | **A surveiller** | P5, P6 | `specs/schema.sql:70-76` |
| A9 | **Pas de pagination** : les photos et messages sont limités à 20/10 items. L'historique ancien n'est pas accessible. | Fiabilité | **A surveiller** | P15 | `app/owner/page.tsx:7-8` |
| A10 | **Absence de fonctionnalité UPDATE** : aucune entité ne peut être modifiée après création (pas d'édition de tâche, de point de vigilance, de tutoriel). Seule option : supprimer et recréer. | Fiabilité | **A surveiller** | P3, P7, P10 | Toutes les pages CRUD |
