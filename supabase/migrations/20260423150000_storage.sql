-- Create a new bucket for shop media
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-media', 'shop-media', true);

-- Allow public access to read files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'shop-media');

-- Allow authenticated users to upload files
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'shop-media');
