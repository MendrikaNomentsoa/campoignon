'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface BriefingData {
  briefing_title: string;
  challenge_title: string;
  challenge_objective: string;
  days_inactive: number;
  resume_strategy: string;
  mini_objective: string;
  estimated_time: string;
  encouragement: string;
  checklist: string[];
}

interface RelanceBriefingProps {
  challengeId: string;
  communityId: string;
}

export function RelanceBriefing({ challengeId, communityId }: RelanceBriefingProps) {
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/relance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, communityId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur inconnue');
      setBriefing(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  }, [challengeId, communityId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Co-pilote de Relance</CardTitle>
        <CardDescription>Un plan pour reprendre ce que tu as mis de côté</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-6"><LoadingSpinner size="md" /></div>
        ) : briefing ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <div className="text-xs text-primary uppercase tracking-wide font-medium">Briefing</div>
              <div className="mt-1 text-lg font-bold">{briefing.briefing_title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{briefing.challenge_title} &mdash; {briefing.days_inactive} jours d&apos;inactivité</div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Objectif</div>
              <div>{briefing.challenge_objective}</div>
            </div>

            <div className="rounded-lg border p-3 text-sm">
              <div className="font-medium">Stratégie de reprise</div>
              <div className="mt-1 text-muted-foreground">{briefing.resume_strategy}</div>
            </div>

            <div className="rounded-lg border border-primary/20 p-3 text-sm">
              <div className="font-medium text-primary">Mini-objectif</div>
              <div className="mt-1">{briefing.mini_objective}</div>
              <div className="mt-1 text-xs text-muted-foreground">Temps estimé : {briefing.estimated_time}</div>
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Checklist</div>
              <div className="space-y-1.5">
                {briefing.checklist.map((item, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-primary/5 p-3 text-sm italic text-primary">
              {briefing.encouragement}
            </div>

            <Button variant="outline" size="sm" onClick={generate}>Régénérer</Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">
              Tu as abandonné un défi ? Le Compagnon te prépare un plan de reprise sans culpabilité.
            </p>
            <Button onClick={generate} size="sm">Générer le briefing</Button>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}
