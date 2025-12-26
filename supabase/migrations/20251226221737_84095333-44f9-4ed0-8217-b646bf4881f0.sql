-- Drop and recreate post_type enum with new values
ALTER TYPE post_type RENAME TO post_type_old;

CREATE TYPE post_type AS ENUM ('news', 'blog', 'announcement', 'post');

ALTER TABLE posts 
  ALTER COLUMN post_type DROP DEFAULT,
  ALTER COLUMN post_type TYPE post_type USING (
    CASE post_type::text
      WHEN 'blog' THEN 'blog'::post_type
      WHEN 'post' THEN 'post'::post_type
      ELSE 'post'::post_type
    END
  ),
  ALTER COLUMN post_type SET DEFAULT 'post'::post_type;

DROP TYPE post_type_old;

-- Add new columns to posts table
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create function to calculate reading time (words / 200 wpm)
CREATE OR REPLACE FUNCTION public.calculate_reading_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reading_time := GREATEST(1, CEIL(array_length(regexp_split_to_array(NEW.content, '\s+'), 1)::numeric / 200));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-calculate reading time
DROP TRIGGER IF EXISTS calculate_post_reading_time ON posts;
CREATE TRIGGER calculate_post_reading_time
  BEFORE INSERT OR UPDATE OF content ON posts
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_reading_time();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET view_count = view_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update existing posts with reading time
UPDATE posts SET reading_time = GREATEST(1, CEIL(array_length(regexp_split_to_array(content, '\s+'), 1)::numeric / 200));