-- Create forum_reply_likes table for upvote system
CREATE TABLE public.forum_reply_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID NOT NULL REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Ensure one like per user per reply
  UNIQUE (reply_id, user_id)
);

-- Enable RLS
ALTER TABLE public.forum_reply_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes (for counting)
CREATE POLICY "Anyone can view likes"
  ON public.forum_reply_likes
  FOR SELECT
  USING (true);

-- Authenticated users can insert their own likes
CREATE POLICY "Authenticated users can like"
  ON public.forum_reply_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own likes
CREATE POLICY "Users can unlike their own"
  ON public.forum_reply_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster like counting
CREATE INDEX idx_forum_reply_likes_reply_id ON public.forum_reply_likes(reply_id);
CREATE INDEX idx_forum_reply_likes_user_id ON public.forum_reply_likes(user_id);