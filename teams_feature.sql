-- ============================================
-- Teams Feature Migration
-- ============================================

-- 1. Create Teams Table
CREATE TABLE teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    join_code TEXT UNIQUE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Team Members Table (Many-to-Many)
CREATE TABLE team_members (
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (team_id, user_id)
);

-- 3. Update Tasks Table
ALTER TABLE tasks ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN category TEXT DEFAULT 'general';

-- 4. Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- 5. Teams Policies
CREATE POLICY "Members can view their teams" ON teams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_id = teams.id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create teams" ON teams
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- 6. Team Members Policies
CREATE POLICY "Members can view fellow team members" ON team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_members AS tm 
            WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid()
        )
    );

-- 7. Update Tasks Policies to support Team Shared Tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
CREATE POLICY "Users can view their own or team tasks" ON tasks
    FOR SELECT USING (
        auth.uid() = user_id OR 
        (team_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_id = tasks.team_id AND user_id = auth.uid()
        ))
    );

DROP POLICY IF EXISTS "Users can create their own tasks" ON tasks;
CREATE POLICY "Users can create tasks for self or team" ON tasks
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND (
            team_id IS NULL OR 
            EXISTS (
                SELECT 1 FROM team_members 
                WHERE team_id = team_id AND user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
CREATE POLICY "Users can update their own or team tasks" ON tasks
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        (team_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_id = tasks.team_id AND user_id = auth.uid()
        ))
    );

DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
CREATE POLICY "Users can delete their own or team tasks" ON tasks
    FOR DELETE USING (
        auth.uid() = user_id OR 
        (team_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_id = tasks.team_id AND user_id = auth.uid()
        ))
    );

-- 8. Function to Join Team via Code
CREATE OR REPLACE FUNCTION join_team_with_code(join_code_param TEXT)
RETURNS VOID AS $$
DECLARE
    target_team_id UUID;
BEGIN
    SELECT id INTO target_team_id FROM teams WHERE join_code = join_code_param;
    
    IF target_team_id IS NULL THEN
        RAISE EXCEPTION 'Invalid join code';
    END IF;

    INSERT INTO team_members (team_id, user_id)
    VALUES (target_team_id, auth.uid())
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
