"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import WalletContext from "../components/WalletContext";
import ConnectButton from "../components/ConnectButton";
import TokenScanner from "../components/TokenScanner";
import TradePanel from "../components/TradePanel";
import LiveFeed from "../components/LiveFeed";
import TopNav from "../components/TopNav";

export default function Page() {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [selectedToken, setSelectedToken] = useState<any>({
    symbol: "SOL",
    name: "Solana",
    mint: "So11111111111111111111111111111111111111112",
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    decimals: 9,
    price: 142.56,
    change24h: 5.3,
    volume24h: 2840000000,
    marketCap: 67400000000,
    safetyScore: 10.0,
    liquidity: 156000000,
    holders: 1847293,
    age: 1456,
  });
  const [activeView, setActiveView] = useState<"trade" | "discover" | "feed">("trade");

  return (
    <WalletContext>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <TopNav wallet={wallet} />
        
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-[400px_1fr_400px] gap-6 max-w-[1600px] mx-auto px-6 py-6">
          <TokenScanner 
            selectedToken={selectedToken}
            onSelectToken={setSelectedToken}
          />
          
          <TradePanel 
            token={selectedToken}
            wallet={wallet}
            connection={connection}
          />
          
          <LiveFeed />
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 sticky top-16 bg-white z-20 shadow-sm">
            <button
              onClick={() => setActiveView("discover")}
              className={`flex-1 py-4 font-bold transition-all ${
                activeView === "discover"
                  ? "text-[#10b981] border-b-2 border-[#10b981]"
                  : "text-gray-500"
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => setActiveView("trade")}
              className={`flex-1 py-4 font-bold transition-all ${
                activeView === "trade"
                  ? "text-[#10b981] border-b-2 border-[#10b981]"
                  : "text-gray-500"
              }`}
            >
              Trade
            </button>
            <button
              onClick={() => setActiveView("feed")}
              className={`flex-1 py-4 font-bold transition-all ${
                activeView === "feed"
                  ? "text-[#10b981] border-b-2 border-[#10b981]"
                  : "text-gray-500"
              }`}
            >
              Live Feed
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeView === "discover" && (
              <TokenScanner 
                selectedToken={selectedToken}
                onSelectToken={(token) => {
                  setSelectedToken(token);
                  setActiveView("trade");
                }}
              />
            )}
            {activeView === "trade" && (
              <TradePanel 
                token={selectedToken}
                wallet={wallet}
                connection={connection}
              />
            )}
            {activeView === "feed" && <LiveFeed />}
          </div>
        </div>
      </div>
    </WalletContext>
  );
}
