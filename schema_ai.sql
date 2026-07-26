-- Tables pour les 4 features IA
-- À exécuter dans Supabase SQL Editor

-- 1. Profiler d'Élan : sessions d'activité utilisateur
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  community_id uuid NOT NULL,
  session_start timestamp with time zone DEFAULT now(),
  session_end timestamp with time zone,
  entries_created integer DEFAULT 0,
  tasks_completed integer DEFAULT 0,
  messages_sent integer DEFAULT 0,
  duration_minutes integer GENERATED ALWAYS AS (
    CASE WHEN session_end IS NOT NULL
    THEN EXTRACT(EPOCH FROM (session_end - session_start)) / 60
    ELSE NULL END
  ) STORED,
  CONSTRAINT user_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_sessions_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id)
);

-- 2. Profiler : analyses comportementales stockées
CREATE TABLE IF NOT EXISTS public.behavior_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  community_id uuid NOT NULL,
  risk_level text NOT NULL DEFAULT 'low' CHECK (risk_level = ANY ('low','medium','high','critical')),
  trend text NOT NULL DEFAULT 'stable' CHECK (trend = ANY ('improving','stable','declining','spiking')),
  avg_session_duration real DEFAULT 0,
  avg_entries_per_week real DEFAULT 0,
  days_since_last_entry integer DEFAULT 0,
  analysis jsonb DEFAULT '{}',
  recommendation text,
  analyzed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT behavior_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT behavior_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT behavior_profiles_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id)
);

-- 3. Générateur de Cartes d'Héritage
CREATE TABLE IF NOT EXISTS public.project_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL,
  community_id uuid NOT NULL,
  card_type text NOT NULL DEFAULT 'quest' CHECK (card_type = ANY ('quest','relic','friche','boss')),
  title text NOT NULL,
  description text NOT NULL,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  boss_challenge text,
  quest_objectives jsonb DEFAULT '[]',
  lore text,
  reward_preview text,
  generated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT project_cards_pkey PRIMARY KEY (id),
  CONSTRAINT project_cards_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id),
  CONSTRAINT project_cards_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id)
);

-- 4. Médiateur d'Apprentissage : post-mortems
CREATE TABLE IF NOT EXISTS public.post_mortems (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL,
  community_id uuid NOT NULL,
  generated_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'abandoned' CHECK (status = ANY ('abandoned','paused','completed')),
  what_worked text,
  what_failed text,
  lessons_learned jsonb DEFAULT '[]',
  full_report text,
  generated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_mortems_pkey PRIMARY KEY (id),
  CONSTRAINT post_mortems_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id),
  CONSTRAINT post_mortems_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT post_mortems_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.profiles(id)
);

-- 5. Médiateur : erreurs documentées par la communauté
CREATE TABLE IF NOT EXISTS public.error_memories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  community_id uuid NOT NULL,
  challenge_id uuid,
  error_type text NOT NULL,
  error_summary text NOT NULL,
  resolution text NOT NULL,
  context_tags jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT error_memories_pkey PRIMARY KEY (id),
  CONSTRAINT error_memories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT error_memories_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT error_memories_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id)
);

-- 6. Co-pilote de Relance : briefings
CREATE TABLE IF NOT EXISTS public.restart_briefings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL,
  user_id uuid NOT NULL,
  where_stopped text,
  current_state text,
  priority_actions jsonb DEFAULT '[]',
  env_setup text,
  generated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT restart_briefings_pkey PRIMARY KEY (id),
  CONSTRAINT restart_briefings_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id),
  CONSTRAINT restart_briefings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_community ON public.user_sessions(user_id, community_id);
CREATE INDEX IF NOT EXISTS idx_behavior_profiles_user_community ON public.behavior_profiles(user_id, community_id);
CREATE INDEX IF NOT EXISTS idx_project_cards_community ON public.project_cards(community_id);
CREATE INDEX IF NOT EXISTS idx_post_mortems_community ON public.post_mortems(community_id);
CREATE INDEX IF NOT EXISTS idx_error_memories_community ON public.error_memories(community_id);
CREATE INDEX IF NOT EXISTS idx_restart_briefings_challenge ON public.restart_briefings(challenge_id);
