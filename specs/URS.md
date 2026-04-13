# User Requirements Specification — Charlie Management

## Contexte
Application web légère dédiée à la gestion du cat sitting de Charlie.
Deux acteurs : la **propriétaire** et le/la **cat sitter**.

## Flux bidirectionnel

```
Propriétaire ──────────────────► Cat sitter
   (setup)    vigilances, tâches,    (lecture)
              tutoriels, consignes

Propriétaire ◄────────────────── Cat sitter
   (lecture)  photos, news,          (envoi)
              "Charlie va bien !"
```

## Exigences fonctionnelles

### 1. Tutoriels vidéo
- Afficher des tutoriels vidéo pour montrer où sont rangées les croquettes et friandises
- Indiquer la quantité à donner
- MVP : placeholders vidéo (YouTube embed ou URL directe)

### 2. Checklist de tâches
- Liste des tâches quotidiennes : nourriture, eau, robinet pour boire, câlins
- Le cat sitter peut cocher les tâches
- La propriétaire gère la liste (ajout / suppression / réordonnancement)

### 3. Partage de photos et nouvelles
- Le cat sitter peut uploader des photos de Charlie
- Le cat sitter peut écrire des messages / nouvelles
- La propriétaire reçoit et consulte ces photos et nouvelles

### 4. Points de vigilance
- Liste des alertes de sécurité visibles par le cat sitter
- Ne pas ouvrir les fenêtres
- Ne pas ouvrir la salle de bain (plante)
- Attention à la porte en entrant / sortant
- La propriétaire gère cette liste (ajout / suppression)

## Exigences non-fonctionnelles

- Application web légère, mobile-friendly
- Authentification par magic link (email sans mot de passe)
- 2 rôles : `owner` (propriétaire) et `cat_sitter`
- Déployable sur Vercel (gratuit)
- Stack : Next.js 14 + Supabase

## Identité visuelle
- Photo de Charlie comme favicon et OG image (`public/charlie.jpg`)
- Palette de couleurs chaudes (orange/ambre)
