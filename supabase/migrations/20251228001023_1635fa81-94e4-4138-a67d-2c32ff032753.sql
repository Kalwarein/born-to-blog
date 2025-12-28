-- Create post_views table for unique view tracking
CREATE TABLE public.post_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id),
  UNIQUE(post_id, session_id)
);

-- Enable RLS
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert view (tracked by user_id or session)
CREATE POLICY "Anyone can record view"
ON public.post_views
FOR INSERT
WITH CHECK (true);

-- Anyone can view counts
CREATE POLICY "Anyone can read views"
ON public.post_views
FOR SELECT
USING (true);

-- Add breaking column to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS breaking BOOLEAN DEFAULT false;

-- Create function to record view and increment count (only if not viewed before)
CREATE OR REPLACE FUNCTION public.record_post_view(
  p_post_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  view_exists BOOLEAN;
BEGIN
  -- Check if view already exists for this user or session
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM post_views 
      WHERE post_id = p_post_id AND user_id = p_user_id
    ) INTO view_exists;
  ELSIF p_session_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM post_views 
      WHERE post_id = p_post_id AND session_id = p_session_id
    ) INTO view_exists;
  ELSE
    view_exists := false;
  END IF;

  -- If not viewed, record the view and increment count
  IF NOT view_exists THEN
    IF p_user_id IS NOT NULL THEN
      INSERT INTO post_views (post_id, user_id) 
      VALUES (p_post_id, p_user_id)
      ON CONFLICT (post_id, user_id) DO NOTHING;
    ELSIF p_session_id IS NOT NULL THEN
      INSERT INTO post_views (post_id, session_id) 
      VALUES (p_post_id, p_session_id)
      ON CONFLICT (post_id, session_id) DO NOTHING;
    END IF;
    
    -- Increment view count
    UPDATE posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_post_id;
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;