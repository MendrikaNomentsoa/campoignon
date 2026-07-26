import { SupabaseClient } from '@supabase/supabase-js';
import type { DiscussionMessage, MessageReaction } from '@/lib/types/discussion';

// Ré-export des types
export type { DiscussionMessage, MessageReaction };

// Envoyer un message
export async function sendMessage(
  supabase: SupabaseClient,
  {
    communityId,
    userId,
    content,
    parentId = null,
  }: {
    communityId: string;
    userId: string;
    content: string;
    parentId?: string | null;
  }
) {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    return { error: 'Le message ne peut pas être vide', status: 400 } as const;
  }

  const { data, error } = await supabase
    .from('discussion_messages')
    .insert({
      community_id: communityId,
      user_id: userId,
      content: trimmedContent,
      parent_id: parentId,
    })
    .select(`
      *,
      profiles (
        id,
        username
      )
    `)
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return { error: error.message, status: 500 } as const;
  }

  return { data } as const;
}

// Récupérer les messages d'une communauté
export async function getMessages(
  supabase: SupabaseClient,
  {
    communityId,
    limit = 50,
    before = null,
  }: {
    communityId: string;
    limit?: number;
    before?: string | null;
  }
) {
  let query = supabase
    .from('discussion_messages')
    .select(`
      *,
      profiles (
        id,
        username
      ),
      reactions:message_reactions (
        id,
        user_id,
        message_id,
        reaction,
        created_at,
        profiles (
          username
        )
      )
    `)
    .eq('community_id', communityId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching messages:', error);
    return { error: error.message, status: 500 } as const;
  }

  // Récupérer les réponses pour chaque message
  const messagesWithReplies = await Promise.all(
    (data || []).map(async (message) => {
      const { data: replies, error: repliesError } = await supabase
        .from('discussion_messages')
        .select(`
          *,
          profiles (
            id,
            username
          ),
          reactions:message_reactions (
            id,
            user_id,
            message_id,
            reaction,
            created_at,
            profiles (
              username
            )
          )
        `)
        .eq('parent_id', message.id)
        .order('created_at', { ascending: true });

      if (repliesError) {
        console.error('Error fetching replies:', repliesError);
        return { ...message, replies: [] };
      }

      return { ...message, replies: replies || [] };
    })
  );

  return { data: messagesWithReplies } as const;
}

// Récupérer un message spécifique avec ses réponses
export async function getMessageWithReplies(
  supabase: SupabaseClient,
  { messageId }: { messageId: string }
) {
  const { data: message, error: messageError } = await supabase
    .from('discussion_messages')
    .select(`
      *,
      profiles (
        id,
        username
      ),
      reactions:message_reactions (
        id,
        user_id,
        message_id,
        reaction,
        created_at,
        profiles (
          username
        )
      )
    `)
    .eq('id', messageId)
    .single();

  if (messageError || !message) {
    return { error: 'Message introuvable', status: 404 } as const;
  }

  // Récupérer les réponses
  const { data: replies, error: repliesError } = await supabase
    .from('discussion_messages')
    .select(`
      *,
      profiles (
        id,
        username
      ),
      reactions:message_reactions (
        id,
        user_id,
        message_id,
        reaction,
        created_at,
        profiles (
          username
        )
      )
    `)
    .eq('parent_id', messageId)
    .order('created_at', { ascending: true });

  if (repliesError) {
    console.error('Error fetching replies:', repliesError);
    return { data: { ...message, replies: [] } };
  }

  return { data: { ...message, replies: replies || [] } };
}

// Modifier un message
export async function editMessage(
  supabase: SupabaseClient,
  {
    messageId,
    userId,
    content,
  }: {
    messageId: string;
    userId: string;
    content: string;
  }
) {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    return { error: 'Le message ne peut pas être vide', status: 400 } as const;
  }

  // Vérifier que l'utilisateur est le propriétaire du message
  const { data: message, error: checkError } = await supabase
    .from('discussion_messages')
    .select('user_id')
    .eq('id', messageId)
    .single();

  if (checkError || !message) {
    return { error: 'Message introuvable', status: 404 } as const;
  }

  if (message.user_id !== userId) {
    return { error: 'Vous ne pouvez pas modifier ce message', status: 403 } as const;
  }

  const { data, error } = await supabase
    .from('discussion_messages')
    .update({
      content: trimmedContent,
      updated_at: new Date().toISOString(),
      is_edited: true,
    })
    .eq('id', messageId)
    .select(`
      *,
      profiles (
        id,
        username
      ),
      reactions:message_reactions (
        id,
        user_id,
        message_id,
        reaction,
        created_at,
        profiles (
          username
        )
      )
    `)
    .single();

  if (error) {
    console.error('Error editing message:', error);
    return { error: error.message, status: 500 } as const;
  }

  return { data } as const;
}

// Supprimer un message (et ses réponses en cascade)
export async function deleteMessage(
  supabase: SupabaseClient,
  { messageId, userId }: { messageId: string; userId: string }
) {
  // Vérifier que l'utilisateur est le propriétaire du message
  const { data: message, error: checkError } = await supabase
    .from('discussion_messages')
    .select('user_id')
    .eq('id', messageId)
    .single();

  if (checkError || !message) {
    return { error: 'Message introuvable', status: 404 } as const;
  }

  if (message.user_id !== userId) {
    return { error: 'Vous ne pouvez pas supprimer ce message', status: 403 } as const;
  }

  const { error } = await supabase
    .from('discussion_messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting message:', error);
    return { error: error.message, status: 500 } as const;
  }

  return { data: { success: true } } as const;
}

// Ajouter une réaction
export async function addReaction(
  supabase: SupabaseClient,
  {
    messageId,
    userId,
    reaction,
  }: {
    messageId: string;
    userId: string;
    reaction: string;
  }
) {
  const { data, error } = await supabase
    .from('message_reactions')
    .insert({
      message_id: messageId,
      user_id: userId,
      reaction,
    })
    .select(`
      *,
      profiles (
        username
      )
    `)
    .single();

  if (error) {
    if (error.code === '23505') {
      return { error: 'Vous avez déjà réagi avec cette émotion', status: 409 } as const;
    }
    console.error('Error adding reaction:', error);
    return { error: error.message, status: 500 } as const;
  }

  return { data } as const;
}

// Supprimer une réaction
export async function removeReaction(
  supabase: SupabaseClient,
  {
    messageId,
    userId,
    reaction,
  }: {
    messageId: string;
    userId: string;
    reaction: string;
  }
) {
  const { error } = await supabase
    .from('message_reactions')
    .delete()
    .eq('message_id', messageId)
    .eq('user_id', userId)
    .eq('reaction', reaction);

  if (error) {
    console.error('Error removing reaction:', error);
    return { error: error.message, status: 500 } as const;
  }

  return { data: { success: true } } as const;
}