'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string, parentId?: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  parentId?: string | null;
  onCancelReply?: () => void;
  replyingTo?: string | null;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Écrire un message...',
  parentId = null,
  onCancelReply,
  replyingTo = null,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus sur le textarea
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // Auto-resize du textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleSend = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(trimmedContent, parentId || undefined);
      setContent('');
      if (onCancelReply) {
        onCancelReply();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape' && onCancelReply) {
      onCancelReply();
    }
  };

  return (
    <div className="border-t p-4 bg-gray-50">
      {/* Indicateur de réponse */}
      {replyingTo && (
        <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-700">
          <span>
            <span className="font-medium">Réponse à</span> {replyingTo}
          </span>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
            aria-label="Annuler la réponse"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Connectez-vous pour discuter' : placeholder}
          disabled={disabled || isSending}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors min-h-[44px] max-h-[120px]"
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || disabled || isSending}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Envoyer</span>
        </button>
      </div>
    </div>
  );
}