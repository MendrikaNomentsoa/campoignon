'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface MatchedError {
  similarity: number;
  error_description: string;
  solution: string;
  community_name: string;
  created_at: string;
}

interface PostMortemData {
  title: string;
  error_summary: string;
  root_cause: string;
  what_worked: string[];
  what_to_improve: string[];
  action_items: string[];
  encouragement: string;
}

interface MediatorPanelProps {
  communityId: string;
}

export function MediatorPanel({ communityId }: MediatorPanelProps) {
  const [mode, setMode] = useState<'match' | 'postmortem'>('match');
  const [query, setQuery] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [matches, setMatches] = useState<MatchedError[] | null>(null);
  const [postmortem, setPostmortem] = useState<PostMortemData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchErrors = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setPostmortem(null);
    try {
      const res = await fetch('/api/ai/mediator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'match', communityId, errorDescription: query }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur inconnue');
      setMatches(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  }, [communityId, query]);

  const requestPostMortem = useCallback(async () => {
    if (!challengeId.trim()) return;
    setLoading(true);
    setError(null);
    setMatches(null);
    try {
      const res = await fetch('/api/ai/mediator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'postmortem', communityId, challengeId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur inconnue');
      setPostmortem(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  }, [communityId, challengeId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Médiateur d&apos;Apprentissage</CardTitle>
        <CardDescription>Trouve des solutions ou génère un post-mortem</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
          <button
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${mode === 'match' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            onClick={() => setMode('match')}
          >
            Chercher une erreur
          </button>
          <button
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${mode === 'postmortem' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            onClick={() => setMode('postmortem')}
          >
            Post-mortem
          </button>
        </div>

        {mode === 'match' ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Décris l'erreur que tu as rencontrée..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchErrors()}
              />
              <Button size="sm" onClick={searchErrors} disabled={loading}>Chercher</Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-4"><LoadingSpinner size="sm" /></div>
            ) : matches && (
              <div className="space-y-2">
                {matches.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">Aucune erreur similaire trouvée. Tu es le premier !</p>
                ) : (
                  matches.map((m, i) => (
                    <div key={i} className="rounded-lg border p-3 text-sm space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium truncate max-w-[70%]">{m.error_description}</span>
                        <span className="text-xs text-muted-foreground">{Math.round(m.similarity * 100)}% similarité</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{m.solution}</div>
                      <div className="text-xs text-muted-foreground">depuis {m.community_name}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="ID du défi abandonné"
                value={challengeId}
                onChange={(e) => setChallengeId(e.target.value)}
              />
              <Button size="sm" onClick={requestPostMortem} disabled={loading}>Générer</Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-4"><LoadingSpinner size="sm" /></div>
            ) : postmortem && (
              <div className="space-y-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="font-medium">{postmortem.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{postmortem.error_summary}</div>
                </div>

                <div className="text-sm">
                  <div className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">Cause racine</div>
                  <div>{postmortem.root_cause}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="font-medium text-xs text-green-600 uppercase tracking-wide mb-1">Ce qui a marché</div>
                    <ul className="space-y-0.5">
                      {postmortem.what_worked.map((w, i) => (
                        <li key={i} className="flex items-start gap-1"><span className="text-green-500">+</span> {w}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium text-xs text-amber-600 uppercase tracking-wide mb-1">À améliorer</div>
                    <ul className="space-y-0.5">
                      {postmortem.what_to_improve.map((w, i) => (
                        <li key={i} className="flex items-start gap-1"><span className="text-amber-500">!</span> {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="text-sm">
                  <div className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">Actions concrètes</div>
                  <ul className="space-y-0.5">
                    {postmortem.action_items.map((a, i) => (
                      <li key={i} className="flex items-start gap-1"><span className="text-primary">&#9654;</span> {a}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg bg-primary/5 p-3 text-sm italic text-primary">
                  {postmortem.encouragement}
                </div>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}
