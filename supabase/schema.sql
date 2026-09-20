-- Supabase Schema for Video Editing Portfolio
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/ltgotfgvoywagrjwdqtv/sql)

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drive_file_id TEXT UNIQUE NOT NULL,
    drive_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'Cinematic',
    tags TEXT[] DEFAULT '{}',
    video_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    mime_type TEXT DEFAULT 'video/mp4',
    file_size BIGINT DEFAULT 0,
    duration NUMERIC DEFAULT 0,
    sync_status TEXT DEFAULT 'published' CHECK (sync_status IN ('pending', 'processing', 'published', 'failed', 'archived')),
    published BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for fast lookup & sorting
CREATE INDEX IF NOT EXISTS idx_projects_drive_file_id ON public.projects(drive_file_id);
CREATE INDEX IF NOT EXISTS idx_projects_published_sort ON public.projects(published, sort_order ASC, created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published projects
CREATE POLICY "Allow public read access to published projects"
    ON public.projects
    FOR SELECT
    USING (published = true);

-- Allow full access with service role or anon key for demo sync
CREATE POLICY "Allow public insert/update for sync"
    ON public.projects
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
