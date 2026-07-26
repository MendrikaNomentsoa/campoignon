# Compagnon — Organisation Backend

Application web Next.js : login → choix d'une communauté (4 communautés fixes) → journal d'apprentissage → **challenges collaboratifs** (un projet partagé, découpé en tâches assignées, avec points et pénalité de retard) → détection des membres inactifs et entraide → IA compagnon (rappels, répartition des tâches, chat).

Ce document sert de référence commune pour toute l'équipe backend. Toute personne qui commence une tâche doit s'y référer avant de coder, pour éviter les conflits de structure.

---

## 1. Stack technique

| Élément | Choix |
|---|---|
| Framework | Next.js (App Router) |
| Backend | Route Handlers (`app/api/.../route.ts`) |
| Base de données | Supabase (Postgres) |
| Auth | Supabase Auth |
| IA | API Claude (Anthropic) |
| Validation | Zod (`lib/validators/schemas.ts`) |
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
│   │   │   ├── page.tsx                       # liste des 4 communautés
│   │   │   └── [communityId]/
│   │   │       ├── page.tsx                   # espace de la communauté
│   │   │       ├── journal/page.tsx            # journal d'apprentissage
│   │   │       ├── stalled/page.tsx            # membres inactifs / entraide
│   │   │       └── challenges/
│   │   │           ├── page.tsx                # liste des challenges
│   │   │           └── [challengeId]/page.tsx  # détail + tâches + classement
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── login/route.ts
│   │   ├── communities/
│   │   │   ├── route.ts                        # GET liste des 4 communautés
│   │   │   └── [communityId]/
│   │   │       ├── route.ts                    # GET détails
│   │   │       ├── join/route.ts               # POST rejoindre
│   │   │       └── stalled/route.ts            # GET membres inactifs
│   │   ├── entries/
│   │   │   └── route.ts                        # GET, POST journal d'apprentissage
│   │   ├── challenges/
│   │   │   ├── route.ts                        # GET (liste), POST (créer)
│   │   │   └── [challengeId]/
│   │   │       ├── join/route.ts               # POST rejoindre
│   │   │       ├── finish/route.ts             # POST clôturer (créateur only, gagnant = + de points)
│   │   │       ├── leaderboard/route.ts        # GET classement
│   │   │       └── tasks/
│   │   │           ├── route.ts                # GET (liste), POST (créer/assigner, humain ou IA)
│   │   │           └── [taskId]/
│   │   │               ├── complete/route.ts   # POST terminer (calcul points + pénalité retard)
│   │   │               └── claim/route.ts      # POST reprendre une tâche libérée
│   │   ├── signals/
│   │   │   └── route.ts                        # GET (liste), POST (demander aide / libérer tâche)
│   │   ├── rewards/
│   │   │   └── route.ts                        # GET récompenses d'un utilisateur
│   │   └── ai/
│   │       ├── chat/route.ts                   # conversation avec l'IA compagnon
│   │       ├── reminders/route.ts              # génération des rappels
│   │       └── split-tasks/route.ts            # IA découpe un challenge en tâches
│   └── layout.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── ai/
│   │   ├── claude.ts                           # wrapper appel API Claude
│   │   └── prompts.ts                          # prompts système
│   └── validators/
│       └── schemas.ts                          # schémas Zod
├── components/
├── middleware.ts
├── .env.local
└── BACKEND.md
```

---

## 3. Modèle de données (Supabase / Postgres)

### `profiles`
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK, FK → auth.users.id) | |
| username | text | |
| created_at | timestamptz | |

### `communities`
4 lignes fixes seedées (Développement/Code, Langues, Lecture/Écriture, Design).
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| description | text | |
| created_at | timestamptz | |

### `community_members`
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| community_id | uuid (FK) | |
| user_id | uuid (FK) | |
| joined_at | timestamptz | |

### `learning_entries`
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| community_id | uuid (FK) | |
| content | text | |
| created_at | timestamptz | |

### `challenges`
Un projet partagé lancé dans une communauté.
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| community_id | uuid (FK) | |
| creator_id | uuid (FK) | seul lui peut clôturer le challenge |
| title | text | |
| description | text | |
| reward | text | |
| status | text | 'open' \| 'in_progress' \| 'finished' |
| winner_id | uuid (FK, nullable) | rempli à la clôture, = celui qui a le plus de points |
| created_at | timestamptz | |
| finished_at | timestamptz | nullable |

### `challenge_participants`
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| challenge_id | uuid (FK) | |
| user_id | uuid (FK) | |
| total_points | int | cumul des points gagnés sur les tâches, default 0 |
| progress | int | 0–100, optionnel/global |
| status | text | 'in_progress' \| 'finished' \| 'abandoned' |
| joined_at | timestamptz | |
| finished_at | timestamptz | nullable |

### `challenge_tasks`
Une tâche du projet, assignée à un participant (par un humain ou par l'IA).
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| challenge_id | uuid (FK) | |
| assigned_to | uuid (FK, **nullable**) | vide = tâche libre, disponible pour être reprise |
| created_by | uuid (FK) | qui a créé la tâche (humain ou compte système IA) |
| title | text | |
| description | text | |
| points | int | points de base à gagner, default 10 |
| deadline | timestamptz | nullable |
| status | text | 'pending' \| 'done' |
| completed_at | timestamptz | nullable |
| created_at | timestamptz | |

**Logique des points (route `complete`)** : si terminée avant la deadline → points complets ; si en retard → `points - (jours_de_retard × 2)`, minimum 0. Le total s'accumule dans `challenge_participants.total_points`.

### `community_signals`
Le choix fait par une personne repérée comme inactive.
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| community_id | uuid (FK) | |
| challenge_id | uuid (FK, nullable) | |
| task_id | uuid (FK, nullable) | |
| type | text | 'ask_help' \| 'release_task' |
| message | text | nullable |
| status | text | 'open' \| 'resolved' |
| created_at | timestamptz | |

### `rewards`
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| challenge_id | uuid (FK) | |
| label | text | |
| awarded_at | timestamptz | |

### `ai_conversations`
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| community_id | uuid (FK) | |
| challenge_id | uuid (FK, nullable) | |
| role | text | 'user' \| 'assistant' |
| content | text | |
| created_at | timestamptz | |

### `reminders`
| Colonne | Type | Note |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| community_id | uuid (FK) | |
| challenge_id | uuid (FK, nullable) | |
| message | text | |
| scheduled_at | timestamptz | |
| sent | boolean | default false |

---

## 4. Endpoints API

### Communautés
| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/communities` | Lister les 4 communautés fixes |
| GET | `/api/communities/[id]` | Détails d'une communauté |
| POST | `/api/communities/[id]/join` | Rejoindre |
| GET | `/api/communities/[id]/stalled` | Membres inactifs depuis 3+ jours (journal ET tâches) |

