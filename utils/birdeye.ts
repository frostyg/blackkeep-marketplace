/**
 * Birdeye API Integration
 * Provides comprehensive Solana token data, trending tokens, OHLCV data
 * Docs: https://docs.birdeye.so/
 * Note: Requires API key for production use
 */

const BIRDEYE_API = "https://public-api.birdeye.so";
const BIRDEYE_API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || "demo"; // Add your API key

export interface BirdeyeToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  volume24hChangePercent: number;
  liquidity: number;
  marketCap: number;
  holder: number;
  supply: number;
  realSupply: number;
  lastTradeUnixTime: number;
}

export interface BirdeyeOHLCV {
  unixTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BirdeyeTrendingToken {
  address: string;
  symbol: string;
  name: string;
  rank: number;
  price: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
}

/**
 * Fetch token overview data
 */
export async function getBirdeyeToken(tokenAddress: string): Promise<BirdeyeToken | null> {
  try {
    const response = await fetch(
      `${BIRDEYE_API}/defi/token_overview?address=${tokenAddress}`,
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error("Birdeye API error:", response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      return null;
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching Birdeye token data:", error);
    return null;
  }
}

/**
 * Fetch price history (OHLCV data)
 */
export async function getBirdeyePriceHistory(
  tokenAddress: string,
  timeframe: "1m" | "5m" | "15m" | "1H" | "4H" | "1D" = "1H",
  timeTo?: number,
  timeFrom?: number
): Promise<BirdeyeOHLCV[]> {
  try {
    const params = new URLSearchParams({
      address: tokenAddress,
      type: timeframe,
    });

    if (timeTo) params.append("time_to", timeTo.toString());
    if (timeFrom) params.append("time_from", timeFrom.toString());

    const response = await fetch(
      `${BIRDEYE_API}/defi/ohlcv?${params.toString()}`,
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error("Birdeye OHLCV error:", response.status);
      return [];
    }

    const data = await response.json();
    return data.data?.items || [];
  } catch (error) {
    console.error("Error fetching Birdeye price history:", error);
    return [];
  }
}

/**
 * Fetch trending tokens on Solana
 */
export async function getBirdeyeTrending(limit: number = 10): Promise<BirdeyeTrendingToken[]> {
  try {
    const response = await fetch(
      `${BIRDEYE_API}/defi/token_trending?limit=${limit}`,
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error("Birdeye trending error:", response.status);
      return [];
    }

    const data = await response.json();
    return data.data?.items || [];
  } catch (error) {
    console.error("Error fetching Birdeye trending:", error);
    return [];
  }
}

/**
 * Fetch token security info
 */
export async function getBirdeyeSecurity(tokenAddress: string): Promise<any> {
  try {
    const response = await fetch(
      `${BIRDEYE_API}/defi/token_security?address=${tokenAddress}`,
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error("Birdeye security error:", response.status);
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching Birdeye security:", error);
    return null;
  }
}

/**
 * Search tokens
 */
export async function searchBirdeyeTokens(query: string, limit: number = 20): Promise<any[]> {
  try {
    const response = await fetch(
      `${BIRDEYE_API}/defi/token_list?keyword=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error("Birdeye search error:", response.status);
      return [];
    }

    const data = await response.json();
    return data.data?.tokens || [];
  } catch (error) {
    console.error("Error searching Birdeye:", error);
    return [];
  }
}
