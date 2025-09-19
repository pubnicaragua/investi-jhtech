-- INVESTI APP - CRITICAL FIXES MIGRATION
-- Execute this in Supabase SQL Editor

-- 1. Fix communities table - ensure both description and descripcion columns exist
DO $$ 
BEGIN
    -- Add descripcion column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'communities' AND column_name = 'descripcion') THEN
        ALTER TABLE communities ADD COLUMN descripcion TEXT;
        -- Copy data from description to descripcion if description exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'communities' AND column_name = 'description') THEN
            UPDATE communities SET descripcion = description WHERE descripcion IS NULL;
        END IF;
    END IF;
END $$;

-- 2. Ensure posts table has celebration_type column (should already exist from schema)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'celebration_type') THEN
        ALTER TABLE posts ADD COLUMN celebration_type TEXT 
        CHECK (celebration_type IN ('milestone', 'achievement', 'success', 'investment_win', 'other'));
    END IF;
END $$;

-- 3. Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public) VALUES 
('post-media', 'post-media', true),
('avatars', 'avatars', true),
('community-images', 'community-images', true),
('chat-media', 'chat-media', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Update storage policies for post-media bucket
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Post media is publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload post media" ON storage.objects;
    
    -- Create new policies
    CREATE POLICY "Post media is publicly accessible" ON storage.objects
        FOR SELECT USING (bucket_id = 'post-media');
    
    CREATE POLICY "Users can upload post media" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'post-media' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
        
    CREATE POLICY "Users can update their post media" ON storage.objects
        FOR UPDATE USING (
            bucket_id = 'post-media' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
        
    CREATE POLICY "Users can delete their post media" ON storage.objects
        FOR DELETE USING (
            bucket_id = 'post-media' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
END $$;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_communities_descripcion ON communities(descripcion);
CREATE INDEX IF NOT EXISTS idx_posts_celebration_type ON posts(celebration_type);

SELECT 'Database migration completed successfully! 🎉' as status;
