-- Create function to cleanup old external news (older than 4 weeks)
CREATE OR REPLACE FUNCTION public.cleanup_old_external_news()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.posts 
  WHERE is_external = true 
  AND created_at < NOW() - INTERVAL '4 weeks';
END;
$$;

-- Schedule cleanup to run daily at midnight
SELECT cron.schedule(
  'cleanup-old-external-news',
  '0 0 * * *',
  'SELECT public.cleanup_old_external_news()'
);