'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  Edit2, 
  Trash2, 
  MessageCircle
} from 'lucide-react';
import type { DiscussionMessage } from '@/lib/types/discussion';

// Fonction de formatage simple sans date-fns
function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'à l\'instant';
  if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 604800) return `il y a ${Math.floor(diffInSeconds / 86400)} j`;
  return past.toLocaleDateString('fr-FR');
}

interface MessageProps {
  message: DiscussionMessage;
  currentUserId: string;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onReply: (messageId: string) => void;
  onAddReaction: (messageId: string, reaction: string) => void;
  onRemoveReaction: (messageId: string, reaction: string) => void;
  isReply?: boolean;
}

const REACTIONS = [
  { emoji: '👍', label: 'J\'aime' },
  { emoji: '❤️', label: 'J\'adore' },
  { emoji: '😂', label: 'Drôle' },
  { emoji: '😮', label: 'Surprenant' },
  { emoji: '😢', label: 'Triste' },
  { emoji: '🙏', label: 'Merci' },
];

export function Message({
  message,
  currentUserId,
  onEdit,
  onDelete,
  onReply,
  onAddReaction,
  onRemoveReaction,
  isReply = false,
}: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = message.user_id === currentUserId;

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Voulez-vous vraiment supprimer ce message ?')) {
      onDelete(message.id);
    }
    setShowActions(false);
  };

  const toggleReaction = (reaction: string) => {
    const hasReacted = message.reactions?.some(
      r => r.user_id === currentUserId && r.reaction === reaction
    );
    if (hasReacted) {
      onRemoveReaction(message.id, reaction);
    } else {
      onAddReaction(message.id, reaction);
    }
    setShowReactions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActions(false);
        setShowReactions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowActions(false);
        setShowReactions(false);
        setIsEditing(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const timeAgo = formatTimeAgo(message.created_at);

  const groupedReactions = message.reactions?.reduce((acc, r) => {
    if (!acc[r.reaction]) {
      acc[r.reaction] = [];
    }
    acc[r.reaction].push(r);
    return acc;
  }, {} as Record<string, typeof message.reactions>);

  return (
    <div className={`${isReply ? 'ml-12 mt-3' : 'border-b border-gray-100 last:border-0'}`}>
      <div className={`py-3 ${isReply ? 'pl-4 border-l-2 border-gray-200' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {message.profiles?.username?.[0]?.toUpperCase() || 'U'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-gray-900">
                {message.profiles?.username || 'Utilisateur inconnu'}
              </span>
              <span className="text-xs text-gray-500">{timeAgo}</span>
              {message.is_edited && (
                <span className="text-xs text-gray-400">(modifié)</span>
              )}
            </div>

            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEdit();
                    }
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                      setEditContent(message.content);
                    }
                  }}
                />
                <button
                  onClick={handleEdit}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Envoyer
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }}
                  className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <p className="text-gray-800 whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}

            {groupedReactions && Object.keys(groupedReactions).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(groupedReactions).map(([emoji, reactions]) => {
                  const userReacted = reactions.some(r => r.user_id === currentUserId);
                  return (
                    <button
                      key={emoji}
                      onClick={() => toggleReaction(emoji)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm border transition-colors ${
                        userReacted
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span className="text-xs font-medium">{reactions.length}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-1 mt-2">
              <button
                onClick={() => onReply(message.id)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Répondre</span>
                {message.reply_count && message.reply_count > 0 && (
                  <span className="text-xs text-gray-400 ml-1">
                    ({message.reply_count})
                  </span>
                )}
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  😊
                </button>

                {showReactions && (
                  <div className="absolute bottom-full left-0 mb-1 bg-card rounded-xl shadow-lg border p-2 flex gap-1 z-10">
                    {REACTIONS.map(({ emoji, label }) => (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(emoji)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-lg"
                        title={label}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isOwner && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showActions && (
                    <div className="absolute right-0 mt-1 bg-card rounded-lg shadow-lg border py-1 z-10 min-w-[150px]">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Modifier
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {!isReply && message.replies && message.replies.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.replies.map((reply) => (
              <Message
                key={reply.id}
                message={reply}
                currentUserId={currentUserId}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
                onAddReaction={onAddReaction}
                onRemoveReaction={onRemoveReaction}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}