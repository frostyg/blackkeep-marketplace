import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }

    // Get all votes by this wallet
    const { data: allVotes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .eq('wallet_address', walletAddress);

    if (votesError) throw votesError;

    // Calculate accuracy
    const verifiedVotes = allVotes?.filter(v => v.is_correct !== null) || [];
    const correctVotes = verifiedVotes.filter(v => v.is_correct === true).length;
    const accuracy = verifiedVotes.length > 0 
      ? (correctVotes / verifiedVotes.length) * 100 
      : 0;

    return NextResponse.json({
      totalVotes: allVotes?.length || 0,
      verifiedVotes: verifiedVotes.length,
      correctVotes,
      accuracy: Math.round(accuracy),
      hasHotStreak: accuracy >= 70 && verifiedVotes.length >= 3,
    });
  } catch (error: any) {
    console.error('Accuracy API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accuracy' },
      { status: 500 }
    );
  }
}
