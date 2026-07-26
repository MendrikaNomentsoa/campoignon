'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDiscussion } from '@/hooks/useDiscussion';
import { createClient } from '@/lib/supabase/client';
import { MessageList } from '@/components/discussion/MessageList';
import { MessageInput } from '@/components/discussion/MessageInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DiscussionPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  const {
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
  } = useDiscussion({ communityId });

  // Récupérer l'utilisateur actuel
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, [supabase]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-2">Une erreur est survenue</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">💬 Discussions</h1>
        <p className="text-gray-500 text-sm">
          Échangez avec les membres de votre communauté
        </p>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-xl shadow-sm border">
        <MessageList
          messages={messages}
          currentUserId={currentUserId || ''}
          onEdit={editMessage}
          onDelete={deleteMessage}
          onReply={sendMessage}
          onAddReaction={addReaction}
          onRemoveReaction={removeReaction}
          hasMore={hasMore}
          onLoadMore={loadMore}
          loading={loading}
        />

        <MessageInput
          onSend={sendMessage}
          disabled={!currentUserId}
          placeholder="Écrire un message..."
        />
      </div>
    </div>
  );
}