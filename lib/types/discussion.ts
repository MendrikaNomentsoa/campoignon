// lib/types/discussion.ts

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

export interface DiscussionMessage {
  id: string;
  community_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  parent_id: string | null;
  reply_count: number;
  profiles?: {
    id: string;
    username: string;
  };
  reactions?: MessageReaction[];
  replies?: DiscussionMessage[];
}