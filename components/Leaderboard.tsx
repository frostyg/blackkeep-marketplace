import React, { useEffect, useState } from "react";

interface Caller {
  wallet: string;
  ens?: string;
  accuracy: number;
}

export default function Leaderboard() {
  const [callers, setCallers] = useState<Caller[]>([]);

  useEffect(() => {
    // Fetch leaderboard data from API or mock
    // Replace with real API call
    setCallers([
      { wallet: "0x1234...abcd", ens: "caller1.eth", accuracy: 92.5 },
      { wallet: "0x5678...efgh", ens: "caller2.eth", accuracy: 88.1 },
      { wallet: "0x9abc...ijkl", accuracy: 85.7 },
      { wallet: "0xdef0...mnop", ens: "caller3.eth", accuracy: 84.2 },
      { wallet: "0x1357...qrst", accuracy: 82.9 },
      { wallet: "0x2468...uvwx", accuracy: 81.3 },
      { wallet: "0x3690...yzab", accuracy: 80.5 },
      { wallet: "0x4812...cdef", accuracy: 79.8 },
      { wallet: "0x5923...ghij", accuracy: 78.6 },
      { wallet: "0x6034...klmn", accuracy: 77.2 },
    ]);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-black text-gray-900 mb-4 text-center">Top 10 Callers This Week</h2>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="py-2 px-3 text-xs text-gray-500">Rank</th>
            <th className="py-2 px-3 text-xs text-gray-500">Wallet / ENS</th>
            <th className="py-2 px-3 text-xs text-gray-500">Accuracy %</th>
          </tr>
        </thead>
        <tbody>
          {callers.map((caller, idx) => (
            <tr key={caller.wallet} className="border-b last:border-none">
              <td className="py-2 px-3 font-bold text-gray-900">{idx + 1}</td>
              <td className="py-2 px-3 text-sm text-gray-700">
                {caller.ens ? (
                  <span className="font-semibold text-[#10b981]">{caller.ens}</span>
                ) : (
                  <span className="font-mono">{caller.wallet}</span>
                )}
              </td>
              <td className="py-2 px-3 text-sm font-bold text-gray-900">{caller.accuracy.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
