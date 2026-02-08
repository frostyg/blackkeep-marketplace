"use client";

import { useState, useEffect } from "react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Confetti from "react-confetti";
import SafetyCheckPanel from "./SafetyCheckPanel";
import MiniChart from "./MiniChart";
import { getSwapQuote, executeSwap, SOL_MINT, formatTokenAmount, SwapQuote } from "../utils/jupiterSwap";
import { analytics } from "../utils/analytics";
import { transactionHistory } from "../utils/transactionHistory";

interface TradePanelProps {
  token: any;
  wallet: any;
  connection: any;
}

export default function TradePanel({ token, wallet, connection }: TradePanelProps) {
  const { setVisible } = useWalletModal();
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [showConfirm, setShowConfirm] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const [prevPrice, setPrevPrice] = useState(token?.price || 0);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [portfolio, setPortfolio] = useState([
    { symbol: "SOL", amount: 10.5, value: 1497, change: 5.3 },
    { symbol: "BONK", amount: 125000, value: 1.54, change: 12.3 },
    { symbol: "WIF", amount: 450, value: 841.5, change: 45.2 },
  ]);

  // Debug wallet connection
  useEffect(() => {
    console.log('TradePanel wallet state:', {
      connected: wallet?.connected,
      publicKey: wallet?.publicKey?.toString(),
      wallet: wallet
    });
  }, [wallet?.connected, wallet?.publicKey]);

  // Fetch wallet balances
  const fetchBalances = async () => {
    if (!wallet.connected || !wallet.publicKey || !connection) return;

    try {
      // Fetch SOL balance
      const balance = await connection.getBalance(wallet.publicKey);
      setSolBalance(balance / 1e9); // Convert lamports to SOL

      // Fetch token balance if not SOL
      if (token && token.mint !== SOL_MINT) {
        try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            wallet.publicKey,
            { mint: new (await import('@solana/web3.js')).PublicKey(token.mint) }
          );
          
          if (tokenAccounts.value.length > 0) {
            const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            setTokenBalance(balance);
          } else {
            setTokenBalance(0);
          }
        } catch (error) {
          console.error('Error fetching token balance:', error);
          setTokenBalance(null);
        }
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  // Fetch balances when wallet connects or token changes
  useEffect(() => {
    fetchBalances();
  }, [wallet.connected, wallet.publicKey, token?.mint, connection]);

  // Detect price changes and trigger flash animation
  useEffect(() => {
    if (token && token.price !== prevPrice) {
      if (token.price > prevPrice) {
        setPriceFlash('up');
      } else if (token.price < prevPrice) {
        setPriceFlash('down');
      }
      setPrevPrice(token.price);
      
      // Clear flash after animation
      const timer = setTimeout(() => setPriceFlash(null), 600);
      return () => clearTimeout(timer);
    }
  }, [token?.price, prevPrice]);

  const handleAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    const sanitized = value.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2) return;
    setAmount(sanitized);
  };

  const setPercentage = (percent: number) => {
    // Use actual SOL balance if available, otherwise use mock balance
    const balance = solBalance !== null ? solBalance : 100;
    const newAmount = (balance * percent / 100).toFixed(2);
    setAmount(newAmount);
  };

  // Fetch quote when amount changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!amount || parseFloat(amount) <= 0 || !token || orderType !== "market") {
        setQuote(null);
        return;
      }

      setIsLoadingQuote(true);
      setSwapError(null);

      try {
        const inputMint = activeTab === "buy" ? SOL_MINT : token.mint;
        const outputMint = activeTab === "buy" ? token.mint : SOL_MINT;
        const amountNum = parseFloat(amount);

        const fetchedQuote = await getSwapQuote(inputMint, outputMint, amountNum, 50);
        setQuote(fetchedQuote);
        
        // Track quote fetch
        analytics.track('quote_fetched', {
          symbol: token.symbol,
          amount: amountNum,
          side: activeTab,
          estimatedOutput: fetchedQuote.outAmount,
          priceImpact: fetchedQuote.priceImpactPct,
        });
      } catch (error) {
        console.error("Error fetching quote:", error);
        // Only show error if there's a real failure, not just missing data
        if (error instanceof Error && error.message) {
          setSwapError("Failed to fetch quote");
        }
      } finally {
        setIsLoadingQuote(false);
      }
    };

    // Debounce quote fetching
    const timer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timer);
  }, [amount, token, activeTab, orderType]);

  const handleSwap = async () => {
    if (!quote || !wallet.connected || !connection) {
      return;
    }

    setIsSwapping(true);
    setSwapError(null);

    try {
      const txid = await executeSwap(connection, wallet, quote);
      if (txid) {
        console.log("Swap successful! Transaction:", txid);
        setSwapSuccess(txid);
        setShowConfetti(true);
        setShowConfirm(false);
        
        // Track successful swap
        const swapAmount = parseFloat(amount);
        analytics.track('swap_completed', {
          symbol: token.symbol,
          amount: swapAmount,
          side: activeTab,
          fee: swapAmount * 0.008,
          txid: txid,
          estimatedOutput: quote?.outAmount,
          priceImpact: quote?.priceImpactPct,
        });
        
        // Save to transaction history
        transactionHistory.add({
          txid: txid,
          type: activeTab,
          tokenSymbol: token.symbol,
          tokenMint: token.mint,
          amount: swapAmount,
          estimatedOutput: estimatedReceive,
          priceImpact: quote?.priceImpactPct,
          fee: swapAmount * 0.008,
          status: 'success',
        });
        
        setAmount("");
        setQuote(null);
        
        // Refresh balances after successful swap
        setTimeout(() => {
          fetchBalances();
        }, 2000); // Wait 2 seconds for transaction to finalize
        
        // Auto-hide success message and confetti after 10 seconds
        setTimeout(() => {
          setSwapSuccess(null);
          setShowConfetti(false);
        }, 10000);
      } else {
        throw new Error("Swap failed - no transaction ID returned");
      }
    } catch (error: any) {
      console.error("Swap error:", error);
      setSwapError(error.message || "Swap failed. Please try again.");
      setShowConfirm(false);
      
      // Auto-hide error message after 8 seconds
      setTimeout(() => setSwapError(null), 8000);
    } finally {
      setIsSwapping(false);
    }
  };

  const estimatedReceive = quote 
    ? formatTokenAmount(quote.outAmount, activeTab === "buy" ? (token?.decimals || 9) : 9)
    : amount && token
      ? (parseFloat(amount) / token.price).toFixed(2) 
      : "0";

  if (!token) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12 h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">◉</div>
          <p className="text-lg">Select a token to start trading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti
            numberOfPieces={200}
            recycle={false}
            colors={['#00FFA3', '#00CC82', '#10b981', '#059669']}
            gravity={0.3}
          />
        </div>
      )}

      {/* Success Toast */}
      {swapSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-[#10b981] text-white rounded-xl shadow-2xl p-4 max-w-md animate-fadeInUp">
          <div className="flex items-start gap-3">
            <div className="text-2xl animate-bounce">🎉</div>
            <div className="flex-1">
              <div className="font-bold mb-1 text-lg">Swap successful!</div>
              <div className="text-sm opacity-90 mb-2">
                Your transaction has been confirmed on Solana
              </div>
              <a 
                href={`https://solscan.io/tx/${swapSuccess}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline hover:no-underline inline-flex items-center gap-1"
              >
                View on Solscan →
              </a>
              <button
                onClick={() => {
                  setSwapSuccess(null);
                  setShowConfetti(false);
                }}
                className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {swapError && (
        <div className="fixed top-4 right-4 z-50 bg-[#FF0080] text-white rounded-xl shadow-lg p-4 max-w-md animate-fadeInUp">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <div className="font-bold mb-1">Swap Failed</div>
              <div className="text-sm opacity-90">
                {swapError}
              </div>
              <button
                onClick={() => setSwapError(null)}
                className="absolute top-2 right-2 text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini Portfolio Tracker */}
      {wallet.connected && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              💼 MY PORTFOLIO
            </h3>
            <div className="text-right">
              <div className="text-xs text-gray-500">Total Value</div>
              <div className="text-lg font-bold text-gray-900">
                ${portfolio.reduce((sum, item) => sum + item.value, 0).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {portfolio.map((holding, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="font-bold text-sm text-gray-900">{holding.symbol}</div>
                  <div className="text-xs text-gray-500">{holding.amount.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">${holding.value.toFixed(2)}</div>
                  <div className={`text-xs font-semibold ${holding.change >= 0 ? 'text-[#10b981]' : 'text-[#FF0080]'}`}>
                    {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Token Header and Chart Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <img 
                src={token.logoURI} 
                alt={token.symbol}
                className="w-12 h-12 rounded-full ring-2 ring-[#10b981]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/64/1e293b/94a3b8?text=" + token.symbol[0];
                }}
              />
              <div>
                <h2 className="text-2xl font-black text-gray-900">{token.symbol}</h2>
                <p className="text-sm text-gray-500">{token.name}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Price</div>
              <div className={`text-sm font-bold text-gray-900 transition-all duration-300 ${
                priceFlash === 'up' ? 'animate-flash-green' : priceFlash === 'down' ? 'animate-flash-red' : ''
              }`}>
                ${token.price < 0.01 ? token.price.toFixed(8) : token.price.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">24h Change</div>
              <div className={`text-sm font-bold transition-all duration-300 ${
                token.change24h > 0 ? "text-[#10b981]" : "text-[#FF0080]"
              }`}>
                {token.change24h > 0 ? "+" : ""}{token.change24h.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Market Cap</div>
              <div className="text-sm font-bold text-gray-900">
                {token.marketCap >= 1000000000 
                  ? `$${(token.marketCap / 1000000000).toFixed(2)}B`
                  : `$${(token.marketCap / 1000000).toFixed(1)}M`
                }
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">24h Volume</div>
              <div className="text-sm font-bold text-gray-900">
                {token.volume24h >= 1000000000 
                  ? `$${(token.volume24h / 1000000000).toFixed(2)}B`
                  : token.volume24h >= 1000000
                  ? `$${(token.volume24h / 1000000).toFixed(1)}M`
                  : `$${(token.volume24h / 1000).toFixed(0)}K`
                }
              </div>
            </div>
          </div>
        </div>

        {/* Mini Chart */}
        <MiniChart token={token} />
      </div>

      {/* Safety Check */}
      <SafetyCheckPanel token={token} />

      {/* Trading Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Buy/Sell Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("buy")}
            className={`flex-1 py-3 font-bold text-base transition-all ${
              activeTab === "buy"
                ? "text-[#10b981] bg-[#10b981]/10"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            BUY
          </button>
          <button
            onClick={() => setActiveTab("sell")}
            className={`flex-1 py-3 font-bold text-base transition-all ${
              activeTab === "sell"
                ? "text-[#FF0080] bg-[#FF0080]/10"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            SELL
          </button>
        </div>

        <div className="p-4">
          {/* Order Type */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setOrderType("market")}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                orderType === "market"
                  ? "bg-gray-100 text-gray-900"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              Market
            </button>
            <button
              onClick={() => setOrderType("limit")}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                orderType === "limit"
                  ? "bg-gray-100 text-gray-900"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              Limit
            </button>
          </div>

          {/* Amount Input */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-500">Amount (SOL)</label>
              {wallet.connected && solBalance !== null && (
                <span className="text-xs text-gray-400">
                  Balance: {solBalance.toFixed(4)} SOL
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#10b981] transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                SOL
              </div>
            </div>
          </div>

          {/* Percentage Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button
              onClick={() => setPercentage(25)}
              className="py-2 bg-gray-50 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-600 transition-all"
            >
              25%
            </button>
            <button
              onClick={() => setPercentage(50)}
              className="py-2 bg-gray-50 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-600 transition-all"
            >
              50%
            </button>
            <button
              onClick={() => setPercentage(75)}
              className="py-2 bg-gray-50 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-600 transition-all"
            >
              75%
            </button>
            <button
              onClick={() => setPercentage(100)}
              className="py-2 bg-gray-50 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-600 transition-all"
            >
              MAX
            </button>
          </div>

          {/* Estimated Receive */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">You'll receive</span>
              <span className="text-sm text-gray-400">
                {isLoadingQuote ? "Loading..." : quote ? "Real-time quote" : "Estimated"}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {estimatedReceive} {activeTab === "buy" ? token.symbol : "SOL"}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              ≈ ${(parseFloat(estimatedReceive) * (activeTab === "buy" ? token.price : 1)).toFixed(2)}
            </div>
            {quote && (
              <div className="text-xs text-[#10b981] mt-2">
                Price impact: {quote.priceImpactPct.toFixed(2)}%
              </div>
            )}
            {swapError && (
              <div className="text-xs text-[#FF0080] mt-2">
                {swapError}
              </div>
            )}
          </div>

          {/* Advanced Settings - Progressive Disclosure */}
          <details className="mb-6">
            <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-600 flex items-center gap-2 mb-2 transition-colors">
              <span>Advanced Settings</span>
              <span>⚙️</span>
            </summary>
            <div className="mt-3 space-y-4 border-t border-gray-200 pt-4">
              {/* Fee Info */}
              <div className="space-y-2 text-sm">
                <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Fee Breakdown</div>
                <div className="flex justify-between text-gray-500">
                  <span>Network Fee</span>
                  <span className="text-gray-900">~0.00001 SOL</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Platform Fee (0.8%)</span>
                  <span className="text-gray-900">{amount ? (parseFloat(amount) * 0.008).toFixed(4) : "0"} SOL</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Cost</span>
                  <span>{amount ? (parseFloat(amount) * 1.008).toFixed(4) : "0"} SOL</span>
                </div>
              </div>

              {/* Slippage Settings */}
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Slippage Tolerance</div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-semibold text-gray-600 transition-all">
                    0.5%
                  </button>
                  <button className="flex-1 py-2 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg text-sm font-semibold text-[#10b981] transition-all">
                    1%
                  </button>
                  <button className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-semibold text-gray-600 transition-all">
                    2%
                  </button>
                  <button className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-semibold text-gray-600 transition-all">
                    Custom
                  </button>
                </div>
              </div>

              {/* MEV Protection */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 uppercase">MEV Protection</div>
                    <div className="text-xs text-gray-400 mt-0.5">Protect against front-running</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
                  </label>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Quick Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 transition-all">
                    Auto Sell at +50%
                  </button>
                  <button className="py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 transition-all">
                    Stop Loss at -20%
                  </button>
                </div>
              </div>
            </div>
          </details>

          {/* Action Button */}
          {!wallet.connected ? (
            <button 
              onClick={() => setVisible(true)}
              className="w-full py-4 bg-[#10b981] hover:bg-[#059669] rounded-xl font-bold text-base text-white transition-all"
            >
              CONNECT WALLET
            </button>
          ) : (
            <>
              {solBalance !== null && amount && parseFloat(amount) > solBalance && (
                <div className="mb-3 p-2 bg-[#FF0080]/10 border border-[#FF0080]/30 rounded-lg text-xs text-[#FF0080] text-center">
                  Insufficient balance. You have {solBalance.toFixed(4)} SOL
                </div>
              )}
              <button
                onClick={() => setShowConfirm(true)}
                disabled={!amount || parseFloat(amount) <= 0 || (solBalance !== null && parseFloat(amount) > solBalance)}
                className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
                  activeTab === "buy"
                    ? "bg-[#10b981] hover:bg-[#059669] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    : "bg-[#FF0080] hover:bg-[#CC0066] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                {activeTab === "buy" ? "BUY" : "SELL"} {token.symbol}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent Trades/Swaps */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h3 className="text-lg text-gray-900 mb-4">Recent Trades</h3>
        <div className="space-y-2">
          {[
            { type: 'buy', amount: '2.5', price: token.price * 0.98, time: '2m ago', size: 'large' },
            { type: 'sell', amount: '1.2', price: token.price * 1.01, time: '5m ago', size: 'medium' },
            { type: 'buy', amount: '5.8', price: token.price * 0.99, time: '8m ago', size: 'large' },
            { type: 'buy', amount: '0.5', price: token.price * 1.00, time: '12m ago', size: 'small' },
            { type: 'sell', amount: '3.1', price: token.price * 1.02, time: '15m ago', size: 'medium' },
          ].map((trade, i) => (
            <div 
              key={i}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg animate-fadeInUp"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  trade.type === 'buy' ? 'bg-[#10b981]' : 'bg-[#FF0080]'
                }`}></div>
                <span className={`text-xs font-bold uppercase ${
                  trade.type === 'buy' ? 'text-[#10b981]' : 'text-[#FF0080]'
                }`}>
                  {trade.type}
                </span>
                <span className="text-xs text-gray-500">{trade.amount} SOL</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-900">
                  ${trade.price.toFixed(4)}
                </div>
                <div className="text-xs text-gray-400">{trade.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Confirm Trade</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Action</span>
                <span className={`font-bold ${activeTab === "buy" ? "text-[#10b981]" : "text-[#FF0080]"}`}>
                  {activeTab.toUpperCase()} {token.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-gray-900">{amount} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Receive</span>
                <span className="font-bold text-gray-900">{estimatedReceive} {token.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Fee</span>
                <span className="font-bold text-gray-900">{amount ? (parseFloat(amount) * 0.008).toFixed(4) : "0"} SOL</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isSwapping}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSwap();
                }}
                disabled={isSwapping}
                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "buy"
                    ? "bg-gradient-to-r from-[#10b981] to-[#059669] text-[#0A0E27]"
                    : "bg-gradient-to-r from-[#FF0080] to-[#CC0066] text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSwapping && (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSwapping ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
