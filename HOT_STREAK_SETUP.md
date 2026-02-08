# Hot Streak Feature - Database Update

## Step 1: Update the votes table

Run this SQL in Supabase SQL Editor (Settings → Database → SQL Editor):

```sql
-- Add price_at_vote column to track price when vote was made
ALTER TABLE votes ADD COLUMN IF NOT EXISTS price_at_vote NUMERIC;

-- Add is_correct column to track if prediction was accurate
ALTER TABLE votes ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT NULL;

-- Add checked_at column to track when we verified the vote
ALTER TABLE votes ADD COLUMN IF NOT EXISTS checked_at TIMESTAMPTZ;
```

## Step 2: How It Works

1. **When user votes:**
   - Current token price is saved with the vote
   - Vote is stored in database with timestamp

2. **After 24 hours (manual check for now):**
   - Compare current price to price_at_vote
   - If voted "pump" and price went up → is_correct = true
   - If voted "dump" and price went down → is_correct = true
   - Otherwise → is_correct = false

3. **Hot Streak Badge:**
   - Shows if user has ≥70% accuracy
   - Requires minimum 3 verified votes
   - Displays as animated badge: "🔥 Hot Streak: 85% (12 votes)"

## Step 3: Test It

1. Restart your dev server
2. Connect wallet and vote on a few tokens
3. Check Supabase dashboard → votes table
4. You should see `price_at_vote` column populated

## Future Enhancement (Optional)

Add a cron job to automatically verify votes after 24h:
- Could use Vercel Cron or Supabase Edge Functions
- Runs daily to check all unverified votes
- Updates `is_correct` and `checked_at` automatically

For now, the badge will show once you manually set `is_correct` values in Supabase!
