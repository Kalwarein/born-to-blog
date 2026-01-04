-- Make author_id nullable for external posts
ALTER TABLE public.posts ALTER COLUMN author_id DROP NOT NULL;