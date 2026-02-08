import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { tokenMint, vote, walletAddress, currentPrice } = await request.json();

    if (!tokenMint || !vote) {
      return NextResponse.json(
        { error: 'tokenMint and vote are required' },
        { status: 400 }
      );
    }

    // Check if user already voted for this token
    if (walletAddress) {
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('token_mint', tokenMint)
        .eq('wallet_address', walletAddress)
        .single();

      // If user already voted, update the vote
      if (existingVote) {
        await supabase
          .from('votes')
          .update({ 
            vote, 
            updated_at: new Date().toISOString(),
            price_at_vote: currentPrice || null,
            is_correct: null, // Reset accuracy when vote changes
            checked_at: null
          })
          .eq('id', existingVote.id);
      } else {
        // Insert new vote
        await supabase
          .from('votes')
          .insert({
            token_mint: tokenMint,
            vote,
            wallet_address: walletAddress,
            price_at_vote: currentPrice || null,
          });
      }
    } else {
      // Anonymous vote (no wallet)
      await supabase
        .from('votes')
        .insert({
          token_mint: tokenMint,
          vote,
          wallet_address: null,
          price_at_vote: currentPrice || null,
        });
    }

    // Get updated vote counts
    const { data: votes, error } = await supabase
      .from('votes')
      .select('vote')
      .eq('token_mint', tokenMint);

    if (error) throw error;

    const pumps = votes?.filter((v) => v.vote === 'pump').length || 0;
    const dumps = votes?.filter((v) => v.vote === 'dump').length || 0;

    return NextResponse.json({
      success: true,
      pumps,
      dumps,
      total: pumps + dumps,
    });
  } catch (error: any) {
    console.error('Vote API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process vote' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenMint = searchParams.get('tokenMint');

    if (!tokenMint) {
      return NextResponse.json(
        { error: 'tokenMint is required' },
        { status: 400 }
      );
    }

    // Get vote counts for this token
    const { data: votes, error } = await supabase
      .from('votes')
      .select('vote')
      .eq('token_mint', tokenMint);

    if (error) throw error;

    const pumps = votes?.filter((v) => v.vote === 'pump').length || 0;
    const dumps = votes?.filter((v) => v.vote === 'dump').length || 0;

    return NextResponse.json({
      pumps,
      dumps,
      total: pumps + dumps,
    });
  } catch (error: any) {
    console.error('Get votes API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenMint = searchParams.get('tokenMint');
    const walletAddress = searchParams.get('walletAddress');

    if (!tokenMint || !walletAddress) {
      return NextResponse.json(
        { error: 'tokenMint and walletAddress are required' },
        { status: 400 }
      );
    }

    // Delete user's vote
    await supabase
      .from('votes')
      .delete()
      .eq('token_mint', tokenMint)
      .eq('wallet_address', walletAddress);

    // Get updated vote counts
    const { data: votes, error } = await supabase
      .from('votes')
      .select('vote')
      .eq('token_mint', tokenMint);

    if (error) throw error;

    const pumps = votes?.filter((v) => v.vote === 'pump').length || 0;
    const dumps = votes?.filter((v) => v.vote === 'dump').length || 0;

    return NextResponse.json({
      success: true,
      pumps,
      dumps,
      total: pumps + dumps,
    });
  } catch (error: any) {
    console.error('Delete vote API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete vote' },
      { status: 500 }
    );
  }
}
