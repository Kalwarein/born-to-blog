-- Create user_settings table for personalization
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  dark_mode BOOLEAN DEFAULT false,
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  notifications_enabled BOOLEAN DEFAULT true,
  breaking_news_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view own settings"
ON public.user_settings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert own settings"
ON public.user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
ON public.user_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create reading_history table
CREATE TABLE public.reading_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own reading history
CREATE POLICY "Users can view own reading history"
ON public.reading_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own reading history
CREATE POLICY "Users can insert own reading history"
ON public.reading_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reading history
CREATE POLICY "Users can delete own reading history"
ON public.reading_history
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at on user_settings
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();