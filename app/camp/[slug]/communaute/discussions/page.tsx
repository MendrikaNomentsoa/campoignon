"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useDiscussion } from "@/hooks/useDiscussion";
import { MessageList } from "@/components/discussion/MessageList";
import { MessageInput } from "@/components/discussion/MessageInput";

export default function DiscussionsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

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
  } = useDiscussion({ communityId: slug });

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyingToName, setReplyingToName] = useState<string | null>(null);

  const handleReply = useCallback((messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    setReplyingTo(messageId);
    setReplyingToName(msg?.profiles?.username ?? "Utilisateur");
  }, [messages]);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyingToName(null);
  }, []);

  const handleSend = useCallback(
    async (content: string, parentId?: string) => {
      await sendMessage(content, parentId || replyingTo || undefined);
      handleCancelReply();
    },
    [sendMessage, replyingTo, handleCancelReply]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-rose-900/80 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push(`/camp/${slug}`)}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-medium">Discussions</h1>
              <p className="text-white/40 text-xs">Échange en temps réel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Corps de la discussion */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {error && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        <MessageList
          messages={messages}
          currentUserId=""
          onEdit={editMessage}
          onDelete={deleteMessage}
          onReply={handleReply}
          onAddReaction={addReaction}
          onRemoveReaction={removeReaction}
          hasMore={hasMore}
          onLoadMore={loadMore}
          loading={loading}
        />

        <MessageInput
          onSend={handleSend}
          replyingTo={replyingToName}
          onCancelReply={handleCancelReply}
          placeholder="Écrire un message..."
        />
      </div>
    </div>
  );
}
