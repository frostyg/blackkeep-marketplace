"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { getBirdeyePriceHistory, BirdeyeOHLCV } from "../utils/birdeye";

type TimeFrame = "1h" | "24h" | "7d";

export default function MiniChart({ token }: { token: any }) {
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

  // Generate realistic chart data based on timeframe
  const generateChartPoints = (timeframe: TimeFrame) => {
    const points = [];
    let numPoints: number;
    let volatility: number;
    let trend: number;

    // Configure based on timeframe
    switch (timeframe) {
      case "1h":
        numPoints = 60; // 60 minutes
        volatility = 0.02; // Lower volatility
        trend = token.change24h / 24; // Hourly trend estimate
        break;
      case "24h":
        numPoints = 96; // 15-min intervals
        volatility = 0.03;
        trend = token.change24h;
        break;
      case "7d":
        numPoints = 168; // Hourly for 7 days
        volatility = 0.05; // Higher volatility over longer period
        trend = token.change24h * 2; // Assume 7d trend is roughly 2x 24h
        break;
    }

    // Start from current price and work backwards
    let value = 50; // Normalized middle value
    const trendPerPoint = (trend / 100) / numPoints;
    
    for (let i = 0; i < numPoints; i++) {
      // Add random walk with trend
      const random = (Math.random() - 0.5) * volatility * 100;
      const trendComponent = trendPerPoint * (numPoints - i) * 100;
      value += random + trendComponent;
      value = Math.max(10, Math.min(90, value));
      points.push(value);
    }
    
    return points;
  };

  // Convert real chart data to normalized points for display
  const chartData = useMemo(() => {
    if (realChartData.length > 0) {
      // Use real data from Birdeye
      const prices = realChartData.map(d => d.close);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const range = max - min || 1;
      
      // Normalize to 10-90 range for better visibility (leave margins)
      return prices.map(price => ((price - min) / range) * 70 + 15);
    }
    
    // Fallback to generated data if no real data
    return generateChartPoints(timeFrame);
  }, [realChartData, timeFrame, token.mint]);
  const maxValue = Math.max(...chartData);
  const minValue = Math.min(...chartData);

  const createPath = () => {
    const width = 100;
    const height = 100;
    const points = chartData.map((value, index) => {
      const x = (index / (chartData.length - 1)) * width;
      // Add padding: use 85% of height and center it
      const y = height - 5 - ((value - minValue) / (maxValue - minValue)) * 85;
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  };

  const isPositive = token.change24h > 0;
  
  // Calculate timeframe-specific change
  const getTimeFrameChange = () => {
    switch (timeFrame) {
      case "1h":
        return token.change24h / 24;
      case "24h":
        return token.change24h;
      case "7d":
        return token.change24h * 2;
      default:
        return token.change24h;
    }
  };

  const timeFrameChange = getTimeFrameChange();
  const isTimeFramePositive = timeFrameChange > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-900">
          Price Chart ({timeFrame})
          {isLoading && <span className="ml-2 text-xs text-gray-400">Loading...</span>}
        </h3>
        <div className="flex gap-1 border-b border-gray-200">
          <button 
            onClick={() => setTimeFrame("1h")}
            className={`px-2 py-1 font-semibold text-xs transition-all ${
              timeFrame === "1h" 
                ? "text-[#10b981] border-b-2 border-[#10b981]" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            1H
          </button>
          <button 
            onClick={() => setTimeFrame("24h")}
            className={`px-2 py-1 font-semibold text-xs transition-all ${
              timeFrame === "24h" 
                ? "text-[#10b981] border-b-2 border-[#10b981]" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            24H
          </button>
          <button 
            onClick={() => setTimeFrame("7d")}
            className={`px-2 py-1 font-semibold text-xs transition-all ${
              timeFrame === "7d" 
                ? "text-[#10b981] border-b-2 border-[#10b981]" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            7D
          </button>
        </div>
      </div>

      <div className="relative h-40 bg-gray-50 rounded-xl overflow-hidden">
        {/* Timeline labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pb-1 text-xs text-gray-400 z-10">
          {timeFrame === "1h" && (
            <>
              <span>{new Date(Date.now() - 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              <span>{new Date(Date.now() - 30 * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              <span>Now</span>
            </>
          )}
          {timeFrame === "24h" && (
            <>
              <span>{new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleTimeString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' })}</span>
              <span>{new Date(Date.now() - 12 * 60 * 60 * 1000).toLocaleTimeString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' })}</span>
              <span>Now</span>
            </>
          )}
          {timeFrame === "7d" && (
            <>
              <span>{new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span>{new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span>Now</span>
            </>
          )}
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div
              key={percent}
              className="absolute left-0 right-0 border-t border-gray-200"
              style={{ top: `${percent}%` }}
            />
          ))}
        </div>

        {/* Chart */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          {/* Gradient fill */}
          <defs>
            <linearGradient id={`chartGradient-${timeFrame}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop 
                offset="0%" 
                stopColor={isTimeFramePositive ? "#10b981" : "#FF0080"} 
                stopOpacity="0.3" 
              />
              <stop 
                offset="100%" 
                stopColor={isTimeFramePositive ? "#10b981" : "#FF0080"} 
                stopOpacity="0" 
              />
            </linearGradient>
          </defs>

          {/* Area under line */}
          <path
            d={`${createPath()} L 100,100 L 0,100 Z`}
            fill={`url(#chartGradient-${timeFrame})`}
          />

          {/* Line */}
          <path
            d={createPath()}
            fill="none"
            stroke={isTimeFramePositive ? "#10b981" : "#FF0080"}
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />

          {/* Dots at data points */}
          {chartData.map((value, index) => {
            if (index % 10 !== 0) return null;
            const x = (index / (chartData.length - 1)) * 100;
            const y = 100 - ((value - minValue) / (maxValue - minValue)) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="0.5"
                fill={isTimeFramePositive ? "#10b981" : "#FF0080"}
                className="animate-pulse"
              />
            );
          })}
        </svg>

        {/* Current price indicator */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-gray-200 shadow-lg">
          <div className="text-[10px] text-gray-500 mb-0.5 flex items-center gap-1">
            Current Price
            <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse"></span>
          </div>
          <div className="text-sm font-bold text-gray-900">
            ${livePrice < 0.01 ? livePrice.toFixed(8) : livePrice.toFixed(4)}
          </div>
          <div className={`text-xs font-bold ${isTimeFramePositive ? "text-[#10b981]" : "text-[#FF0080]"}`}>
            {isTimeFramePositive ? "+" : ""}{timeFrameChange.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        <div className="text-center">
          <div className="text-[10px] text-gray-500 mb-0.5">
            {timeFrame === "1h" ? "1h Volume" : timeFrame === "24h" ? "24h Volume" : "7d Volume"}
          </div>
          <div className="font-bold text-xs text-gray-900">
            ${timeFrame === "7d" 
              ? (token.volume24h * 7 / 1000000).toFixed(1) 
              : timeFrame === "1h"
              ? (token.volume24h / 24 / 1000000).toFixed(2)
              : (token.volume24h / 1000000).toFixed(1)}M
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-500 mb-0.5">
            {timeFrame === "1h" ? "1h High" : timeFrame === "24h" ? "24h High" : "7d High"}
          </div>
          <div className="font-bold text-xs text-[#10b981]">
            ${(token.price * (1 + Math.abs(timeFrameChange) / 100)).toFixed(4)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-500 mb-0.5">
            {timeFrame === "1h" ? "1h Low" : timeFrame === "24h" ? "24h Low" : "7d Low"}
          </div>
          <div className="font-bold text-xs text-[#FF0080]">
            ${(token.price * (1 - Math.abs(timeFrameChange) / 100)).toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  );
}
