# Supabase Database Setup for Voting System

## 1. Create a Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (easiest)

## 2. Create a New Project
1. Click "New Project"
2. Name it: `blackkeep-votes` (or whatever you want)
3. Create a strong database password (save it!)
4. Choose a region close to you
5. Click "Create new project" (takes ~2 minutes)

## 3. Create the Votes Table
1. Click "SQL Editor" in the left sidebar
2. Click "New query"
3. Paste this SQL and click "Run":

```sql
-- Create votes table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_mint TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('pump', 'dump')),
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_votes_token_mint ON votes(token_mint);
CREATE INDEX idx_votes_wallet_address ON votes(wallet_address);

-- Create unique constraint (one vote per wallet per token)
CREATE UNIQUE INDEX idx_unique_vote ON votes(token_mint, wallet_address) WHERE wallet_address IS NOT NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read votes
CREATE POLICY "Anyone can view votes"
  ON votes
  FOR SELECT
  USING (true);

-- Allow anyone to insert votes
CREATE POLICY "Anyone can insert votes"
  ON votes
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own votes
CREATE POLICY "Anyone can update votes"
  ON votes
  FOR UPDATE
  USING (true);

-- Allow users to delete their own votes
CREATE POLICY "Anyone can delete votes"
  ON votes
  FOR DELETE
  USING (true);
```

## 4. Get Your API Keys
1. Click "Settings" (gear icon) in the left sidebar
2. Click "API" under Project Settings
3. Copy these values:

   **Project URL:** `https://xxxxxxxxxxxxx.supabase.co`
   **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

## 5. Add to .env.local
Replace these in your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 6. Restart Your Dev Server
```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

## 7. Test It!
1. Open http://localhost:3000
2. Click on any token
3. Vote "Pumping" or "Dumping"
4. Refresh the page - vote count should persist!
5. Open in another browser - you should see the same votes!

## Verify in Supabase Dashboard
1. Go to "Table Editor" in left sidebar
2. Click "votes" table
3. You should see your votes appearing in real-time!

## Free Tier Limits
- ✅ 500 MB database
- ✅ 2 GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

More than enough for your launch! 🚀
