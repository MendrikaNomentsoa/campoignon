# Compagnon — Organisation Backend

Application web Next.js : login → choix d'une communauté → suivi d'apprentissage accompagné par une IA (rappels, encouragements, suivi de progression) → **challenges entre membres d'une communauté** (deux personnes ou plus se lancent sur le même objectif, le premier qui finit gagne une récompense).

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
│   │   │   ├── page.tsx                  # liste des 4 communautés fixes
│   │   │   └── [communityId]/
│   │   │       ├── page.tsx              # espace de la communauté
│   │   │       ├── journal/page.tsx      # journal d'apprentissage
│   │   │       └── challenges/
│   │   │           ├── page.tsx          # liste des challenges en cours
│   │   │           └── [challengeId]/page.tsx  # détail + progression
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts
│   │   ├── communities/
│   │   │   ├── route.ts                  # GET (liste fixe des 4 communautés)
│   │   │   └── [communityId]/
│   │   │       ├── join/route.ts         # POST rejoindre
│   │   │       └── route.ts              # GET détails
│   │   ├── entries/
│   │   │   ├── route.ts                  # GET, POST entrées d'apprentissage
│   │   │   └── [entryId]/route.ts        # PATCH, DELETE
│   │   ├── challenges/
│   │   │   ├── route.ts                  # GET (liste), POST (créer un challenge)
│   │   │   └── [challengeId]/
│   │   │       ├── route.ts              # GET détail
│   │   │       ├── join/route.ts         # POST rejoindre un challenge
│   │   │       ├── progress/route.ts     # POST mettre à jour sa progression
│   │   │       └── finish/route.ts       # POST déclarer terminé (déclenche le gagnant)
│   │   ├── rewards/
│   │   │   └── route.ts                  # GET récompenses/badges d'un utilisateur
│   │   ├── ai/
│   │   │   ├── chat/route.ts             # conversation avec l'IA compagnon
│   │   │   └── reminders/route.ts        # génération des rappels
│   │   └── reminders/
│   │       └── route.ts                  # CRUD rappels programmés
│   └── layout.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # client Supabase (browser)
│   │   ├── server.ts                     # client Supabase (server)
│   │   └── types.ts                      # types générés de la DB
│   ├── ai/
│   │   ├── claude.ts                     # wrapper appel API Claude
│   │   └── prompts.ts                    # prompts système (compagnon, rappels)
│   └── validators/
│       └── schemas.ts                    # schémas de validation (zod)
├── components/                           # (géré par le front, à ne pas toucher)
├── middleware.ts                         # protection des routes (auth requise)
├── .env.local                            # variables d'environnement (jamais commit)
└── BACKEND.md                            # ce fichier
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
4 lignes fixes seedées (Développement/Code, Langues, Lecture/Écriture, Design).
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
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
| content | text | |
| created_at | timestamptz | |

### `challenges`
Un défi créé par un membre, sur un objectif précis, dans une communauté.
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| community_id | uuid (FK → communities.id) | |
| creator_id | uuid (FK → profiles.id) | qui a lancé le challenge |
| title | text | ex: "Finir un clone de Trello en React" |
| description | text | l'objectif précis, les règles |
| reward | text | la récompense (badge, titre, texte libre) |
| status | text | 'open' \| 'in_progress' \| 'finished' — default 'open' |
| winner_id | uuid (FK → profiles.id, nullable) | rempli quand quelqu'un termine en premier |
| created_at | timestamptz | |
| finished_at | timestamptz | nullable |

### `challenge_participants`
Qui participe à quel challenge, et où il en est.
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| challenge_id | uuid (FK → challenges.id) | |
| user_id | uuid (FK → profiles.id) | |
| progress | int | pourcentage 0–100, mis à jour par l'utilisateur ou l'IA |
| status | text | 'in_progress' \| 'finished' \| 'abandoned' — default 'in_progress' |
| joined_at | timestamptz | |
| finished_at | timestamptz | nullable — le premier `finished_at` rempli = le gagnant |

### `rewards`
Récompenses/badges obtenus par un utilisateur (historique).
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| challenge_id | uuid (FK → challenges.id) | |
| label | text | ex: "🏆 Premier arrivé — Clone Trello" |
| awarded_at | timestamptz | |

