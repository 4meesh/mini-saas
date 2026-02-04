# Supabase Setup Guide

This guide will walk you through setting up Supabase for the Mini SaaS Dashboard application.

## 1. Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up with GitHub or email
3. Create a new project:
   - Enter a project name (e.g., "mini-saas-dashboard")
   - Create a strong database password (save this!)
   - Select a region close to your users
   - Click "Create new project"

## 2. Get Your API Credentials

1. Once your project is created, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")
3. Create a `.env` file in your project root and add:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Create the Tasks Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Paste the following SQL and click "Run":

```sql
-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX tasks_user_id_idx ON tasks(user_id);
CREATE INDEX tasks_created_at_idx ON tasks(created_at DESC);
```

## 4. Enable Row Level Security (RLS)

Row Level Security ensures users can only access their own data. Run the following SQL:

```sql
-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tasks
CREATE POLICY "Users can view their own tasks"
  ON tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own tasks
CREATE POLICY "Users can create their own tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tasks
CREATE POLICY "Users can update their own tasks"
  ON tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks"
  ON tasks
  FOR DELETE
  USING (auth.uid() = user_id);
```

## 5. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled (it should be by default)
3. Optional: Configure email templates under **Authentication** → **Email Templates**

### Email Confirmation Settings

By default, Supabase requires email confirmation. For development, you can disable this:

1. Go to **Authentication** → **Settings**
2. Scroll to "Email Auth"
3. Toggle off "Enable email confirmations" (for development only)
4. For production, keep this enabled for security

## 6. Verify Your Setup

You can verify your setup by running a test query:

```sql
-- This should return an empty result (no tasks yet)
SELECT * FROM tasks;
```

## 7. Test Authentication

1. Start your application
2. Try signing up with a test email
3. Check **Authentication** → **Users** in Supabase to see the new user
4. Try creating a task and verify it appears in the **Table Editor** → **tasks**

## Database Schema Reference

### Tasks Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | Foreign key to auth.users, identifies task owner |
| `content` | TEXT | Task content/description |
| `completed` | BOOLEAN | Task completion status (default: false) |
| `created_at` | TIMESTAMP | Task creation timestamp (UTC) |

## Security Notes

- ✅ RLS policies ensure users can only access their own tasks
- ✅ The `user_id` is automatically set from the authenticated user
- ✅ All database operations require authentication
- ✅ Passwords are securely hashed by Supabase Auth
- ⚠️ Never commit your `.env` file to version control
- ⚠️ Use different Supabase projects for development and production

## Troubleshooting

### "Missing Supabase environment variables" Error
- Ensure your `.env` file exists in the project root
- Verify the variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your development server after creating/modifying `.env`

### Authentication Not Working
- Check that email authentication is enabled in Supabase
- Verify your API credentials are correct
- Check browser console for detailed error messages

### Tasks Not Appearing
- Verify RLS policies are created correctly
- Check that you're signed in with the correct user
- Inspect the Network tab in browser DevTools for API errors

### Email Confirmation Issues
- For development, disable email confirmations in Supabase settings
- For production, configure SMTP settings for email delivery
- Check spam folder for confirmation emails

## Next Steps

Once your Supabase setup is complete:
1. Ensure your `.env` file has the correct credentials
2. Start the Docker container: `docker-compose up`
3. Access the app at `http://localhost:5173`
4. Sign up and start creating tasks!
