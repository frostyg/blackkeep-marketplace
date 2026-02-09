import { useState, useEffect } from "react";
import ConnectButton from "./ConnectButton";
import TransactionHistory from "./TransactionHistory";

interface TopNavProps {
  wallet: any;
}

export default function TopNav({ wallet }: TopNavProps) {
    const [username, setUsername] = useState(() => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('bk_username');
        return stored && stored.trim() ? stored : '';
      }
      return '';
    });
    const [usernameTouched, setUsernameTouched] = useState(false);
    const [editingUsername, setEditingUsername] = useState(false);
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
    if (!username || !username.trim()) {
      setUsernameTouched(true);
      return;
    }
    localStorage.setItem('bk_username', username.trim());
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
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo and Quick Stats Bar */}
        <div className="flex items-center gap-4">
          <img 
            src="/blackkeep-logo.png" 
            alt="BlackKeep" 
            className="h-10 bg-transparent"
            style={{ background: 'transparent' }}
          />
          
          <div className="hidden xl:flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500 font-semibold">Market Cap:</span>
              <span className="text-xs font-bold text-gray-900">
                ${(marketStats.totalMarketCap / 1000000000).toFixed(2)}B
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500 font-semibold">24h Volume:</span>
              <span className="text-xs font-bold text-gray-900">
                ${(marketStats.volume24h / 1000000000).toFixed(2)}B
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500 font-semibold">24h Change:</span>
              <span className={`text-xs font-bold ${marketStats.change24h >= 0 ? 'text-[#10b981]' : 'text-[#FF0080]'}`}>
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
          {/* Username display and edit */}
          {wallet.connected && (
            editingUsername ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:border-[#10b981] focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (username && username.trim()) {
                      localStorage.setItem('bk_username', username.trim());
                      setEditingUsername(false);
                    }
                  }}
                  className="bg-[#10b981] hover:bg-[#059669] text-white px-3 py-2 rounded-lg font-semibold text-sm transition-all"
                  disabled={!username || !username.trim()}
                >Save</button>
                <button
                  onClick={() => setEditingUsername(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-3 py-2 rounded-lg font-semibold text-sm transition-all"
                >Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{username || 'No Username'}</span>
                <button
                  onClick={() => setEditingUsername(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-2 py-1 rounded-lg font-semibold text-xs transition-all"
                >{username ? 'Edit' : 'Set Username'}</button>
              </div>
            )
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
            onClick={() => setEditingUsername(true)}
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all"
          >
            My Profile
          </button>
          <ConnectButton />

                  {editingUsername && (
                    <div className="fixed inset-0 z-[110] min-h-screen flex items-center justify-center backdrop-blur-xl bg-transparent">
                      <div className="bg-white rounded-2xl shadow-2xl p-8 relative mx-auto flex flex-col items-center justify-center" style={{ width: '100%', maxWidth: 480, minHeight: 'min(90vh, 400px)' }}>
                        <button
                          onClick={() => setEditingUsername(false)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">My Profile</h3>
                        <div className="mb-4 text-center">
                          <div className="text-sm text-gray-500 mb-2">Current Username:</div>
                          <div className="text-lg font-semibold text-gray-900 mb-2">{username || 'No Username Set'}</div>
                        </div>
                        <input
                          type="text"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          placeholder="Change username"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg text-gray-900 focus:border-[#10b981] focus:outline-none mb-4"
                        />
                        <button
                          onClick={() => {
                            if (username && username.trim()) {
                              localStorage.setItem('bk_username', username.trim());
                              setEditingUsername(false);
                            }
                          }}
                          className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 rounded-xl transition-all"
                          disabled={!username || !username.trim()}
                        >Save Username</button>
                      </div>
                    </div>
                  )}
        </div>
      </div>
    </nav>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-2xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8 relative mx-auto my-auto flex flex-col items-center justify-center" style={{ width: '100%', maxWidth: 480, minHeight: 'min(90vh, 400px)' }}>
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
              <div className="flex flex-col items-center w-full">
                <div className="mb-6 w-full flex flex-col items-center">
                  <div className="flex justify-center mb-4 w-full">
                    <img 
                      src="https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I" 
                      alt="BONK" 
                      className="w-20 h-20 rounded-full"
                    />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2 text-center w-full">Pick a Coin</h3>
                  <p className="text-gray-600 text-center w-full">Browse and select from our curated list of tokens</p>
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
              <div className="flex flex-col items-center w-full">
                <div className="mb-6 w-full flex flex-col items-center">
                  <div className="flex justify-center mb-4 w-full">
                    <img 
                      src="/blackkeep-logo.png" 
                      alt="BlackKeep" 
                      className="h-14"
                    />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2 text-center w-full">Check Rugcheck Report</h3>
                  <p className="text-gray-600 text-center w-full">Review safety metrics and risk analysis</p>
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
              <div className="flex flex-col items-center w-full">
                <div className="mb-6 w-full flex flex-col items-center">
                  <div className="text-7xl mb-4 w-full text-center">🤑</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2 text-center w-full">Make a bet and profit</h3>
                  <p className="text-gray-600 mb-6 text-center w-full">Execute trades with confidence and earn returns</p>
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
