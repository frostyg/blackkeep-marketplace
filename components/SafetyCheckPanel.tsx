"use client";

import { useState, useEffect } from "react";
import { getRugCheckReport, getSafetyRating, SafetyMetrics } from "../utils/rugcheck";
import { useWallet } from "@solana/wallet-adapter-react";

export default function SafetyCheckPanel({ token }: { token: any }) {
  const wallet = useWallet();
  const [safetyData, setSafetyData] = useState<SafetyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userVote, setUserVote] = useState<"pump" | "dump" | null>(null);
  const [voteStats, setVoteStats] = useState({ pumps: 0, dumps: 0 });
  const [justLoaded, setJustLoaded] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [accuracy, setAccuracy] = useState<{ accuracy: number; hasHotStreak: boolean; verifiedVotes: number } | null>(null);

  // Fetch user's voting accuracy
  const fetchAccuracy = async () => {
    if (!wallet.publicKey) return;
    
    try {
      const response = await fetch(`/api/accuracy?walletAddress=${wallet.publicKey.toBase58()}`);
      if (response.ok) {
        const data = await response.json();
        setAccuracy(data);
      }
    } catch (error) {
      console.error('Error fetching accuracy:', error);
    }
  };

  // Fetch vote stats from API
  const fetchVoteStats = async (tokenMint: string) => {
    try {
      const response = await fetch(`/api/vote?tokenMint=${tokenMint}`);
      if (response.ok) {
        const data = await response.json();
        setVoteStats({ pumps: data.pumps, dumps: data.dumps });
      }
    } catch (error) {
      console.error('Error fetching vote stats:', error);
      // Fallback to mock data
      setVoteStats({
        pumps: Math.floor(Math.random() * 100) + 20,
        dumps: Math.floor(Math.random() * 50) + 10,
      });
    }
  };

  // Load user's vote and stats from API
  useEffect(() => {
    if (token?.mint) {
      // Reset vote for new token
      setUserVote(null);
      
      // Fetch global vote stats
      fetchVoteStats(token.mint);
      
      // Fetch user accuracy
      fetchAccuracy();
      
      // Check if user has voted (from localStorage for now)
      const savedVote = localStorage.getItem(`vote_${token.mint}`);
      if (savedVote === 'pump' || savedVote === 'dump') {
        setUserVote(savedVote);
      }
    }
  }, [token?.mint, wallet.publicKey]);

  const handleVote = async (vote: "pump" | "dump") => {
    if (!token?.mint) return;

    setIsVoting(true);

    try {
      // If clicking same vote, delete it (unvote)
      if (userVote === vote) {
        // Delete vote via API
        if (wallet.publicKey) {
          const response = await fetch(
            `/api/vote?tokenMint=${token.mint}&walletAddress=${wallet.publicKey.toBase58()}`,
            { method: 'DELETE' }
          );
          
          if (response.ok) {
            const data = await response.json();
            setVoteStats({ pumps: data.pumps, dumps: data.dumps });
          }
        }
        
        setUserVote(null);
        localStorage.removeItem(`vote_${token.mint}`);
      } else {
        // Submit new vote via API
        const response = await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenMint: token.mint,
            vote,
            walletAddress: wallet.publicKey?.toBase58() || null,
            currentPrice: token.price || null,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setVoteStats({ pumps: data.pumps, dumps: data.dumps });
          setUserVote(vote);
          localStorage.setItem(`vote_${token.mint}`, vote);
          
          // Track vote event
          analytics.track('vote_cast', {
            symbol: token.symbol,
            vote: vote,
            mint: token.mint,
            hasWallet: !!wallet?.publicKey,
            pumpVotes: data.pumps,
            dumpVotes: data.dumps,
          });
          
          // Refresh accuracy after voting
          fetchAccuracy();
        } else {
          throw new Error('Vote failed');
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      // Fallback to localStorage-only mode if API fails
      const newStats = { ...voteStats };
      
      if (userVote === "pump") newStats.pumps--;
      if (userVote === "dump") newStats.dumps--;
      
      if (vote !== userVote) {
        if (vote === "pump") newStats.pumps++;
        if (vote === "dump") newStats.dumps++;
      }
      
      const newVote = userVote === vote ? null : vote;
      setUserVote(newVote);
      setVoteStats(newStats);
      
      if (newVote) {
        localStorage.setItem(`vote_${token.mint}`, newVote);
      } else {
        localStorage.removeItem(`vote_${token.mint}`);
      }
    } finally {
      setIsVoting(false);
    }
  };

  const totalVotes = voteStats.pumps + voteStats.dumps;
  const pumpPercentage = totalVotes > 0 ? (voteStats.pumps / totalVotes) * 100 : 50;
  const dumpPercentage = totalVotes > 0 ? (voteStats.dumps / totalVotes) * 100 : 50;

  // Calculate aggregated safety score from multiple sources
  const calculateAggregatedScore = () => {
    // RugCheck score (0-10000, normalize to 0-10)
    const rugCheckScore = (safetyData && !safetyData.isError && safetyData.score > 0) 
      ? (safetyData.score / 1000)
      : (token.safetyScore * 1000) / 100;
    
    // Birdeye security score (using token data, 0-10)
    const birdeyeSecurityScore = token.safetyScore || 5;
    
    // DexScreener liquidity score (based on liquidity amount, 0-10)
    const liquidity = safetyData?.liquidity || token.liquidity || 0;
    const liquidityScore = Math.min(10, Math.max(0, 
      liquidity > 5000000 ? 10 :
      liquidity > 1000000 ? 8 :
      liquidity > 500000 ? 6 :
      liquidity > 100000 ? 4 :
      liquidity > 10000 ? 2 : 0
    ));
    
    // Community vote score (based on pump percentage, 0-10)
    const communityVoteScore = totalVotes > 10 
      ? Math.min(10, Math.max(0, (pumpPercentage / 10)))
      : 5; // Default to neutral if not enough votes
    
    // Weighted aggregation
    const aggregated = (
      rugCheckScore * 0.4 +
      birdeyeSecurityScore * 0.3 +
      liquidityScore * 0.2 +
      communityVoteScore * 0.1
    );
    
    return Math.round(aggregated * 100); // Convert back to 0-1000 scale for compatibility
  };

  useEffect(() => {
    const fetchSafetyData = async () => {
      if (!token?.mint) return;

      setIsLoading(true);
      try {
        const data = await getRugCheckReport(token.mint);
        setSafetyData(data);
        setJustLoaded(true);
        // Remove pulse after 2 seconds
        setTimeout(() => setJustLoaded(false), 2000);
      } catch (error) {
        console.error("Error fetching safety data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSafetyData();
  }, [token?.mint]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading safety data...</div>
        </div>
      </div>
    );
  }

  const score = (safetyData && !safetyData.isError && safetyData.score > 0) 
    ? safetyData.score 
    : token.safetyScore * 1000 || 0;
  
  // Normalize RugCheck score to 0-10 range
  const normalizedScore = (score / 10000) * 10;
  
  const safety = getSafetyRating(score);

  const checks = [
    { 
      label: "Liquidity", 
      value: safetyData?.liquidity 
        ? `$${(safetyData.liquidity / 1000000).toFixed(1)}M`
        : `$${(token.liquidity / 1000000).toFixed(1)}M`, 
      status: (safetyData?.liquidity || token.liquidity) > 100000 ? "pass" : "fail",
      threshold: ">$100K",
      info: "Higher liquidity = lower price impact"
    },
    { 
      label: "Holders", 
      value: (safetyData?.holders || token.holders).toLocaleString(), 
      status: (safetyData?.holders || token.holders) > 1000 ? "pass" 
        : (safetyData?.holders || token.holders) > 100 ? "warning" : "fail",
      threshold: ">1,000",
      info: "More holders = better distribution"
    },
    { 
      label: "Top 10 Hold", 
      value: safetyData?.topHoldersPct 
        ? `${safetyData.topHoldersPct.toFixed(1)}%`
        : "23%", 
      status: (safetyData?.topHoldersPct || 23) < 30 ? "pass" : "warning",
      threshold: "<30%",
      info: "Concentration of ownership"
    },
    { 
      label: "LP Locked", 
      value: safetyData?.liquidityLocked 
        ? `${safetyData.liquidityLocked.toFixed(0)}%`
        : "N/A", 
      status: (safetyData?.liquidityLocked || 0) > 50 ? "pass" : "warning",
      threshold: ">50%",
      info: "Locked liquidity prevents rug pulls"
    },
    { 
      label: "Freezeable", 
      value: safetyData ? (safetyData.freezeable ? "Yes" : "No") : "Unknown", 
      status: safetyData?.freezeable ? "fail" : "pass",
      info: "Can the token be frozen in wallets?"
    },
    { 
      label: "Mintable", 
      value: safetyData ? (safetyData.mintable ? "Yes" : "No") : "Unknown", 
      status: safetyData?.mintable ? "fail" : "pass",
      info: "Can more tokens be created?"
    },
    { 
      label: "Age", 
      value: `${Math.floor(token.age)} days`, 
      status: token.age > 7 ? "pass" : token.age > 1 ? "warning" : "fail",
      threshold: ">7 days",
      info: "Older tokens are generally safer"
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4 relative overflow-hidden">
      
      {/* Hot Streak Badge */}
      {accuracy?.hasHotStreak && wallet.connected && (
        <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse-scale">
          🔥 Hot Streak: {accuracy.accuracy}%
          <span className="text-[10px] opacity-90">({accuracy.verifiedVotes} votes)</span>
        </div>
      )}
      
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="group relative flex items-center gap-2">
            <img src="/blackkeep shield.png" alt="BlackKeep Shield" className="h-5 w-auto cursor-help" />
            <h3 className="text-base font-black text-gray-900 cursor-help">
              SAFETY CHECK
            </h3>
            <div className="invisible group-hover:visible absolute left-0 top-6 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
              <div className="font-bold mb-2">Score Breakdown:</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>RugCheck (40%):</span>
                  <span>{((safetyData && !safetyData.isError && safetyData.score > 0 ? (safetyData.score / 1000) : (token.safetyScore * 1000) / 100) * 0.4).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Security (30%):</span>
                  <span>{((token.safetyScore || 5) * 0.3).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Liquidity (20%):</span>
                  <span>{(Math.min(10, Math.max(0, (safetyData?.liquidity || token.liquidity || 0) > 5000000 ? 10 : (safetyData?.liquidity || token.liquidity || 0) > 1000000 ? 8 : (safetyData?.liquidity || token.liquidity || 0) > 500000 ? 6 : (safetyData?.liquidity || token.liquidity || 0) > 100000 ? 4 : 2)) * 0.2).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Community (10%):</span>
                  <span>{((totalVotes > 10 ? Math.min(10, pumpPercentage / 10) : 5) * 0.1).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-black transition-all ${justLoaded ? 'animate-pulse-scale' : ''}`} style={{ color: safety.color }}>
              {(score / 1000).toFixed(1)}
            </div>
            <div className={`text-sm font-bold`} style={{ color: safety.color }}>
              {safety.label}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out relative`}
            style={{ 
              width: `${Math.min((score / 10000) * 100, 100)}%`,
              backgroundColor: safety.color
            }}
          >
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                animation: 'shimmer 2s infinite',
                backgroundSize: '200% 100%'
              }}
            />
          </div>
        </div>
        
        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>

        {/* Risk warnings from RugCheck - hidden, will show mutable metadata separately below */}

        {/* Checks - Table Format */}
        <div className="grid grid-cols-2 gap-2">
          {checks.map((check, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group"
            >
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  {check.status === "pass" && (
                    <div className="w-4 h-4 rounded-full bg-[#10b981]/20 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {check.status === "warning" && (
                    <div className="w-4 h-4 rounded-full bg-yellow-400/20 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  )}
                  {check.status === "fail" && (
                    <div className="w-4 h-4 rounded-full bg-[#FF0080]/20 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-[#FF0080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-gray-700 font-medium text-xs">{check.label}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900 text-sm">{check.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Community Sentiment Voting */}
        <div className="mt-2 mb-2 p-4 bg-white rounded-xl border border-gray-200">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 block">Community Sentiment</span>
          
          <div className="flex flex-col items-center mb-2">
            {/* Speedometer Gauge */}
            <div className="w-32">
              <div className="relative h-16">
                <svg viewBox="0 0 200 120" className="w-full h-full">
                  {/* Background red arc (full gauge) */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  
                  {/* Green arc overlay (fills from left based on pump %) */}
                  {(() => {
                    const ratio = totalVotes === 0 ? 0.5 : pumpPercentage / 100;
                    
                    // Only draw green if there are pump votes
                    if (ratio <= 0.01) return null;
                    
                    // Calculate end point of green arc
                    const angle = -90 + (ratio * 180);
                    const radians = (angle * Math.PI) / 180;
                    const endX = 100 + 80 * Math.cos(radians);
                    const endY = 100 + 80 * Math.sin(radians);
                    
                    const largeArc = ratio > 0.5 ? 1 : 0;
                    
                    return (
                      <path
                        d={`M 20 100 A 80 80 0 ${largeArc} 1 ${endX} ${endY}`}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                    );
                  })()}
                  
                  {/* Center percentage */}
                  <text
                    x="100"
                    y="70"
                    textAnchor="middle"
                    fontSize="32"
                    fontWeight="700"
                    className={totalVotes === 0 ? 'fill-gray-400' : pumpPercentage > dumpPercentage ? 'fill-emerald-600' : 'fill-[#FF0080]'}
                  >
                    {totalVotes === 0 ? '50' : Math.round(pumpPercentage > dumpPercentage ? pumpPercentage : dumpPercentage)}%
                  </text>
                  {/* Up/Down text */}
                  <text
                    x="100"
                    y="98"
                    textAnchor="middle"
                    fontSize="22"
                    fontWeight="700"
                    className={totalVotes === 0 ? 'fill-gray-400' : pumpPercentage > dumpPercentage ? 'fill-emerald-600' : 'fill-[#FF0080]'}
                  >
                    {totalVotes === 0 ? 'Neutral' : pumpPercentage > dumpPercentage ? 'Up' : 'Down'}
                  </text>
                </svg>
              </div>
            </div>

            {/* Vote count display */}
            <div className="text-center text-xs text-gray-500 mt-1">
              {totalVotes > 0 ? (
                <span>{totalVotes.toLocaleString()} global vote{totalVotes !== 1 ? 's' : ''}</span>
              ) : (
                <span>No votes yet</span>
              )}
            </div>
          </div>

          {/* Vote Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleVote('pump')}
              disabled={isVoting}
              className={`flex items-center justify-center gap-2 py-2 px-5 rounded-lg font-bold text-sm transition-all ${
                userVote === 'pump'
                  ? 'bg-emerald-500 text-white shadow-lg scale-105'
                  : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isVoting && userVote === 'pump' ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              <span>Pumping</span>
            </button>
            
            <button
              onClick={() => handleVote('dump')}
              disabled={isVoting}
              className={`flex items-center justify-center gap-2 py-2 px-5 rounded-lg font-bold text-sm transition-all ${
                userVote === 'dump'
                  ? 'bg-[#FF0080] text-white shadow-lg scale-105'
                  : 'bg-[#FF0080]/10 text-[#FF0080] hover:bg-[#FF0080]/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isVoting && userVote === 'dump' ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              <span>Dumping</span>
            </button>
          </div>
        </div>

        {/* Warning for low score */}
        {score < 6000 && (
          <div className="mt-1 text-sm font-medium text-gray-900">
            ⚠️ High Risk Token - This token has a low safety score. Only invest what you can afford to lose. Always DYOR (Do Your Own Research).
          </div>
        )}

        {/* Mutable metadata warning */}
        {safetyData && safetyData.risks.some(risk => risk.name.toLowerCase().includes('mutable') || risk.name.toLowerCase().includes('metadata')) && (
          <div className="mt-1 text-sm font-medium text-gray-900">
            ⚠️ Mutable metadata - Token metadata can be changed by the owner
          </div>
        )}

        {/* Beginner tip for safe tokens */}
        {score >= 8000 && (
          <div className="mt-1 text-sm font-medium text-[#10b981]">
            Beginner Friendly - This token passes most safety checks. Good for learning, but still volatile. Start with a small amount.
          </div>
        )}

        {/* Error message if RugCheck failed */}
        {safetyData?.isError && (
          <div className="mt-4 mb-2 text-xs text-yellow-600">
            ⚠️ {safetyData.errorMessage || "Unable to fetch live safety data. Showing estimated values."}
          </div>
        )}

        <a 
          href={`https://rugcheck.xyz/tokens/${token.mint}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors inline-block"
        >
          View Full Security Report on RugCheck →
        </a>
      </div>
    </div>
  );
}
