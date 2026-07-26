-- Ajoute une échéance (compte à rebours) aux défis de communauté.
-- À exécuter manuellement dans l'éditeur SQL Supabase (aucun outil de migration
-- automatique n'est configuré dans ce projet).

ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS deadline timestamp with time zone;
