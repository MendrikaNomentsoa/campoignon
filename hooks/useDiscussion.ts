'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DiscussionMessage } from '@/lib/types/discussion';

// Ré-export du type
export type { DiscussionMessage };

interface UseDiscussionOptions {
  communityId: string;
  limit?: number;
}

export function useDiscussion({ communityId, limit = 50 }: UseDiscussionOptions) {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const supabase = createClient();
  const subscriptionRef = useRef<any>(null);

  // Charger les messages initiaux
  const loadMessages = useCallback(async (before?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        communityId,
        limit: String(limit),
      });
      if (before) {
        params.set('before', before);
      }

      const response = await fetch(`/api/discussions/messages?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du chargement des messages');
      }

      const { data } = await response.json();
      
      if (before) {
        setMessages(prev => [...prev, ...data]);
        setHasMore(data.length === limit);
      } else {
        setMessages(data || []);
        setHasMore(data?.length === limit);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [communityId, limit]);

  // Charger plus de messages
  const loadMore = useCallback(() => {
    if (messages.length > 0 && hasMore) {
      const oldestMessage = messages[messages.length - 1];
      loadMessages(oldestMessage.created_at);
    }
  }, [messages, hasMore, loadMessages]);

  // Envoyer un message
  const sendMessage = useCallback(async (content: string, parentId?: string) => {
    try {
      const response = await fetch('/api/discussions/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityId, content, parentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'envoi du message');
      }

      const { data } = await response.json();
      
      if (parentId) {
        setMessages(prev => prev.map(msg => 
          msg.id === parentId 
            ? { 
                ...msg, 
                replies: [...(msg.replies || []), data],
                reply_count: (msg.reply_count || 0) + 1
              }
            : msg
        ));
      } else {
        setMessages(prev => [data, ...prev]);
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    }
  }, [communityId]);

  // Modifier un message
  const editMessage = useCallback(async (messageId: string, content: string) => {
    try {
      const response = await fetch(`/api/discussions/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la modification du message');
      }

      const { data } = await response.json();
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? data : msg
      ));
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    }
  }, []);

  // Supprimer un message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const response = await fetch(`/api/discussions/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression du message');
      }

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    }
  }, []);

  // Ajouter une réaction
  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    try {
      const response = await fetch('/api/discussions/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, reaction }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout de la réaction');
      }

      const { data } = await response.json();
      
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = [...(msg.reactions || []), data];
          return { ...msg, reactions };
        }
        if (msg.replies) {
          return {
            ...msg,
            replies: msg.replies.map(reply => 
              reply.id === messageId 
                ? { ...reply, reactions: [...(reply.reactions || []), data] }
                : reply
            )
          };
        }
        return msg;
      }));
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    }
  }, []);

  // Supprimer une réaction
  const removeReaction = useCallback(async (messageId: string, reaction: string) => {
    try {
      const response = await fetch(
        `/api/discussions/reactions?messageId=${messageId}&reaction=${reaction}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression de la réaction');
      }

      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = (msg.reactions || []).filter(r => r.reaction !== reaction);
          return { ...msg, reactions };
        }
        if (msg.replies) {
          return {
            ...msg,
            replies: msg.replies.map(reply => 
              reply.id === messageId 
                ? { ...reply, reactions: (reply.reactions || []).filter(r => r.reaction !== reaction) }
                : reply
            )
          };
        }
        return msg;
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    }
  }, []);

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    const setupSubscription = async () => {
      if (subscriptionRef.current) {
        await supabase.removeChannel(subscriptionRef.current);
      }

      const channel = supabase
        .channel(`discussion:${communityId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'discussion_messages',
            filter: `community_id=eq.${communityId}`,
          },
          async (payload) => {
            const response = await fetch(
              `/api/discussions/messages/${payload.new.id}`
            );
            if (response.ok) {
              const { data } = await response.json();
              if (!payload.new.parent_id) {
                setMessages(prev => {
                  if (prev.some(msg => msg.id === data.id)) return prev;
                  return [data, ...prev];
                });
              } else {
                setMessages(prev => prev.map(msg => {
                  if (msg.id !== payload.new.parent_id) return msg;
                  if ((msg.replies || []).some(reply => reply.id === data.id)) return msg;
                  return {
                    ...msg,
                    replies: [...(msg.replies || []), data],
                    reply_count: (msg.reply_count || 0) + 1
                  };
                }));
              }
            }
          }
        )
        .subscribe();

      subscriptionRef.current = channel;
    };

    setupSubscription();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [communityId, supabase]);

  // Charger les messages au montage
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMore,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
  };
}