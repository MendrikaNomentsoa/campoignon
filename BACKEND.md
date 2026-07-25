# Compoignon — Organisation Backend

Application web Next.js : login → choix d'une communauté → suivi d'apprentissage accompagné par une IA (rappels, encouragements, suivi de progression).

Ce document sert de référence commune pour toute l'équipe backend. Toute personne qui commence une tâche doit s'y référer avant de coder, pour éviter les conflits de structure.

---

## 1. Stack technique

| Élément | Choix |
|---|---|
| Framework | Next.js (App Router) |
| Backend | Route Handlers (`app/api/.../route.ts`) + Server Actions |
| Base de données | Supabase (Postgres) |
| Auth | Supabase Auth (email/password + OAuth si besoin) |
| IA | API Claude (Anthropic) |
| Déploiement | Vercel |
| Langage | TypeScript partout |

---

## 2. Structure des dossiers

```
compagnon/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/
│   │   ├── communities/
│   │   │   ├── page.tsx              # liste des communautés à rejoindre
│   │   │   └── [communityId]/
│   │   │       ├── page.tsx          # espace de la communauté
│   │   │       └── journal/page.tsx  # journal d'apprentissage
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts
│   │   ├── communities/
│   │   │   ├── route.ts              # GET (liste), POST (créer)
│   │   │   └── [communityId]/
│   │   │       ├── join/route.ts     # POST rejoindre
│   │   │       └── route.ts          # GET détails
│   │   ├── entries/
│   │   │   ├── route.ts              # GET, POST entrées d'apprentissage
│   │   │   └── [entryId]/route.ts    # PATCH, DELETE
│   │   ├── ai/
│   │   │   ├── chat/route.ts         # conversation avec l'IA compagnon
│   │   │   └── reminders/route.ts    # génération des rappels
│   │   └── reminders/
│   │       └── route.ts              # CRUD rappels programmés
│   └── layout.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # client Supabase (browser)
│   │   ├── server.ts                 # client Supabase (server)
│   │   └── types.ts                  # types générés de la DB
│   ├── ai/
│   │   ├── claude.ts                 # wrapper appel API Claude
│   │   └── prompts.ts                # prompts système (compagnon, rappels)
│   └── validators/
│       └── schemas.ts                # schémas de validation (zod)
├── components/                       # (géré par le front, à ne pas toucher)
├── middleware.ts                     # protection des routes (auth requise)
├── .env.local                        # variables d'environnement (jamais commit)
└── BACKEND.md                        # ce fichier
```

---

## 3. Modèle de données (Supabase / Postgres)

### `profiles`
Étend `auth.users` de Supabase.
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK, FK → auth.users.id) | |
| username | text | |
| created_at | timestamptz | default now() |

### `communities`
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| name | text | ex: "Développement web", "Guitare", "Anglais" |
| description | text | |
| created_at | timestamptz | |

### `community_members`
Table de jointure — qui a rejoint quelle communauté.
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| community_id | uuid (FK → communities.id) | |
| user_id | uuid (FK → profiles.id) | |
| joined_at | timestamptz | |

### `learning_entries`
Ce que l'utilisateur poste dans sa communauté (son apprentissage du jour).
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| community_id | uuid (FK) | |
| content | text | ce que l'utilisateur a appris/fait |
| created_at | timestamptz | |

### `ai_conversations`
Historique des échanges entre l'utilisateur et l'IA compagnon.
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| community_id | uuid (FK) | |
| role | text | 'user' \| 'assistant' |
| content | text | |
| created_at | timestamptz | |

### `reminders`
Rappels programmés générés/gérés par l'IA.
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| community_id | uuid (FK) | |
| message | text | contenu du rappel |
| scheduled_at | timestamptz | quand l'envoyer |
| sent | boolean | default false |

---

## 4. Endpoints API à développer

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/communities` | Créer une communauté |
| GET | `/api/communities` | Lister les communautés disponibles |
| GET | `/api/communities/[id]` | Détails d'une communauté |
| POST | `/api/communities/[id]/join` | Rejoindre une communauté |
| POST | `/api/entries` | Poster une entrée d'apprentissage |
| GET | `/api/entries?communityId=` | Récupérer les entrées d'une communauté |
| POST | `/api/ai/chat` | Envoyer un message à l'IA compagnon, recevoir une réponse |
| POST | `/api/ai/reminders` | Générer un rappel personnalisé (appelé par un cron) |
| GET | `/api/reminders` | Lister les rappels d'un utilisateur |

---

## 5. Répartition possible entre membres backend

- **Personne A — Auth & Communautés** : `app/api/auth`, `app/api/communities/*`, tables `profiles`, `communities`, `community_members`
- **Personne B — Journal d'apprentissage** : `app/api/entries/*`, table `learning_entries`
- **Personne C — IA Compagnon** : `lib/ai/claude.ts`, `lib/ai/prompts.ts`, `app/api/ai/*`, tables `ai_conversations`, `reminders`

Chacun travaille dans son propre sous-dossier de `app/api/` pour éviter les conflits Git. Le fichier `lib/supabase/types.ts` (types générés) doit être régénéré et partagé après chaque changement de schéma DB.

---

## 6. Variables d'environnement (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

---

## 7. Prompt système de l'IA compagnon (point de départ)

À affiner dans `lib/ai/prompts.ts` :
- Ton : encourageant, jamais culpabilisant, jamais générique
- Rôle : accompagner l'apprentissage posté dans `learning_entries`, poser une question de suivi concrète, proposer un rappel adapté au rythme réel de l'utilisateur (pas un rappel générique quotidien)
- Contexte injecté à chaque appel : les dernières entrées de l'utilisateur dans cette communauté + l'historique récent de conversation

---

## 8. Prochaines étapes

1. Créer le projet Supabase + définir les tables ci-dessus
2. Générer les types TypeScript depuis Supabase
3. Mettre en place le middleware d'auth (protéger `/api/entries`, `/api/ai/*`, `/api/reminders`)
4. Implémenter `lib/ai/claude.ts` (wrapper simple autour de l'API Anthropic)
5. Brancher chaque route API un par un, tester avec un client REST (Postman/Thunder Client) avant intégration front
