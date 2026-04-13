# Spécifications Techniques — Charlie Management

## Stack

| Couche       | Technologie                        |
|--------------|------------------------------------|
| Frontend     | Next.js 14 (App Router, TypeScript)|
| Styling      | Tailwind CSS                       |
| Backend      | Supabase (BaaS)                    |
| Auth         | Supabase Auth — Magic Link         |
| Storage      | Supabase Storage (photos)          |
| Base de données | Supabase PostgreSQL             |
| Déploiement  | Vercel                             |

## Architecture des routes

```
/                       → redirect selon rôle
/login                  → page de connexion (magic link)
/auth/callback          → callback OAuth/magic link

/sitter/checklist       → tâches du jour (cat sitter)
/sitter/vigilance       → points de vigilance (lecture seule)
/sitter/tutoriels       → tutoriels vidéo (lecture seule)
/sitter/photos          → upload photos + écrire nouvelles

/owner                  → tableau de bord (photos + nouvelles reçues)
/owner/vigilance        → CRUD points de vigilance
/owner/tutoriels        → CRUD tutoriels
/owner/checklist        → CRUD liste de tâches
```

## Schéma de base de données

### `profiles`
| Colonne    | Type    | Notes                        |
|------------|---------|------------------------------|
| id         | uuid    | = auth.users.id              |
| role       | text    | 'owner' ou 'cat_sitter'      |
| name       | text    | prénom affiché               |
| created_at | timestamp |                            |

### `tasks`
| Colonne    | Type    | Notes                        |
|------------|---------|------------------------------|
| id         | uuid    | PK                           |
| title      | text    | ex: "Croquettes"             |
| emoji      | text    | ex: "🐾"                    |
| sort_order | int     | ordre d'affichage            |
| created_at | timestamp |                            |

### `task_completions`
| Colonne      | Type      | Notes                      |
|--------------|-----------|----------------------------|
| id           | uuid      | PK                         |
| task_id      | uuid      | FK → tasks.id              |
| completed_by | uuid      | FK → profiles.id           |
| completed_at | timestamp |                            |
| date         | date      | jour de complétion         |

### `vigilance_points`
| Colonne    | Type    | Notes                        |
|------------|---------|------------------------------|
| id         | uuid    | PK                           |
| title      | text    | titre court                  |
| description| text    | détail                       |
| severity   | text    | 'info', 'warning', 'danger'  |
| sort_order | int     |                              |
| created_at | timestamp |                            |

### `tutorials`
| Colonne     | Type    | Notes                       |
|-------------|---------|-----------------------------|
| id          | uuid    | PK                          |
| title       | text    |                             |
| description | text    |                             |
| video_url   | text    | URL YouTube ou directe      |
| sort_order  | int     |                             |
| created_at  | timestamp |                           |

### `news`
| Colonne    | Type      | Notes                        |
|------------|-----------|------------------------------|
| id         | uuid      | PK                           |
| content    | text      | message du cat sitter        |
| author_id  | uuid      | FK → profiles.id             |
| created_at | timestamp |                              |

### `photos`
| Colonne    | Type      | Notes                        |
|------------|-----------|------------------------------|
| id         | uuid      | PK                           |
| url        | text      | URL Supabase Storage         |
| caption    | text      | légende optionnelle          |
| author_id  | uuid      | FK → profiles.id             |
| created_at | timestamp |                              |

## Auth — Magic Link + Rôles

1. L'utilisateur entre son email sur `/login`
2. Supabase envoie un magic link
3. Le lien redirige vers `/auth/callback`
4. Le callback vérifie si un profil existe :
   - Si l'email = `OWNER_EMAIL` → rôle `owner`
   - Sinon → rôle `cat_sitter`
5. Redirect vers la page d'accueil correspondante

## Row Level Security (RLS) Supabase

- `profiles` : lecture par owner et soi-même
- `tasks` : lecture par tous, écriture par owner uniquement
- `task_completions` : lecture par tous, écriture par cat_sitter
- `vigilance_points` : lecture par tous, écriture par owner
- `tutorials` : lecture par tous, écriture par owner
- `news` : lecture par tous, écriture par cat_sitter
- `photos` : lecture par tous, upload par cat_sitter

## Déploiement

1. Créer un projet Supabase (gratuit)
2. Exécuter le SQL de `specs/schema.sql`
3. Copier `.env.local.example` → `.env.local` et remplir les valeurs
4. `npm install && npm run dev` pour le dev local
5. Déployer sur Vercel : connecter le repo GitHub, ajouter les env vars
