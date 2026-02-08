import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// Known token names mapping
const TOKEN_NAMES: Record<string, { symbol: string; name: string }> = {
  'So11111111111111111111111111111111111111112': { symbol: 'SOL', name: 'Solana' },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { symbol: 'BONK', name: 'Bonk' },
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': { symbol: 'WIF', name: 'dogwifhat' },
  '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU': { symbol: 'SAMO', name: 'Samoyedcoin' },
  '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr': { symbol: 'POPCAT', name: 'Popcat' },
  'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5': { symbol: 'MEW', name: 'Cat in a Dogs World' },
  '5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC': { symbol: 'PONKE', name: 'Ponke' },
  'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4': { symbol: 'MYRO', name: 'Myro' },
  'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82': { symbol: 'BOME', name: 'Book of Meme' },
  'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk': { symbol: 'WEN', name: 'Wen' },
  '7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3': { symbol: 'SLERF', name: 'Slerf' },
  '5mbK36SZ7J19An8jFochhQS4of8g6BwUjbeCSxBSoWdp': { symbol: 'MICHI', name: 'Michicoin' },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '1', 10);

    // Calculate the timestamp for N hours ago
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hours);

    // Get vote counts for each token in the last N hours
    const { data: votes, error } = await supabase
      .from('votes')
      .select('token_mint, vote')
      .gte('created_at', hoursAgo.toISOString());

    if (error) {
      console.error('Error fetching trending votes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aggregate votes by token
    const tokenVotes: Record<string, { pump: number; dump: number; total: number; score: number }> = {};

    votes?.forEach((vote) => {
      if (!tokenVotes[vote.token_mint]) {
        tokenVotes[vote.token_mint] = { pump: 0, dump: 0, total: 0, score: 0 };
      }
      
      tokenVotes[vote.token_mint].total += 1;
      if (vote.vote === 'pump') {
        tokenVotes[vote.token_mint].pump += 1;
      } else if (vote.vote === 'dump') {
        tokenVotes[vote.token_mint].dump += 1;
      }
    });

    // Calculate trending score (total votes * pump ratio)
    // This favors tokens with lots of votes and high pump sentiment
    Object.keys(tokenVotes).forEach((mint) => {
      const { pump, dump, total } = tokenVotes[mint];
      const pumpRatio = total > 0 ? pump / total : 0;
      tokenVotes[mint].score = total * pumpRatio;
    });

    // Sort by score and get top tokens
    const trending = Object.entries(tokenVotes)
      .map(([mint, stats]) => {
        const tokenInfo = TOKEN_NAMES[mint];
        return {
          mint,
          symbol: tokenInfo?.symbol || mint.slice(0, 4).toUpperCase(),
          name: tokenInfo?.name || `${mint.slice(0, 8)}...`,
          ...stats,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    console.log('Trending tokens:', trending); // Debug log

    return NextResponse.json({ 
      trending,
      hours,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in trending API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trending tokens' },
      { status: 500 }
    );
  }
}
