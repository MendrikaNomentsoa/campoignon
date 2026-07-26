-- Statut d'abandon pour les projets (défis) : permet "Adopter & transmettre"
-- ou "Mettre en pause" plutôt qu'une suppression définitive.
-- À exécuter manuellement dans l'éditeur SQL Supabase.

ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS project_status text NOT NULL DEFAULT 'active'
    CHECK (project_status = ANY (ARRAY['active'::text, 'paused'::text, 'adoptable'::text]));
