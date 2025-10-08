-- =====================================================
-- VIDEO SYSTEM TABLES
-- Execute this in Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- COURSES AND LESSONS SYSTEM
-- =====================================================

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES users(id),
    category TEXT,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    duration INTEGER, -- total duration in minutes
    price DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT false,
    enrollment_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course lessons
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    duration INTEGER, -- duration in seconds
    video_id UUID, -- will reference videos table
    content_type TEXT DEFAULT 'video' CHECK (content_type IN ('video', 'text', 'quiz', 'assignment')),
    content_data JSONB, -- additional content data
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, order_index)
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- =====================================================
-- VIDEO SYSTEM
-- =====================================================

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER NOT NULL, -- duration in seconds
    file_size BIGINT, -- file size in bytes
    mime_type TEXT,
    quality TEXT DEFAULT 'HD' CHECK (quality IN ('SD', 'HD', 'FHD', '4K')),
    course_id UUID REFERENCES courses(id),
    lesson_id UUID REFERENCES lessons(id),
    instructor_id UUID REFERENCES users(id),
    category TEXT,
    tags TEXT[],
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video progress tracking
CREATE TABLE IF NOT EXISTS video_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    progress_seconds INTEGER DEFAULT 0, -- current progress in seconds
    total_seconds INTEGER NOT NULL, -- total duration in seconds
    progress_percentage DECIMAL(5,2) DEFAULT 0, -- progress as percentage
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    last_watched_at TIMESTAMPTZ DEFAULT NOW(),
    watch_time_seconds INTEGER DEFAULT 0, -- total time spent watching
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- Video subtitles/captions
CREATE TABLE IF NOT EXISTS video_subtitles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL, -- 'es', 'en', etc.
    language_name TEXT NOT NULL, -- 'Español', 'English', etc.
    subtitle_url TEXT NOT NULL,
    is_auto_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video likes
CREATE TABLE IF NOT EXISTS video_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- Video bookmarks/saves
CREATE TABLE IF NOT EXISTS video_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- Video comments
CREATE TABLE IF NOT EXISTS video_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES video_comments(id) ON DELETE CASCADE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LEARNING PATHS SYSTEM
-- =====================================================

-- Learning paths
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER, -- estimated duration in hours
    course_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning path courses
CREATE TABLE IF NOT EXISTS learning_path_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(learning_path_id, course_id),
    UNIQUE(learning_path_id, order_index)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- Lessons indexes
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons(course_id, order_index);

-- Videos indexes
CREATE INDEX IF NOT EXISTS idx_videos_course_id ON videos(course_id);
CREATE INDEX IF NOT EXISTS idx_videos_lesson_id ON videos(lesson_id);
CREATE INDEX IF NOT EXISTS idx_videos_instructor_id ON videos(instructor_id);
CREATE INDEX IF NOT EXISTS idx_videos_is_published ON videos(is_published);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- Video progress indexes
CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_completed ON video_progress(completed);

-- Course enrollments indexes
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to video tables
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_progress_updated_at BEFORE UPDATE ON video_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS FOR VIDEO SYSTEM
-- =====================================================

-- Function to update video view count
CREATE OR REPLACE FUNCTION increment_video_view_count(video_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE videos
    SET view_count = view_count + 1
    WHERE id = video_uuid;
END;
$$ language 'plpgsql';

-- Function to update video like count
CREATE OR REPLACE FUNCTION update_video_like_count(video_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE videos
    SET like_count = (
        SELECT COUNT(*) FROM video_likes WHERE video_id = video_uuid
    )
    WHERE id = video_uuid;
END;
$$ language 'plpgsql';

-- Function to update course enrollment count
CREATE OR REPLACE FUNCTION update_course_enrollment_count(course_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE courses
    SET enrollment_count = (
        SELECT COUNT(*) FROM course_enrollments WHERE course_id = course_uuid
    )
    WHERE id = course_uuid;
END;
$$ language 'plpgsql';

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on video tables
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_subtitles ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Videos: published videos are readable by everyone
CREATE POLICY "Published videos are readable by everyone" ON videos
    FOR SELECT USING (is_published = true);

-- Videos: instructors can manage their own videos
CREATE POLICY "Instructors can manage their own videos" ON videos
    FOR ALL USING (auth.uid() = instructor_id);

-- Video progress: users can manage their own progress
CREATE POLICY "Users can manage their own video progress" ON video_progress
    FOR ALL USING (auth.uid() = user_id);

-- Video likes: users can manage their own likes
CREATE POLICY "Users can manage their own video likes" ON video_likes
    FOR ALL USING (auth.uid() = user_id);

-- Video bookmarks: users can manage their own bookmarks
CREATE POLICY "Users can manage their own video bookmarks" ON video_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- Video comments: readable by everyone, users can create their own
CREATE POLICY "Video comments are readable by everyone" ON video_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create video comments" ON video_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video comments" ON video_comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Courses: published courses are readable by everyone
CREATE POLICY "Published courses are readable by everyone" ON courses
    FOR SELECT USING (is_published = true);

-- Course enrollments: users can manage their own enrollments
CREATE POLICY "Users can manage their own course enrollments" ON course_enrollments
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- SAMPLE DATA INSERTS
-- =====================================================

-- Insert sample course
INSERT INTO courses (id, title, description, category, level, duration, is_published, is_free) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Inversión para Principiantes', 'Curso completo de inversión en bolsa de valores para principiantes', 'inversiones', 'beginner', 480, true, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample lessons
INSERT INTO lessons (id, course_id, title, order_index, duration, content_type) VALUES
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Introducción a la Inversión', 1, 600, 'video'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Análisis Fundamental', 2, 900, 'video'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Análisis Técnico', 3, 1200, 'video')
ON CONFLICT (id) DO NOTHING;

-- Insert sample videos
INSERT INTO videos (id, title, description, video_url, thumbnail_url, duration, course_id, lesson_id, is_published, is_free, category, tags) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'Fundamentos de Inversión en Bolsa de Valores', 'En este video aprenderás los conceptos básicos para invertir en la bolsa de valores, incluyendo análisis técnico, fundamental y gestión de riesgo.', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop', 900, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', true, true, 'inversiones', ARRAY['inversiones', 'bolsa', 'finanzas', 'principiante']),
('550e8400-e29b-41d4-a716-446655440006', 'Análisis Técnico: Patrones de Velas', 'Aprende a identificar y utilizar los patrones de velas japonesas en tus análisis técnicos.', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop', 1200, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', true, true, 'inversiones', ARRAY['analisis-tecnico', 'velas-japonesas', 'trading'])
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Video system tables created successfully! 🎥' as status;
