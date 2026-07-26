'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProfilerResult {
  sessions_count: number;
  total_time_minutes: number;
  avg_session_minutes: number;
  sessions_last_7_days: number;
  completion_rate: number;
  level: string;
  label: string;
  suggestions: string[];
}

interface ProfilerPanelProps {
  communityId: string;
}

export function ProfilerPanel({ communityId }: ProfilerPanelProps) {
  const [data, setData] = useState<ProfilerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/profiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur inconnue');
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'analyse');
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profiler d&apos;Élan</CardTitle>
        <CardDescription>Analyse de ton rythme d&apos;apprentissage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-6"><LoadingSpinner size="md" /></div>
        ) : data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-muted-foreground">Sessions</div>
                <div className="text-xl font-bold">{data.sessions_count}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-muted-foreground">Temps total</div>
                <div className="text-xl font-bold">{data.total_time_minutes} min</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-muted-foreground">Moy./session</div>
                <div className="text-xl font-bold">{data.avg_session_minutes} min</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-muted-foreground">Taux complétion</div>
                <div className="text-xl font-bold">{data.completion_rate}%</div>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium">{data.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {data.sessions_last_7_days} sessions ces 7 derniers jours
              </div>
            </div>

            {data.suggestions.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Suggestions</div>
                {data.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-amber-500">&#9733;</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}

            <Button variant="outline" size="sm" onClick={analyze}>Rafraîchir</Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">
              Le Compagnon va analyser ton comportement pour mieux te guider.
            </p>
            <Button onClick={analyze} size="sm">Analyser mon élan</Button>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}
