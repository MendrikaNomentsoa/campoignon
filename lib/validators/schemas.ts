import { z } from 'zod';

export const createEntrySchema = z.object({
  communityId: z.string().uuid(),
  content: z.string().min(1, 'Le contenu est requis'),
});

// Ré-export depuis auth.ts pour faciliter l'import
export * from './auth';