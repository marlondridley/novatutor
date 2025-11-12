-- Create storage bucket for homework images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'homework-uploads',
  'homework-uploads',
  true, -- Public bucket (images can be accessed via URL)
  10485760, -- 10MB limit per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload
CREATE POLICY "Users can upload homework images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'homework-uploads');

-- Create policy to allow users to read their own images
CREATE POLICY "Users can read homework images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'homework-uploads');

-- Create policy to allow users to delete their own images
CREATE POLICY "Users can delete their own homework images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'homework-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to update their own images
CREATE POLICY "Users can update their own homework images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'homework-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

