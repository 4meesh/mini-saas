-- ============================================
-- Mini SaaS Dashboard - Supabase Setup Script
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- It will safely create everything you need
-- ============================================

-- Step 1: Drop existing table if it exists (optional - removes old data)
-- Comment out the next line if you want to keep existing data
DROP TABLE IF EXISTS tasks CASCADE;

-- Step 2: Create the tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 3: Create indexes for better performance
CREATE INDEX tasks_user_id_idx ON tasks(user_id);
CREATE INDEX tasks_created_at_idx ON tasks(created_at DESC);

-- Step 4: Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies

-- Policy 1: Users can view only their own tasks
CREATE POLICY "Users can view their own tasks"
  ON tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can create their own tasks
CREATE POLICY "Users can create their own tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own tasks
CREATE POLICY "Users can update their own tasks"
  ON tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks"
  ON tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Setup Complete! ✅
-- ============================================
-- You can now start your application
-- ============================================
