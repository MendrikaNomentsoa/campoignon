'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface QuestCard {
  card_name: string;
  card_type: string;
  card_emoji: string;
  rarity: string;
  title: string;
  description: string;
  challenge_type: string;
  objective_summary: string;
  difficulty: string;
  success_rate: number;
  community_name: string;
  lore: string;
  achievement_badge: string;
  bonus_skills: string[];
}

interface HeritageCardProps {
  challengeId: string;
  communityId: string;
}

const RARITY_COLORS: Record<string, string> = {
  'Légendaire': 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600',
  'Épique': 'bg-purple-500/10 border-purple-500/30 text-purple-600',
  'Rare': 'bg-blue-500/10 border-blue-500/30 text-blue-600',
  'Courante': 'bg-gray-500/10 border-gray-500/30 text-gray-600',
};

export function HeritageCardComponent({ challengeId, communityId }: HeritageCardProps) {
  const [card, setCard] = useState<QuestCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/heritage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, communityId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur inconnue');
      setCard(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  }, [challengeId, communityId]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Carte d&apos;Héritage</CardTitle>
        <CardDescription>Transforme ton projet en carte de quête</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-6"><LoadingSpinner size="md" /></div>
        ) : card ? (
          <div className="space-y-3">
            <div className={`rounded-xl border-2 p-4 ${RARITY_COLORS[card.rarity] || RARITY_COLORS['Courante']}`}>
              <div className="flex items-start justify-between">
                <div className="text-3xl">{card.card_emoji}</div>
                <div className="text-xs font-semibold uppercase tracking-wide">{card.rarity}</div>
              </div>
              <div className="mt-2 text-lg font-bold">{card.title}</div>
              <div className="mt-1 text-sm opacity-80">{card.description}</div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="rounded bg-black/10 px-2 py-0.5">{card.card_type}</span>
                <span className="rounded bg-black/10 px-2 py-0.5">{card.challenge_type}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Objectif</span>
                <span className="text-right max-w-[60%]">{card.objective_summary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulté</span>
                <span>{card.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taux de réussite</span>
                <span>{card.success_rate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Communauté</span>
                <span>{card.community_name}</span>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-sm italic text-muted-foreground">
              &ldquo;{card.lore}&rdquo;
            </div>

            {card.bonus_skills.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Compétences bonus</div>
                <div className="flex flex-wrap gap-1">
                  {card.bonus_skills.map((skill, i) => (
                    <span key={i} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center text-sm font-medium text-primary">
              Badge : {card.achievement_badge}
            </div>

            <Button variant="outline" size="sm" onClick={generate}>Régénérer</Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">
              Génère une carte de quête RPG à partir de ce projet.
            </p>
            <Button onClick={generate} size="sm">Générer la carte</Button>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}
