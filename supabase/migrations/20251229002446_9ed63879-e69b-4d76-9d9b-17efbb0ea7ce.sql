-- Create publishers table for admin/publisher profiles
CREATE TABLE public.publishers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  contact_email TEXT,
  social_links JSONB DEFAULT '{}',
  total_views INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(admin_id)
);

-- Enable RLS on publishers
ALTER TABLE public.publishers ENABLE ROW LEVEL SECURITY;

-- Anyone can view publisher profiles (public facing)
CREATE POLICY "Anyone can view publishers"
ON public.publishers
FOR SELECT
USING (true);

-- Only the admin owner can insert their publisher profile
CREATE POLICY "Admins can create own publisher profile"
ON public.publishers
FOR INSERT
WITH CHECK (auth.uid() = admin_id AND has_role(auth.uid(), 'admin'));

-- Only the admin owner can update their publisher profile
CREATE POLICY "Admins can update own publisher profile"
ON public.publishers
FOR UPDATE
USING (auth.uid() = admin_id AND has_role(auth.uid(), 'admin'));

-- Only the admin owner can delete their publisher profile
CREATE POLICY "Admins can delete own publisher profile"
ON public.publishers
FOR DELETE
USING (auth.uid() = admin_id AND has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_publishers_updated_at
BEFORE UPDATE ON public.publishers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create storage bucket for publisher images
INSERT INTO storage.buckets (id, name, public) VALUES ('publisher-images', 'publisher-images', true);

-- Storage policies for publisher images
CREATE POLICY "Anyone can view publisher images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'publisher-images');

CREATE POLICY "Admins can upload publisher images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'publisher-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update publisher images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'publisher-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete publisher images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'publisher-images' AND has_role(auth.uid(), 'admin'));