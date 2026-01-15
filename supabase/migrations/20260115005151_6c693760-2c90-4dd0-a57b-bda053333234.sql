-- Drop existing cleanup function
DROP FUNCTION IF EXISTS cleanup_old_external_news();

-- Create improved cleanup function that deletes news exactly 3 weeks (21 days) after creation
CREATE OR REPLACE FUNCTION cleanup_old_external_news()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete external news posts that are exactly 21 days or older from their creation time
  DELETE FROM public.posts
  WHERE is_external = true
    AND created_at < (NOW() - INTERVAL '21 days');
  
  -- Log the cleanup
  INSERT INTO public.logs (action, details)
  VALUES ('news_cleanup', jsonb_build_object(
    'timestamp', NOW(),
    'retention_period', '21 days'
  ));
END;
$$;

-- Update cron job to run once daily at midnight to check for expired news
SELECT cron.unschedule('cleanup-old-external-news');

SELECT cron.schedule(
  'cleanup-old-external-news',
  '0 0 * * *',
  $$SELECT cleanup_old_external_news()$$
);