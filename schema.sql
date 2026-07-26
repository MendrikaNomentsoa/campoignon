-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.communities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT communities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.community_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_id uuid,
  user_id uuid,
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_members_pkey PRIMARY KEY (id),
  CONSTRAINT community_members_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT community_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.learning_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  community_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT learning_entries_pkey PRIMARY KEY (id),
  CONSTRAINT learning_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT learning_entries_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id)
);
CREATE TABLE public.challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_id uuid,
  creator_id uuid,
  title text NOT NULL,
  description text,
  reward text,
  status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'in_progress'::text, 'finished'::text])),
  winner_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  finished_at timestamp with time zone,
  CONSTRAINT challenges_pkey PRIMARY KEY (id),
  CONSTRAINT challenges_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT challenges_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id),
  CONSTRAINT challenges_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.challenge_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  challenge_id uuid,
  user_id uuid,
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status text NOT NULL DEFAULT 'in_progress'::text CHECK (status = ANY (ARRAY['in_progress'::text, 'finished'::text, 'abandoned'::text])),
  joined_at timestamp with time zone DEFAULT now(),
  finished_at timestamp with time zone,
  total_points integer NOT NULL DEFAULT 0,
  CONSTRAINT challenge_participants_pkey PRIMARY KEY (id),
  CONSTRAINT challenge_participants_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id),
  CONSTRAINT challenge_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  challenge_id uuid,
  label text NOT NULL,
  awarded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT rewards_pkey PRIMARY KEY (id),
  CONSTRAINT rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT rewards_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id)
);
CREATE TABLE public.ai_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  community_id uuid,
  challenge_id uuid,
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text])),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT ai_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT ai_conversations_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT ai_conversations_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id)
);
CREATE TABLE public.reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  community_id uuid,
  challenge_id uuid,
  message text NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  sent boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reminders_pkey PRIMARY KEY (id),
  CONSTRAINT reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT reminders_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT reminders_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id)
);
CREATE TABLE public.challenge_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  challenge_id uuid,
  assigned_to uuid,
  created_by uuid,
  title text NOT NULL,
  description text,
  points integer NOT NULL DEFAULT 10,
  deadline timestamp with time zone,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'done'::text])),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT challenge_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT challenge_tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT challenge_tasks_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id),
  CONSTRAINT challenge_tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(id)
);
CREATE TABLE public.community_signals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  community_id uuid,
  challenge_id uuid,
  task_id uuid,
  type text NOT NULL CHECK (type = ANY (ARRAY['ask_help'::text, 'release_task'::text])),
  message text,
  status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'resolved'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_signals_pkey PRIMARY KEY (id),
  CONSTRAINT community_signals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT community_signals_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT community_signals_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id),
  CONSTRAINT community_signals_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.challenge_tasks(id)
);