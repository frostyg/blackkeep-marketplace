/**
 * DexScreener API Integration
 * Provides real-time price, liquidity, and trading data for Solana tokens
 * Docs: https://docs.dexscreener.com/api/reference
 */

const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex";

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
}

export interface DexScreenerToken {
  price: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
  fdv: number;
  buys24h: number;
  sells24h: number;
  txns24h: number;
  pairAddress: string;
  age: number;
}

/**
 * Fetch token data from DexScreener by token address
 */
export async function getDexScreenerToken(tokenAddress: string): Promise<DexScreenerToken | null> {
  try {
    const response = await fetch(`${DEXSCREENER_API}/tokens/${tokenAddress}`);
    
    if (!response.ok) {
      console.error("DexScreener API error:", response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.pairs || data.pairs.length === 0) {
      console.warn("No pairs found for token:", tokenAddress);
      return null;
    }

    // Get the pair with highest liquidity
    const mainPair = data.pairs.reduce((prev: DexScreenerPair, current: DexScreenerPair) => 
      (current.liquidity?.usd || 0) > (prev.liquidity?.usd || 0) ? current : prev
    );

    const age = mainPair.pairCreatedAt 
      ? (Date.now() - mainPair.pairCreatedAt) / (1000 * 60 * 60 * 24) // Days
      : 0;

    return {
      price: parseFloat(mainPair.priceUsd || "0"),
      priceChange24h: mainPair.priceChange?.h24 || 0,
      volume24h: mainPair.volume?.h24 || 0,
      liquidity: mainPair.liquidity?.usd || 0,
      marketCap: mainPair.marketCap || 0,
      fdv: mainPair.fdv || 0,
      buys24h: mainPair.txns?.h24?.buys || 0,
      sells24h: mainPair.txns?.h24?.sells || 0,
      txns24h: (mainPair.txns?.h24?.buys || 0) + (mainPair.txns?.h24?.sells || 0),
      pairAddress: mainPair.pairAddress,
      age,
    };
  } catch (error) {
    console.error("Error fetching DexScreener data:", error);
    return null;
  }
}

/**
 * Search for tokens by query
 */
export async function searchDexScreenerTokens(query: string): Promise<DexScreenerPair[]> {
  try {
    const response = await fetch(`${DEXSCREENER_API}/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      console.error("DexScreener search error:", response.status);
      return [];
    }

    const data = await response.json();
    return data.pairs || [];
  } catch (error) {
    console.error("Error searching DexScreener:", error);
    return [];
  }
}
