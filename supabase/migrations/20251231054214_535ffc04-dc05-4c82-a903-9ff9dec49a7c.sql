-- Create user_notification_reads table to track read status per user
CREATE TABLE IF NOT EXISTS public.user_notification_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_id)
);

-- Enable RLS
ALTER TABLE public.user_notification_reads ENABLE ROW LEVEL SECURITY;

-- Users can view their own read status
CREATE POLICY "Users can view own read status"
ON public.user_notification_reads
FOR SELECT
USING (auth.uid() = user_id);

-- Users can mark notifications as read
CREATE POLICY "Users can mark notifications as read"
ON public.user_notification_reads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create unique constraint on reading_history for upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'reading_history_user_post_unique'
  ) THEN
    CREATE UNIQUE INDEX reading_history_user_post_unique ON public.reading_history (user_id, post_id);
  END IF;
END $$;