### `ai_conversations`
Historique des échanges entre l'utilisateur et l'IA compagnon.
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| community_id | uuid (FK) | |
| challenge_id | uuid (FK, nullable) | rempli si la conversation concerne un challenge en cours |
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
| challenge_id | uuid (FK, nullable) | rappel lié à un challenge ("ton adversaire est à 80%") |
| message | text | |
| scheduled_at | timestamptz | |
| sent | boolean | default false |

---

## 4. Endpoints API à développer

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/communities` | Lister les 4 communautés |
| GET | `/api/communities/[id]` | Détails d'une communauté |
| POST | `/api/communities/[id]/join` | Rejoindre une communauté |
| POST | `/api/entries` | Poster une entrée d'apprentissage |
| GET | `/api/entries?communityId=` | Récupérer les entrées d'une communauté |
| GET | `/api/challenges?communityId=` | Lister les challenges d'une communauté |
| POST | `/api/challenges` | Créer un challenge (titre, description, récompense) |
| GET | `/api/challenges/[id]` | Détail d'un challenge + participants + progression |
| POST | `/api/challenges/[id]/join` | Rejoindre un challenge existant |
| POST | `/api/challenges/[id]/progress` | Mettre à jour sa progression (%) |
| POST | `/api/challenges/[id]/finish` | Déclarer terminé → si premier, devient `winner_id`, génère une entrée `rewards` |
| GET | `/api/rewards` | Lister les récompenses obtenues par l'utilisateur |
| POST | `/api/ai/chat` | Envoyer un message à l'IA compagnon |
| POST | `/api/ai/reminders` | Générer un rappel personnalisé (appelé par un cron), y compris rappels liés aux challenges |
| GET | `/api/reminders` | Lister les rappels d'un utilisateur |

**Logique clé pour `/api/challenges/[id]/finish` :**
1. Vérifier que le challenge est encore `status = 'open'` ou `in_progress`
2. Marquer `challenge_participants.status = 'finished'` et `finished_at = now()` pour l'utilisateur
3. Si `challenges.winner_id` est encore vide (personne n'a fini avant) → le remplir avec cet utilisateur, passer `challenges.status = 'finished'`, créer une ligne dans `rewards`
4. Si quelqu'un a déjà fini avant → l'utilisateur est simplement marqué "finished" mais n'obtient pas la récompense (à annoncer côté front : "Tu as fini 2e")

---

## 5. Répartition possible entre membres backend

- **Personne A — Auth & Communautés** : `app/api/auth`, `app/api/communities/*`, tables `profiles`, `communities`, `community_members`
- **Personne B — Journal d'apprentissage** : `app/api/entries/*`, table `learning_entries`
- **Personne C — Challenges & Récompenses** : `app/api/challenges/*`, `app/api/rewards`, tables `challenges`, `challenge_participants`, `rewards`
- **Personne D — IA Compagnon** : `lib/ai/claude.ts`, `lib/ai/prompts.ts`, `app/api/ai/*`, tables `ai_conversations`, `reminders`

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
- Rôle : accompagner l'apprentissage posté dans `learning_entries`, poser une question de suivi concrète, proposer un rappel adapté au rythme réel de l'utilisateur
- Si l'utilisateur est dans un challenge actif : injecter la progression des autres participants dans le contexte pour que l'IA puisse encourager de façon compétitive ("ton adversaire vient d'avancer, tu veux continuer ?") sans être culpabilisant
- Contexte injecté à chaque appel : dernières entrées de l'utilisateur + historique récent de conversation + progression du challenge en cours (si applicable)

---

## 8. Workflow Git

Convention de nommage des branches : `backend/nom-de-la-feature`

```bash
git checkout main
git pull origin main
git checkout -b backend/challenges
git push -u origin backend/challenges
```

Chaque personne pousse sur sa branche, ouvre une Pull Request vers `main` (ou `dev`) une fois sa fonctionnalité prête, pour relecture avant merge.

---

## 9. Prochaines étapes

1. Créer les tables Supabase (voir section 3), y compris `challenges`, `challenge_participants`, `rewards`
2. Générer les types TypeScript depuis Supabase
3. Mettre en place le middleware d'auth (protéger `/api/entries`, `/api/challenges/*`, `/api/ai/*`, `/api/reminders`)
4. Implémenter `lib/ai/claude.ts` (wrapper simple autour de l'API Anthropic)
5. Implémenter en priorité `/api/challenges` (POST) et `/api/challenges/[id]/finish` — c'est le cœur de la mécanique de compétition
6. Brancher chaque route API un par un, tester avec un client REST (Postman/Thunder Client) avant intégration front