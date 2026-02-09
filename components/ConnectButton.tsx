"use client";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

interface ConnectButtonProps {
  className?: string;
}

export default function ConnectButton({ className }: ConnectButtonProps) {
  const { setVisible } = useWalletModal();
  const { wallet, disconnect, connecting, connected } = useWallet();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    if (connected) {
      setShowConfirm(true);
    } else {
      setVisible(true);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={connecting}
        className={`
          px-6 py-3 rounded-xl font-bold transition-all
          ${connected 
            ? "bg-gray-100 hover:bg-gray-200 text-gray-900" 
            : "bg-[#10b981] hover:bg-[#059669] text-white"
          }
          ${connecting ? "opacity-50 cursor-not-allowed" : ""}
          ${className || ""}
        `}
      >
        {connecting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Connecting...
          </span>
        ) : connected ? (
          "Disconnect"
        ) : (
          "Connect Wallet"
        )}
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex min-h-screen items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Disconnect Wallet?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to disconnect your wallet? You'll need to reconnect to make trades.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                className="flex-1 px-4 py-3 bg-[#FF0080] hover:bg-[#CC0066] text-white rounded-xl font-bold transition-all"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
