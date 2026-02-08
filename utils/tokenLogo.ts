/**
 * Token Logo Utility
 * Fetches token logos from multiple sources with fallbacks
 */

const CACHE: Map<string, string> = new Map();

/**
 * Get token logo URL with multiple fallback sources
 */
export async function getTokenLogo(
  mintAddress: string,
  symbol?: string
): Promise<string> {
  // Check cache first
  if (CACHE.has(mintAddress)) {
    return CACHE.get(mintAddress)!;
  }

  // Try multiple sources in order of preference
  const sources = [
    // 1. Jupiter Token List (most reliable)
    async () => {
      try {
        const response = await fetch(`https://token.jup.ag/strict`);
        if (!response.ok) return null;
        const tokens = await response.json();
        const token = tokens.find((t: any) => t.address === mintAddress);
        return token?.logoURI || null;
      } catch {
        return null;
      }
    },

    // 2. DexScreener API
    async () => {
      try {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`
        );
        if (!response.ok) return null;
        const data = await response.json();
        // DexScreener includes token info in pairs
        if (data.pairs && data.pairs.length > 0) {
          return data.pairs[0].info?.imageUrl || null;
        }
        return null;
      } catch {
        return null;
      }
    },

    // 3. Solana Token List (GitHub)
    async () => {
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${mintAddress}/logo.png`
        );
        if (response.ok) {
          return `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${mintAddress}/logo.png`;
        }
        return null;
      } catch {
        return null;
      }
    },

    // 4. CDN fallback (some popular tokens)
    async () => {
      try {
        const response = await fetch(
          `https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/assets/mainnet/${mintAddress}/logo.png`
        );
        if (response.ok) {
          return `https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/assets/mainnet/${mintAddress}/logo.png`;
        }
        return null;
      } catch {
        return null;
      }
    },
  ];

  // Try each source until one works
  for (const source of sources) {
    try {
      const logo = await source();
      if (logo) {
        CACHE.set(mintAddress, logo);
        return logo;
      }
    } catch (error) {
      // Continue to next source
      continue;
    }
  }

  // Return empty string if no logo found (will trigger fallback in component)
  return '';
}

/**
 * Preload logos for multiple tokens
 */
export async function preloadTokenLogos(
  tokens: Array<{ mint: string; symbol?: string }>
): Promise<Map<string, string>> {
  const logos = new Map<string, string>();
  
  // Fetch all logos in parallel
  await Promise.all(
    tokens.map(async (token) => {
      const logo = await getTokenLogo(token.mint, token.symbol);
      if (logo) {
        logos.set(token.mint, logo);
      }
    })
  );

  return logos;
}

/**
 * Get logo from Jupiter's strict token list (cached version)
 */
let jupiterTokensCache: any[] | null = null;
let jupiterCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getJupiterTokenLogo(mintAddress: string): Promise<string | null> {
  try {
    // Refresh cache if expired
    const now = Date.now();
    if (!jupiterTokensCache || now - jupiterCacheTime > CACHE_DURATION) {
      const response = await fetch('https://token.jup.ag/strict');
      if (!response.ok) return null;
      jupiterTokensCache = await response.json();
      jupiterCacheTime = now;
    }

    // Find token in cache
    const token = jupiterTokensCache?.find((t: any) => t.address === mintAddress);
    return token?.logoURI || null;
  } catch (error) {
    console.error('Error fetching Jupiter token logo:', error);
    return null;
  }
}
