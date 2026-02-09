"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { getBirdeyePriceHistory, BirdeyeOHLCV } from "../utils/birdeye";

type TimeFrame = "1h" | "24h" | "7d";

export default function MiniChart2({ token }: { token: any }) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1h");
  const [realChartData, setRealChartData] = useState<BirdeyeOHLCV[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [livePrice, setLivePrice] = useState(token?.price || 0);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Fetch real chart data from Birdeye
  useEffect(() => {
    const fetchChartData = async () => {
      if (!token?.mint) return;
      setIsLoading(true);
      try {
        const timeframeMap = {
          "1h": "5m" as const,
          "24h": "15m" as const,
          "7d": "1H" as const,
        };
        const data = await getBirdeyePriceHistory(
          token.mint,
          timeframeMap[timeFrame]
        );
        setRealChartData(data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChartData();
  }, [token?.mint, timeFrame]);

  // Update live price when token price changes
  useEffect(() => {
    if (token?.price) {
      setLivePrice(token.price);
    }
  }, [token?.price]);

  // Simulate live price updates for demo (small fluctuations)
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice((prev: number) => {
        // Small random fluctuation around current token price
        const fluctuation = (Math.random() - 0.5) * 0.002; // ±0.2%
        const newPrice = token?.price * (1 + fluctuation);
        return newPrice;
      });
    }, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, [token?.price]);

  // ...existing code...
}
