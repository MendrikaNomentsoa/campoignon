'use client';

import { useEffect, useRef } from 'react';
import { Message } from './Message';
import type { DiscussionMessage } from '@/lib/types/discussion';

interface MessageListProps {
  messages: DiscussionMessage[];
  currentUserId: string;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onReply: (messageId: string) => void;
  onAddReaction: (messageId: string, reaction: string) => void;
  onRemoveReaction: (messageId: string, reaction: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  loading: boolean;
}

export function MessageList({
  messages,
  currentUserId,
  onEdit,
  onDelete,
  onReply,
  onAddReaction,
  onRemoveReaction,
  hasMore,
  onLoadMore,
  loading,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-4xl mb-2">💭</p>
          <p className="text-lg">Aucun message</p>
          <p className="text-sm">Soyez le premier à lancer la discussion !</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-1">
      {hasMore && (
        <div ref={loadMoreRef} className="h-4" />
      )}

      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
          onReply={onReply}
          onAddReaction={onAddReaction}
          onRemoveReaction={onRemoveReaction}
        />
      ))}
    </div>
  );
}