### Journal d'apprentissage
| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/entries?communityId=` | Lister les entrées |
| POST | `/api/entries` | Poster une entrée |

### Challenges (projets partagés)
| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/challenges?communityId=` | Lister les challenges |
| POST | `/api/challenges` | Créer un challenge |
| POST | `/api/challenges/[id]/join` | Rejoindre |
| GET | `/api/challenges/[id]/leaderboard` | Classement par points |
| POST | `/api/challenges/[id]/finish` | Clôturer (créateur seulement) → gagnant = plus de points, récompense créée |

### Tâches
| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/challenges/[id]/tasks` | Lister les tâches |
| POST | `/api/challenges/[id]/tasks` | Créer/assigner une tâche (humain ou IA) |
| POST | `/api/challenges/[id]/tasks/[taskId]/complete` | Terminer (points + pénalité retard) |
| POST | `/api/challenges/[id]/tasks/[taskId]/claim` | Reprendre une tâche libérée |

### Entraide / signaux d'inactivité
| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/signals?communityId=` | Lister les signaux ouverts (demandes d'aide, tâches libérées) |
| POST | `/api/signals` | La personne inactive choisit : `ask_help` ou `release_task` |

### Récompenses
| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/rewards` | Récompenses de l'utilisateur connecté |

### IA (à développer par la personne dédiée)
| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/ai/chat` | Conversation avec le compagnon |
| POST | `/api/ai/reminders` | Génération de rappels personnalisés |
| POST | `/api/ai/split-tasks` | Découpe un challenge en tâches, appelle `POST /api/challenges/[id]/tasks` pour chacune |

---

## 5. Le rôle de l'IA — vue d'ensemble

1. **Répartition des tâches** : à la création d'un challenge, l'IA analyse le titre/description et les participants, découpe le projet en tâches équilibrées, et les insère via `POST /api/challenges/[id]/tasks`.
2. **Rappels personnalisés** : en croisant `challenge_tasks` (deadlines proches) et `learning_entries` (dernière activité), génère un rappel adapté au rythme réel de la personne — pas un message générique.
3. **Compagnon conversationnel** : chat avec contexte injecté (entrées récentes + progression du challenge en cours).
4. **Détection précoce de décrochage** : repère qu'un participant ralentit avant même que `stalled` ne le signale officiellement, pour proposer de l'aide en amont.
5. *(Bonus, non prioritaire)* Suggestion de réassignation dynamique des tâches si quelqu'un est clairement débordé.

---

## 6. Répartition entre membres backend

- **Personne A — Auth & Communautés** : `app/api/auth`, `app/api/communities/*`
- **Personne B — Journal & Entraide** : `app/api/entries/*`, `app/api/signals/*`
- **Personne C — Challenges & Tâches & Récompenses** : `app/api/challenges/*`, `app/api/rewards`
- **Personne D — IA** : `lib/ai/*`, `app/api/ai/*`

Chacun travaille dans son propre sous-dossier de `app/api/` pour éviter les conflits Git.

---

## 7. Workflow Git

Convention : `backend/nom-de-la-feature`

```bash
git checkout main
git pull origin main
git checkout -b backend/nom-de-la-feature
git push -u origin backend/nom-de-la-feature
```

Chacun ouvre une Pull Request vers `main` une fois sa fonctionnalité prête.

---

## 8. Variables d'environnement (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

---

## 9. Cycle complet du système (pour comprendre l'ensemble)

1. Un membre crée un **challenge** (projet partagé) dans une communauté et le rejoint automatiquement
2. D'autres membres **rejoignent** le challenge
3. L'IA (ou un humain) **découpe le projet en tâches** et les assigne
4. Chacun **termine ses tâches** → gagne des points (réduits si en retard)
5. Si quelqu'un est **inactif 3+ jours** (pas d'entrée journal + tâches en souffrance), il apparaît dans `stalled`
6. Cette personne choisit : **demander de l'aide** (visible par la communauté) ou **libérer sa tâche**
7. Si libérée, quelqu'un d'autre peut la **reprendre** (`claim`)
8. Le classement (`leaderboard`) est visible en continu
9. Le créateur **clôture** le challenge → celui qui a le plus de points gagne la récompense

Rien ne disparaît dans le silence : tout blocage devient visible et récupérable, par la communauté ou par l'IA.

---

## 10. Prochaines étapes

1. Terminer le login (en cours)
2. Tester le cycle complet avec au moins 2 comptes (créer, rejoindre, assigner tâches, compléter, libérer, reprendre, clôturer)
3. Développer la partie IA (`split-tasks`, `reminders`, `chat`)
4. Construire le frontend (pas encore commencé)
5. Déployer sur Vercel avant la fin du hackathon