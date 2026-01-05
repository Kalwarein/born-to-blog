-- Add font_family column to user_settings for font customization
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'Plus Jakarta Sans';

-- Add line_height column for text spacing customization
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS line_height text DEFAULT 'normal';