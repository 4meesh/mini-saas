-- ============================================
-- Enhanced Features - Database Migration
-- ============================================
-- Run this in Supabase SQL Editor to add new columns
-- ============================================

-- Add priority column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Add category column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general' CHECK (category IN ('work', 'personal', 'shopping', 'health', 'finance', 'general'));

-- Create index for priority queries
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON tasks(priority);

-- Create index for category queries
CREATE INDEX IF NOT EXISTS tasks_category_idx ON tasks(category);

-- ============================================
-- Migration Complete! ✅
-- ============================================
-- New columns added:
-- - priority: low, medium, high, urgent
-- - category: work, personal, shopping, health, finance, general
-- ============================================
