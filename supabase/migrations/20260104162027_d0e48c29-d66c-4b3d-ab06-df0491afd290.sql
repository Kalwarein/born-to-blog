-- Add columns for external news support
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_external boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS external_url text,
ADD COLUMN IF NOT EXISTS source_name text;

-- Create unique index on external_url to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_external_url ON public.posts(external_url) WHERE external_url IS NOT NULL;

-- Allow service role to insert external news (for edge function)
CREATE POLICY "Service role can insert external news"
ON public.posts
FOR INSERT
TO service_role
WITH CHECK (true);