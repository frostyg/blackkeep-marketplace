"use client";

import { useState, useEffect } from "react";
import { getBirdeyeTrending, BirdeyeTrendingToken } from "../utils/birdeye";

export default function LiveFeed() {
  const [activeTab, setActiveTab] = useState<"trending" | "network" | "new" | "losers" | "whales">("trending");
  const [birdeyeTrending, setBirdeyeTrending] = useState<BirdeyeTrendingToken[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [trendingByVotes, setTrendingByVotes] = useState<any[]>([]);
  const [isLoadingVotes, setIsLoadingVotes] = useState(false);

  // Fetch trending tokens from Birdeye
  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoadingTrending(true);
      try {
        const trending = await getBirdeyeTrending(10);
        setBirdeyeTrending(trending);
      } catch (error) {
        console.error("Error fetching trending tokens:", error);
      } finally {
        setIsLoadingTrending(false);
      }
    };

    fetchTrending();
    // Refresh every 60 seconds
    const interval = setInterval(fetchTrending, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch trending by votes (last hour)
  useEffect(() => {
    const fetchTrendingVotes = async () => {
      setIsLoadingVotes(true);
      try {
        const response = await fetch('/api/trending?hours=1');
        if (response.ok) {
          const data = await response.json();
          setTrendingByVotes(data.trending || []);
        }
      } catch (error) {
        console.error("Error fetching trending votes:", error);
      } finally {
        setIsLoadingVotes(false);
      }
    };

    fetchTrendingVotes();
    // Refresh every 5 minutes
    const interval = setInterval(fetchTrendingVotes, 300000);
    return () => clearInterval(interval);
  }, []);

  const trendingTokens = [
    { symbol: "BONK", buys: 47, avgSize: 12, change: "+127%", emoji: "🚀" },
    { symbol: "WIF", buys: 31, avgSize: 8, change: "+45%", emoji: "🐕" },
    { symbol: "PONKE", buys: 28, avgSize: 15, change: "+340%", emoji: "🎩" },
    { symbol: "POPCAT", buys: 19, avgSize: 6, change: "-8%", emoji: "😺" },
  ];

  const networkActivity = [
    { 
      user: "@whale_hunter", 
      action: "bought", 
      token: "PONKE", 
      profit: "+340%", 
      time: "2h ago",
      isProfit: true 
    },
    { 
      user: "@degen_dave", 
      action: "sold", 
      token: "BONK", 
      profit: "+12%", 
      time: "4h ago",
      isProfit: true 
    },
    { 
      user: "@moon_boy", 
      action: "bought", 
      token: "WIF", 
      profit: "holding", 
      time: "6h ago",
      isProfit: null 
    },
  ];

  const whaleActivity = [
    {
      wallet: "7xKX...9mPQ",
      action: "bought",
      token: "BONK",
      amount: "2.5M",
      value: "$45K",
      time: "3m ago",
      type: "buy" as const
    },
    {
      wallet: "9vHs...2kLm",
      action: "sold",
      token: "WIF",
      amount: "125K",
      value: "$234K",
      time: "8m ago",
      type: "sell" as const
    },
    {
      wallet: "4nTp...7hQw",
      action: "bought",
      token: "PONKE",
      amount: "500K",
      value: "$210K",
      time: "12m ago",
      type: "buy" as const
    },
    {
      wallet: "2kLm...5vHs",
      action: "bought",
      token: "POPCAT",
      amount: "1.2M",
      value: "$672K",
      time: "15m ago",
      type: "buy" as const
    },
  ];

  const newLaunches = [
    { 
      symbol: "NEWCOIN", 
      buys: 32, 
      mcap: "$12K", 
      liquidity: "$5K",
      age: "2m",
      score: 4.2 
    },
    { 
      symbol: "MOON", 
      buys: 18, 
      mcap: "$45K", 
      liquidity: "$18K",
      age: "15m",
      score: 6.1 
    },
  ];

  const losersTokens = [
    { symbol: "DUMP", buys: 8, avgSize: 3, change: "-45%", emoji: "📉" },
    { symbol: "RUG", buys: 12, avgSize: 5, change: "-67%", emoji: "💸" },
    { symbol: "POPCAT", buys: 15, avgSize: 4, change: "-8%", emoji: "😺" },
    { symbol: "COPE", buys: 6, avgSize: 2, change: "-32%", emoji: "😢" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 h-[calc(100vh-20px)] flex flex-col">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        LIVE FEED
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("trending")}
          className={`px-3 py-2 font-semibold text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "trending"
              ? "text-[#10b981] border-b-2 border-[#10b981]"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Trending
        </button>
        <button
          onClick={() => setActiveTab("network")}
          className={`px-3 py-2 font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === "network"
              ? "text-[#10b981] border-b-2 border-[#10b981]"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Network
        </button>
        <button
          onClick={() => setActiveTab("new")}
          className={`px-3 py-2 font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === "new"
              ? "text-[#10b981] border-b-2 border-[#10b981]"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          New
        </button>
        <button
          onClick={() => setActiveTab("losers")}
          className={`px-3 py-2 font-semibold text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "losers"
              ? "text-[#10b981] border-b-2 border-[#10b981]"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
          Losers
        </button>
        <button
          onClick={() => setActiveTab("whales")}
          className={`px-3 py-2 font-semibold text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "whales"
              ? "text-[#10b981] border-b-2 border-[#10b981]"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          🐋 Whales
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {activeTab === "trending" && (
          <>
            {/* Trending by Votes Section */}
            {trendingByVotes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-600 mb-3">
                  Trending by Votes (Last Hour)
                </h3>
                <div className="space-y-2">
                  {trendingByVotes.slice(0, 4).map((token, i) => (
                    <TrendingCard key={token.mint} token={token} index={i} />
                  ))}
                </div>
              </div>
            )}

            {isLoadingVotes && trendingByVotes.length === 0 && (
              <div className="text-center py-4 text-gray-400 text-sm">
                Loading vote data...
              </div>
            )}

            {/* Price Trending Section */}
            <div className="mb-3">
              <h3 className="text-sm font-bold text-gray-600 mb-3">
                Trending by Price
              </h3>
            </div>

            {isLoadingTrending && (
              <div className="text-center py-8 text-gray-500">
                Loading trending tokens...
              </div>
            )}
            
            {/* Show Birdeye trending if available, otherwise show mock */}
            {(birdeyeTrending.length > 0 ? birdeyeTrending : trendingTokens.slice(0, Math.min(trendingTokens.length, birdeyeTrending.length === 0 ? 4 : 0))).map((token, i) => {
              const isBirdeyeToken = 'rank' in token;
              const symbol = isBirdeyeToken ? (token as BirdeyeTrendingToken).symbol : token.symbol;
              const change = isBirdeyeToken 
                ? `${(token as BirdeyeTrendingToken).priceChange24h > 0 ? '+' : ''}${(token as BirdeyeTrendingToken).priceChange24h.toFixed(1)}%`
                : token.change;
              const volume = isBirdeyeToken ? (token as BirdeyeTrendingToken).volume24h : 0;
              
              return (
                <div 
                  key={i}
                  className="bg-white hover:bg-gray-50 rounded-xl p-2.5 cursor-pointer transition-all group border border-gray-200 hover:border-[#10b981]/30 shadow-lg animate-fadeInUp"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {isBirdeyeToken && (
                        <span className="text-xs font-bold text-gray-400">#{(token as BirdeyeTrendingToken).rank}</span>
                      )}
                      <span className="font-bold text-gray-900 text-lg">${symbol}</span>
                    </div>
                    <span className={`text-sm font-bold ${
                      change.startsWith("+") ? "text-[#10b981]" : "text-[#FF0080]"
                    }`}>
                      {change}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500">
                      {isBirdeyeToken ? (
                        <>Volume: <span className="text-gray-900 font-semibold">${(volume / 1000000).toFixed(1)}M</span></>
                      ) : (
                        <><span className="text-gray-900 font-semibold">{token.buys}</span> buys in 5min</>
                      )}
                    </div>
                    <div className="text-gray-500">
                      {isBirdeyeToken ? (
                        <>MCap: <span className="text-gray-900 font-semibold">${((token as BirdeyeTrendingToken).marketCap / 1000000).toFixed(1)}M</span></>
                      ) : (
                        <>Avg: <span className="text-gray-900 font-semibold">{token.avgSize} SOL</span></>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#10b981] animate-pulse"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {!isLoadingTrending && birdeyeTrending.length === 0 && trendingTokens.map((token, i) => (
              <div 
                key={i}
                className="bg-white hover:bg-gray-50 rounded-xl p-4 cursor-pointer transition-all group border border-gray-200 hover:border-[#10b981]/30 shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-lg">${token.symbol}</span>
                  </div>
                  <span className={`text-sm font-bold ${
                    token.change.startsWith("+") ? "text-[#10b981]" : "text-[#FF0080]"
                  }`}>
                    {token.change}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    <span className="text-gray-900 font-semibold">{token.buys}</span> buys in 5min
                  </div>
                  <div className="text-gray-500">
                    Avg: <span className="text-gray-900 font-semibold">{token.avgSize} SOL</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#10b981] animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === "network" && (
          <>
            {networkActivity.map((activity, i) => (
              <div 
                key={i}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg animate-fadeInUp"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-[#0A0E27] font-bold">
                    {activity.user[1].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">{activity.user}</div>
                    <div className="text-sm text-gray-500 mb-2">
                      {activity.action} <span className="text-gray-900 font-semibold">${activity.token}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      {activity.isProfit !== null && (
                        <span className={`text-sm font-bold ${
                          activity.isProfit ? "text-[#10b981]" : "text-[#FF0080]"
                        }`}>
                          {activity.profit}
                        </span>
                      )}
                      {activity.isProfit === null && (
                        <span className="text-sm text-gray-400">{activity.profit}</span>
                      )}
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                    {activity.action === "bought" && (
                      <button className="mt-2 w-full py-2 bg-gray-50 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-600 transition-all">
                        Copy Trade
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center py-8">
              <div className="text-gray-500 text-sm mb-3">
                Connect with friends to see their trades
              </div>
              <button className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] rounded-lg font-bold text-[#0A0E27] transition-all">
                Invite Friends
              </button>
            </div>
          </>
        )}

        {activeTab === "new" && (
          <>
            {newLaunches.map((launch, i) => (
              <div 
                key={i}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg animate-fadeInUp"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-gray-900 text-lg mb-1">${launch.symbol}</div>
                    <div className="text-xs text-gray-500">Listed {launch.age} ago</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    launch.score >= 6 
                      ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30"
                      : launch.score >= 4
                      ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30"
                      : "bg-[#FF0080]/10 text-[#FF0080] border border-[#FF0080]/30"
                  }`}>
                    {launch.score.toFixed(1)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                  <div>
                    <div className="text-gray-500">Buys</div>
                    <div className="font-semibold text-gray-900">{launch.buys}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">MCap</div>
                    <div className="font-semibold text-gray-900">{launch.mcap}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Liq</div>
                    <div className="font-semibold text-gray-900">{launch.liquidity}</div>
                  </div>
                </div>

                <button className="w-full py-2 bg-[#10b981] hover:bg-[#059669] hover:shadow-lg hover:shadow-[#10b981]/50 rounded-lg font-bold text-white transition-all">
                  Quick Snipe
                </button>
              </div>
            ))}

            <div className="text-center py-4">
              <button className="text-sm text-gray-500 hover:text-gray-900 transition-all">
                Load More Launches →
              </button>
            </div>
          </>
        )}

        {activeTab === "whales" && (
          <>
            {whaleActivity.map((whale, i) => (
              <div 
                key={i}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg hover:border-[#10b981] transition-all cursor-pointer animate-fadeInUp"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl">
                      🐋
                    </div>
                    <div>
                      <div className="font-mono text-sm font-bold text-gray-900">{whale.wallet}</div>
                      <div className="text-xs text-gray-500">{whale.time}</div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                    whale.type === 'buy' 
                      ? 'bg-[#10b981]/10 text-[#10b981]' 
                      : 'bg-[#FF0080]/10 text-[#FF0080]'
                  }`}>
                    {whale.type.toUpperCase()}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      {whale.action} <span className="font-bold text-gray-900">${whale.token}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {whale.amount} tokens
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-gray-900">{whale.value}</div>
                    <div className="text-xs text-gray-500">Value</div>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center py-4">
              <div className="text-gray-500 text-sm">
                🐋 Tracking large wallet movements
              </div>
            </div>
          </>
        )}

        {activeTab === "losers" && (
          <>
            {losersTokens.map((token, i) => (
              <div 
                key={i}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg hover:border-[#FF0080] transition-all cursor-pointer animate-fadeInUp"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{token.emoji}</div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">${token.symbol}</div>
                      <div className="text-xs text-gray-500">{token.buys} sells · Avg ${token.avgSize}K</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#FF0080] font-bold text-lg">{token.change}</div>
                    <div className="text-xs text-gray-500">24h</div>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">
                📉 Avoid these tokens
              </div>
            </div>
          </>
        )}
      </div>

      {/* Live Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></div>
        <span>Live Updates</span>
      </div>
    </div>
  );
}

// Trending Card Component for vote-based trending tokens
function TrendingCard({ token, index }: { token: any; index: number }) {
  const pumpRatio = token.total > 0 ? (token.pump / token.total) * 100 : 0;
  const dumpRatio = token.total > 0 ? (token.dump / token.total) * 100 : 0;

  return (
    <div 
      className="bg-white rounded-xl p-2 border border-[#10b981]/20 hover:border-[#10b981]/50 transition-all cursor-pointer group animate-fadeInUp shadow-sm hover:shadow-md"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#10b981]">#{index + 1}</span>
          <div>
            <div className="font-bold text-lg text-gray-900">${token.symbol}</div>
            <div className="text-xs text-gray-500 truncate max-w-[140px]">{token.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-gray-500">Score:</span>
          <span className="font-bold text-[#10b981]">{token.score.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-gray-500">
          <span className="font-semibold text-gray-900">{token.total}</span> votes
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-[#10b981]">↑ {token.pump}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-[#FF0080]">↓ {token.dump}</span>
          </div>
        </div>
      </div>

      {/* Vote distribution bar */}
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden flex">
        <div 
          className="bg-[#10b981]"
          style={{ width: `${pumpRatio}%` }}
        />
        <div 
          className="bg-[#FF0080]"
          style={{ width: `${dumpRatio}%` }}
        />
      </div>
      
      <div className="mt-0.5 flex justify-between text-xs text-gray-400">
        <span>{pumpRatio.toFixed(0)}% pump</span>
        <span>{dumpRatio.toFixed(0)}% dump</span>
      </div>
    </div>
  );
}
