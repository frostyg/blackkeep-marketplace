import { useState, useEffect } from "react";
import ConnectButton from "./ConnectButton";
import TransactionHistory from "./TransactionHistory";

interface TopNavProps {
  wallet: any;
}

export default function TopNav({ wallet }: TopNavProps) {
  const [showModal, setShowModal] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [marketStats, setMarketStats] = useState({
    totalMarketCap: 67400000000,
    volume24h: 2840000000,
    change24h: 5.3
  });

  useEffect(() => {
    // Simulate real-time market stats updates
    const interval = setInterval(() => {
      setMarketStats(prev => ({
        totalMarketCap: prev.totalMarketCap * (1 + (Math.random() - 0.5) * 0.001),
        volume24h: prev.volume24h * (1 + (Math.random() - 0.5) * 0.002),
        change24h: prev.change24h + (Math.random() - 0.5) * 0.1
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    setShowModal(false);
    setCurrentStep(1);
    // Trigger wallet connection
    const connectButton = document.querySelector('button[class*="Connect"]') as HTMLButtonElement;
    if (connectButton && !wallet.connected) {
      connectButton.click();
    }
  };

  return (
    <>
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl shadow-md">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo and Quick Stats Bar */}
        <div className="flex items-center gap-8">
          <img 
            src="/blackkeep-logo.png" 
            alt="BlackKeep" 
            className="h-14 bg-transparent"
            style={{ background: 'transparent' }}
          />
          
          <div className="hidden xl:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold">Market Cap:</span>
              <span className="text-sm font-bold text-gray-900">
                ${(marketStats.totalMarketCap / 1000000000).toFixed(2)}B
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold">24h Volume:</span>
              <span className="text-sm font-bold text-gray-900">
                ${(marketStats.volume24h / 1000000000).toFixed(2)}B
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold">24h Change:</span>
              <span className={`text-sm font-bold ${marketStats.change24h >= 0 ? 'text-[#10b981]' : 'text-[#FF0080]'}`}>
                {marketStats.change24h >= 0 ? '+' : ''}{marketStats.change24h.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          {wallet.connected && wallet.publicKey && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-300 shadow-lg">
              <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></div>
              <span className="text-sm font-mono text-gray-700">
                {wallet.publicKey.toString().slice(0, 4)}...
                {wallet.publicKey.toString().slice(-4)}
              </span>
            </div>
          )}
          <button 
            onClick={() => setShowModal(true)}
            className="text-sm font-semibold text-[#10b981] hover:text-[#059669] transition-all flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How it works
          </button>
          <button className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all">
            Liquidity
          </button>
          <button 
            onClick={() => setShowTransactions(true)}
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all"
          >
            Portfolio
          </button>
          <ConnectButton />
        </div>
      </div>
    </nav>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowModal(false);
                setCurrentStep(1);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    <img 
                      src="https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I" 
                      alt="BONK" 
                      className="w-20 h-20 rounded-full"
                    />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Pick a Coin</h3>
                  <p className="text-gray-600">Browse and select from our curated list of tokens</p>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg"
                >
                  Next
                </button>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    <img 
                      src="/blackkeep-logo.png" 
                      alt="BlackKeep" 
                      className="h-14"
                    />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Check Rugcheck Report</h3>
                  <p className="text-gray-600">Review safety metrics and risk analysis</p>
                </div>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg"
                >
                  Next
                </button>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="text-7xl mb-4">🤑</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Make a bet and profit</h3>
                  <p className="text-gray-600">Execute trades with confidence and earn returns</p>
                </div>
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    step === currentStep ? 'bg-[#10b981]' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
