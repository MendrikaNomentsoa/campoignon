// ============================================================
// Types (strictement basés sur schema.sql)
// ============================================================

export type ChallengeStatus = "open" | "in_progress" | "finished"
export type ParticipantStatus = "in_progress" | "finished" | "abandoned"
export type TaskStatus = "pending" | "done"
export type SignalType = "ask_help" | "release_task"
export type SignalStatus = "open" | "resolved"
export type AiRole = "user" | "assistant"

export interface Profile {
  id: string
  username: string
  created_at: string
}

export interface Community {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface CommunityMember {
  id: string
  community_id: string
  user_id: string
  joined_at: string
}

export interface Challenge {
  id: string
  community_id: string
  creator_id: string
  title: string
  description: string | null
  reward: string | null
  status: ChallengeStatus
  winner_id: string | null
  created_at: string
  finished_at: string | null
}

export interface ChallengeParticipant {
  id: string
  challenge_id: string
  user_id: string
  progress: number
  status: ParticipantStatus
  joined_at: string
  finished_at: string | null
  total_points: number
}

export interface ChallengeTask {
  id: string
  challenge_id: string
  assigned_to: string
  created_by: string
  title: string
  description: string | null
  points: number
  deadline: string | null
  status: TaskStatus
  completed_at: string | null
  created_at: string
}

export interface Reward {
  id: string
  user_id: string
  challenge_id: string
  label: string
  awarded_at: string
}

export interface LearningEntry {
  id: string
  user_id: string
  community_id: string
  content: string
  created_at: string
}

export interface CommunitySignal {
  id: string
  user_id: string
  community_id: string
  challenge_id: string
  task_id: string
  type: SignalType
  message: string | null
  status: SignalStatus
  created_at: string
}

export interface AiConversation {
  id: string
  user_id: string
  community_id: string
  challenge_id: string
  role: AiRole
  content: string
  created_at: string
}

export interface Reminder {
  id: string
  user_id: string
  community_id: string
  challenge_id: string
  message: string
  scheduled_at: string
  sent: boolean
  created_at: string
}

// ============================================================
// IDs stables (réutilisés entre toutes les tables)
// ============================================================

const IDS = {
  // Profiles
  p1: "a1b2c3d4-1111-4aaa-b111-000000000001",
  p2: "a1b2c3d4-2222-4aaa-b222-000000000002",
  p3: "a1b2c3d4-3333-4aaa-b333-000000000003",
  p4: "a1b2c3d4-4444-4aaa-b444-000000000004",
  p5: "a1b2c3d4-5555-4aaa-b555-000000000005",
  p6: "a1b2c3d4-6666-4aaa-b666-000000000006",

  // Communities
  c1: "b1c2d3e4-1111-4bbb-c111-000000000001",
  c2: "b1c2d3e4-2222-4bbb-c222-000000000002",
  c3: "b1c2d3e4-3333-4bbb-c333-000000000003",

  // Challenges
  ch1: "c1d2e3f4-1111-4ccc-d111-000000000001",
  ch2: "c1d2e3f4-2222-4ccc-d222-000000000002",
  ch3: "c1d2e3f4-3333-4ccc-d333-000000000003",
  ch4: "c1d2e3f4-4444-4ccc-d444-000000000004",

  // Tasks
  t1: "d1e2f3a4-1111-4ddd-e111-000000000001",
  t2: "d1e2f3a4-2222-4ddd-e222-000000000002",
  t3: "d1e2f3a4-3333-4ddd-e333-000000000003",
  t4: "d1e2f3a4-4444-4ddd-e444-000000000004",
  t5: "d1e2f3a4-5555-4ddd-e555-000000000005",
  t6: "d1e2f3a4-6666-4ddd-e666-000000000006",

  // Participant IDs
  cp1: "e1f2a3b4-1111-4eee-f111-000000000001",
  cp2: "e1f2a3b4-2222-4eee-f222-000000000002",
  cp3: "e1f2a3b4-3333-4eee-f333-000000000003",
  cp4: "e1f2a3b4-4444-4eee-f444-000000000004",
  cp5: "e1f2a3b4-5555-4eee-f555-000000000005",
  cp6: "e1f2a3b4-6666-4eee-f666-000000000006",
  cp7: "e1f2a3b4-7777-4eee-f777-000000000007",

  // Community member IDs
  cm1: "f1a2b3c4-1111-4fff-a111-000000000001",
  cm2: "f1a2b3c4-2222-4fff-a222-000000000002",
  cm3: "f1a2b3c4-3333-4fff-a333-000000000003",
  cm4: "f1a2b3c4-4444-4fff-a444-000000000004",
  cm5: "f1a2b3c4-5555-4fff-a555-000000000005",
  cm6: "f1a2b3c4-6666-4fff-a666-000000000006",
  cm7: "f1a2b3c4-7777-4fff-a777-000000000007",
  cm8: "f1a2b3c4-8888-4fff-a888-000000000008",
  cm9: "f1a2b3c4-9999-4fff-a999-000000000009",

  // Reward IDs
  rw1: "aa11bb22-1111-4aaa-b111-000000000001",
  rw2: "aa11bb22-2222-4aaa-b222-000000000002",

  // Signal IDs
  sg1: "bb11cc22-1111-4bbb-c111-000000000001",
  sg2: "bb11cc22-2222-4bbb-c222-000000000002",
  sg3: "bb11cc22-3333-4bbb-c333-000000000003",

  // AI conversation IDs
  ai1: "cc11dd22-1111-4ccc-d111-000000000001",
  ai2: "cc11dd22-2222-4ccc-d222-000000000002",
  ai3: "cc11dd22-3333-4ccc-d333-000000000003",
  ai4: "cc11dd22-4444-4ccc-d444-000000000004",

  // Reminder IDs
  rm1: "dd11ee22-1111-4ddd-e111-000000000001",
  rm2: "dd11ee22-2222-4ddd-e222-000000000002",
  rm3: "dd11ee22-3333-4ddd-e333-000000000003",
} as const

// ============================================================
// Mock Data
// ============================================================

export const mockProfiles: Profile[] = [
  {
    id: IDS.p1,
    username: "alice_react",
    created_at: "2025-09-01T10:00:00Z",
  },
  {
    id: IDS.p2,
    username: "bob_backend",
    created_at: "2025-09-15T14:30:00Z",
  },
  {
    id: IDS.p3,
    username: "charlie_fullstack",
    created_at: "2025-10-02T08:15:00Z",
  },
  {
    id: IDS.p4,
    username: "diana_rust",
    created_at: "2025-10-10T17:00:00Z",
  },
  {
    id: IDS.p5,
    username: "emma_python",
    created_at: "2025-11-01T09:45:00Z",
  },
  {
    id: IDS.p6,
    username: "felix_devops",
    created_at: "2025-11-20T11:00:00Z",
  },
]

export const mockCommunities: Community[] = [
  {
    id: IDS.c1,
    name: "React Warriors",
    description:
      "On n'abandonne jamais un composant. Entraide autour de React, Next.js et tout l'écosystème frontend.",
    created_at: "2025-08-20T12:00:00Z",
  },
  {
    id: IDS.c2,
    name: "Backend Builders",
    description:
      "API, bases de données, architecture serveur. On construit ensemble, on lâche rien.",
    created_at: "2025-08-25T15:00:00Z",
  },
  {
    id: IDS.c3,
    name: "Mémoire & Compagnie",
    description:
      "Pour ceux qui veulent apprendre Rust, C++ ou tout ce qui touche à la gestion mémoire. Pas de honte, on apprend tous.",
    created_at: "2025-09-05T09:00:00Z",
  },
]

export const mockCommunityMembers: CommunityMember[] = [
  // Alice → React Warriors, Mémoire & Compagnie
  { id: IDS.cm1, community_id: IDS.c1, user_id: IDS.p1, joined_at: "2025-09-05T10:00:00Z" },
  { id: IDS.cm2, community_id: IDS.c3, user_id: IDS.p1, joined_at: "2025-10-15T14:00:00Z" },
  // Bob → Backend Builders
  { id: IDS.cm3, community_id: IDS.c2, user_id: IDS.p2, joined_at: "2025-09-20T11:00:00Z" },
  // Charlie → React Warriors, Backend Builders
  { id: IDS.cm4, community_id: IDS.c1, user_id: IDS.p3, joined_at: "2025-10-05T09:00:00Z" },
  { id: IDS.cm5, community_id: IDS.c2, user_id: IDS.p3, joined_at: "2025-10-08T16:00:00Z" },
  // Diana → Mémoire & Compagnie
  { id: IDS.cm6, community_id: IDS.c3, user_id: IDS.p4, joined_at: "2025-10-12T10:00:00Z" },
  // Emma → Backend Builders, Mémoire & Compagnie
  { id: IDS.cm7, community_id: IDS.c2, user_id: IDS.p5, joined_at: "2025-11-05T08:00:00Z" },
  { id: IDS.cm8, community_id: IDS.c3, user_id: IDS.p5, joined_at: "2025-11-08T12:00:00Z" },
  // Felix → React Warriors
  { id: IDS.cm9, community_id: IDS.c1, user_id: IDS.p6, joined_at: "2025-11-25T14:00:00Z" },
]

export const mockChallenges: Challenge[] = [
  // open — pas encore commencé
  {
    id: IDS.ch1,
    community_id: IDS.c1,
    creator_id: IDS.p1,
    title: "Créer un composant Dashboard réutilisable",
    description:
      "Concevoir et implémenter un composant Dashboard entièrement réutilisable avec React et Tailwind. Le dashboard doit s'adapter à différentes tailles d'écran.",
    reward: "Badge Dashboard Master + 200 points",
    status: "open",
    winner_id: null,
    created_at: "2026-07-01T10:00:00Z",
    finished_at: null,
  },
  // in_progress — en cours
  {
    id: IDS.ch2,
    community_id: IDS.c2,
    creator_id: IDS.p2,
    title: "Construire une API REST complète en 2 semaines",
    description:
      "Développer une API REST avec authentification JWT, CRUD complet et tests unitaires. Objectif : ne pas abandonner en cours de route !",
    reward: "Badge API Warrior + 300 points",
    status: "in_progress",
    winner_id: null,
    created_at: "2026-06-15T09:00:00Z",
    finished_at: null,
  },
  // finished — terminé avec gagnant
  {
    id: IDS.ch3,
    community_id: IDS.c3,
    creator_id: IDS.p4,
    title: "Apprendre les Pointeurs en Rust en 30 jours",
    description:
      "Un défi collectif pour comprendre les references, les borrows et les lifetimes en Rust. Chaque jour, une petite tâche progressive.",
    reward: "Badge Rustacean + 500 points",
    status: "finished",
    winner_id: IDS.p4,
    created_at: "2026-05-01T08:00:00Z",
    finished_at: "2026-06-01T18:00:00Z",
  },
  // open — nouveau, pas de participants encore
  {
    id: IDS.ch4,
    community_id: IDS.c1,
    creator_id: IDS.p3,
    title: "Migrer un projet class vers App Router Next.js",
    description:
      "On passe tous nos projets legacy Next.js en App Router. Entraide, pair programming, et surtout : on finit ce qu'on commence.",
    reward: "Badge Migration Pro + 250 points",
    status: "open",
    winner_id: null,
    created_at: "2026-07-20T14:00:00Z",
    finished_at: null,
  },
]

export const mockChallengeParticipants: ChallengeParticipant[] = [
  // Challenge 2 (API REST) — Alice avancée, Charlie en retard
  {
    id: IDS.cp1,
    challenge_id: IDS.ch2,
    user_id: IDS.p1,
    progress: 75,
    status: "in_progress",
    joined_at: "2026-06-16T10:00:00Z",
    finished_at: null,
    total_points: 225,
  },
  {
    id: IDS.cp2,
    challenge_id: IDS.ch2,
    user_id: IDS.p3,
    progress: 30,
    status: "in_progress",
    joined_at: "2026-06-18T14:00:00Z",
    finished_at: null,
    total_points: 90,
  },
  // Challenge 3 (Rust) — terminé, Diana gagnante, Bob abandonné
  {
    id: IDS.cp3,
    challenge_id: IDS.ch3,
    user_id: IDS.p4,
    progress: 100,
    status: "finished",
    joined_at: "2026-05-02T09:00:00Z",
    finished_at: "2026-05-28T16:00:00Z",
    total_points: 500,
  },
  {
    id: IDS.cp4,
    challenge_id: IDS.ch3,
    user_id: IDS.p2,
    progress: 40,
    status: "abandoned",
    joined_at: "2026-05-05T11:00:00Z",
    finished_at: null,
    total_points: 100,
  },
  {
    id: IDS.cp5,
    challenge_id: IDS.ch3,
    user_id: IDS.p5,
    progress: 85,
    status: "finished",
    joined_at: "2026-05-03T08:00:00Z",
    finished_at: "2026-05-30T12:00:00Z",
    total_points: 425,
  },
  // Challenge 1 (Dashboard) — un seul inscrit, tout début
  {
    id: IDS.cp6,
    challenge_id: IDS.ch1,
    user_id: IDS.p6,
    progress: 0,
    status: "in_progress",
    joined_at: "2026-07-05T10:00:00Z",
    finished_at: null,
    total_points: 0,
  },
]

export const mockChallengeTasks: ChallengeTask[] = [
  // --- Challenge 2 (API REST) ---
  {
    id: IDS.t1,
    challenge_id: IDS.ch2,
    assigned_to: IDS.p1,
    created_by: IDS.p2,
    title: "Configurer le projet avec Express et TypeScript",
    description: "Initialiser le projet, configurer TypeScript et linting.",
    points: 30,
    deadline: "2026-06-20T23:59:00Z",
    status: "done",
    completed_at: "2026-06-19T15:30:00Z",
    created_at: "2026-06-15T09:30:00Z",
  },
  {
    id: IDS.t2,
    challenge_id: IDS.ch2,
    assigned_to: IDS.p1,
    created_by: IDS.p2,
    title: "Implémenter l'authentification JWT",
    description: "Register, login, refresh token, middleware d'auth.",
    points: 50,
    deadline: "2026-07-01T23:59:00Z",
    status: "done",
    completed_at: "2026-06-29T20:00:00Z",
    created_at: "2026-06-20T10:00:00Z",
  },
  {
    id: IDS.t3,
    challenge_id: IDS.ch2,
    assigned_to: IDS.p1,
    created_by: IDS.p2,
    title: "CRUD complet pour les utilisateurs",
    description: "Endpoints GET, POST, PUT, DELETE avec validation.",
    points: 40,
    deadline: "2026-07-15T23:59:00Z",
    status: "pending",
    completed_at: null,
    created_at: "2026-07-01T09:00:00Z",
  },
  {
    id: IDS.t4,
    challenge_id: IDS.ch2,
    assigned_to: IDS.p3,
    created_by: IDS.p2,
    title: "Écrire les tests unitaires",
    description: "Couverture minimale de 80% avec Jest.",
    points: 35,
    deadline: "2026-06-25T23:59:00Z",
    status: "pending",
    completed_at: null,
    created_at: "2026-06-18T14:00:00Z",
  },
  // --- Challenge 3 (Rust) ---
  {
    id: IDS.t5,
    challenge_id: IDS.ch3,
    assigned_to: IDS.p4,
    created_by: IDS.p4,
    title: "Jour 1-5 : Les bases de la ownership",
    description: "Lire le chapitre 4 du Rust Book et faire les exercices.",
    points: 50,
    deadline: "2026-05-07T23:59:00Z",
    status: "done",
    completed_at: "2026-05-06T18:00:00Z",
    created_at: "2026-05-01T08:30:00Z",
  },
  {
    id: IDS.t6,
    challenge_id: IDS.ch3,
    assigned_to: IDS.p4,
    created_by: IDS.p4,
    title: "Jour 15-20 : Lifetimes avancés",
    description: "Comprendre les lifetime annotations et les contraintes de durée de vie.",
    points: 80,
    deadline: "2026-05-22T23:59:00Z",
    status: "done",
    completed_at: "2026-05-21T22:00:00Z",
    created_at: "2026-05-15T08:00:00Z",
  },
]

export const mockRewards: Reward[] = [
  {
    id: IDS.rw1,
    user_id: IDS.p4,
    challenge_id: IDS.ch3,
    label: "Badge Rustacean",
    awarded_at: "2026-06-01T18:00:00Z",
  },
  {
    id: IDS.rw2,
    user_id: IDS.p5,
    challenge_id: IDS.ch3,
    label: "Badge Rustacean (Second degrée)",
    awarded_at: "2026-06-01T18:00:00Z",
  },
]

export const mockLearningEntries: LearningEntry[] = [
  {
    id: "le000001-0000-4000-a000-000000000001",
    user_id: IDS.p1,
    community_id: IDS.c1,
    content:
      "Aujourd'hui j'ai enfin compris pourquoi useCallback est parfois inutile. Si le composant enfant n'est pas memoized, la callback est recréée quand même. Leçon : optimiser en amont d'abord.",
    created_at: "2026-07-10T19:00:00Z",
  },
  {
    id: "le000001-0000-4000-a000-000000000002",
    user_id: IDS.p4,
    community_id: IDS.c3,
    content:
      "Jour 22 du défi Rust. Les lifetime annotations me posent encore problème mais je commence à voir le schéma. Ne pas abandonner, c'est le plus dur et le plus important.",
    created_at: "2026-05-23T21:30:00Z",
  },
  {
    id: "le000001-0000-4000-a000-000000000003",
    user_id: IDS.p2,
    community_id: IDS.c2,
    content:
      "Le JWT c'est plus simple qu'il n'y paraît. Le secret, la signature, le payload. Ce qui est dur c'est de ne pas stocker de données sensibles dedans.",
    created_at: "2026-06-22T14:00:00Z",
  },
  {
    id: "le000001-0000-4000-a000-000000000004",
    user_id: IDS.p5,
    community_id: IDS.c2,
    content:
      "Premier jour sans abandonner mon projet depuis 3 semaines. La communauté m'a remis au boulot. Merci à tous.",
    created_at: "2026-07-18T10:00:00Z",
  },
]

export const mockCommunitySignals: CommunitySignal[] = [
  {
    id: IDS.sg1,
    user_id: IDS.p3,
    community_id: IDS.c2,
    challenge_id: IDS.ch2,
    task_id: IDS.t4,
    type: "ask_help",
    message:
      "J'arrive pas à configurer Jest avec TypeScript et les imports path aliases. Quelqu'un a déjà eu ce problème ?",
    status: "open",
    created_at: "2026-07-08T16:00:00Z",
  },
  {
    id: IDS.sg2,
    user_id: IDS.p6,
    community_id: IDS.c1,
    challenge_id: IDS.ch1,
    task_id: IDS.t1,
    type: "ask_help",
    message:
      "Je débute avec Tailwind, je comprends pas comment faire un layout responsive sans écrire 50 classes. Des conseils ?",
    status: "open",
    created_at: "2026-07-12T11:00:00Z",
  },
  {
    id: IDS.sg3,
    user_id: IDS.p1,
    community_id: IDS.c1,
    challenge_id: IDS.ch2,
    task_id: IDS.t2,
    type: "release_task",
    message:
      "J'ai terminé l'implémentation JWT. Si quelqu'un veut reprendre la suite du CRUD, c'est ouvert.",
    status: "resolved",
    created_at: "2026-07-02T20:30:00Z",
  },
]

export const mockAiConversations: AiConversation[] = [
  {
    id: IDS.ai1,
    user_id: IDS.p3,
    community_id: IDS.c2,
    challenge_id: IDS.ch2,
    role: "user",
    content: "Je galère avec les tests Jest. Mon import path ne fonctionne pas en environnement de test.",
    created_at: "2026-07-08T16:10:00Z",
  },
  {
    id: IDS.ai2,
    user_id: IDS.p3,
    community_id: IDS.c2,
    challenge_id: IDS.ch2,
    role: "assistant",
    content:
      "C'est un problème classique avec les path aliases. Tu dois configurer `moduleNameMapper` dans ton `jest.config`. Veille aussi que ton `tsconfig` et ton `jest.config` soient synchronisés. Tu veux que je t'aide pas à pas ?",
    created_at: "2026-07-08T16:10:30Z",
  },
  {
    id: IDS.ai3,
    user_id: IDS.p6,
    community_id: IDS.c1,
    challenge_id: IDS.ch1,
    role: "user",
    content: "Je sens que je vais abandonner encore une fois. C'est trop compliqué ce projet.",
    created_at: "2026-07-12T11:05:00Z",
  },
  {
    id: IDS.ai4,
    user_id: IDS.p6,
    community_id: IDS.c1,
    challenge_id: IDS.ch1,
    role: "assistant",
    content:
      "Hey, le fait que tu sois là c'est déjà une victoire. On ne cherche pas la perfection, on cherche à avancer. Découpe le problème en 3 petits morceaux et commence par le plus simple. Tu es capable de le faire, un pas à la fois.",
    created_at: "2026-07-12T11:05:45Z",
  },
]

export const mockReminders: Reminder[] = [
  {
    id: IDS.rm1,
    user_id: IDS.p1,
    community_id: IDS.c2,
    challenge_id: IDS.ch2,
    message: "N'oublie pas la tâche CRUD — il te reste 5 jours avant la deadline !",
    scheduled_at: "2026-07-10T09:00:00Z",
    sent: true,
    created_at: "2026-07-09T20:00:00Z",
  },
  {
    id: IDS.rm2,
    user_id: IDS.p3,
    community_id: IDS.c2,
    challenge_id: IDS.ch2,
    message: "Salut Charlie, tu es en retard sur les tests. Tu veux qu'on t'aide ? Un signal d'entraide est toujours possible.",
    scheduled_at: "2026-07-10T09:00:00Z",
    sent: true,
    created_at: "2026-07-09T20:00:00Z",
  },
  {
    id: IDS.rm3,
    user_id: IDS.p6,
    community_id: IDS.c1,
    challenge_id: IDS.ch1,
    message: "Hey Félix, bienvenue dans le défi Dashboard ! Premier conseil : commence par un wireframe avant de coder.",
    scheduled_at: "2026-07-06T10:00:00Z",
    sent: true,
    created_at: "2026-07-05T18:00:00Z",
  },
]

// ============================================================
// Utilitaire : données mock pour un utilisateur donné
// ============================================================

export function getMockDataForUser(userId: string) {
  const profile = mockProfiles.find((p) => p.id === userId)
  if (!profile) return null

  const memberships = mockCommunityMembers.filter((m) => m.user_id === userId)
  const communities = memberships.map((m) =>
    mockCommunities.find((c) => c.id === m.community_id)!
  )

  const participations = mockChallengeParticipants.filter(
    (cp) => cp.user_id === userId
  )
  const challenges = participations
    .map((cp) => mockChallenges.find((ch) => ch.id === cp.challenge_id)!)
    .filter(Boolean)

  const tasks = mockChallengeTasks.filter(
    (t) => t.assigned_to === userId || t.created_by === userId
  )

  const rewards = mockRewards.filter((r) => r.user_id === userId)

  const learningEntries = mockLearningEntries.filter(
    (le) => le.user_id === userId
  )

  const signals = mockCommunitySignals.filter((s) => s.user_id === userId)

  const conversations = mockAiConversations.filter(
    (ac) => ac.user_id === userId
  )

  const reminders = mockReminders.filter((r) => r.user_id === userId)

  return {
    profile,
    memberships,
    communities,
    participations,
    challenges,
    tasks,
    rewards,
    learningEntries,
    signals,
    conversations,
    reminders,
  }
}
