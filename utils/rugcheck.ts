import axios from 'axios';

const RUGCHECK_API_BASE = 'https://api.rugcheck.xyz/v1';

export interface RugCheckReport {
  mint: string;
  score: number;
  risks: RiskItem[];
  tokenMeta: {
    name: string;
    symbol: string;
    decimals: number;
  };
  markets: Market[];
  topHolders: Holder[];
  fileMeta: {
    error?: string;
  };
}

export interface RiskItem {
  name: string;
  description: string;
  level: 'danger' | 'warn' | 'info';
  score: number;
}

export interface Market {
  pubkey: string;
  lpBurn: number;
  lpLockedPct: number;
  liquidity: {
    quote: number;
    usd: number;
  };
}

export interface Holder {
  address: string;
  pct: number;
  owner?: string;
}

export interface SafetyMetrics {
  score: number;
  liquidity: number;
  liquidityLocked: number;
  topHoldersPct: number;
  holders: number;
  risks: RiskItem[];
  freezeable: boolean;
  mintable: boolean;
  isError: boolean;
  errorMessage?: string;
}

/**
 * Fetch RugCheck report for a token
 */
export async function getRugCheckReport(mintAddress: string): Promise<SafetyMetrics> {
  try {
    const response = await axios.get<RugCheckReport>(
      `${RUGCHECK_API_BASE}/tokens/${mintAddress}/report`
    );

    const data = response.data;

    // Check for API errors
    if (data.fileMeta?.error) {
      return {
        score: 0,
        liquidity: 0,
        liquidityLocked: 0,
        topHoldersPct: 0,
        holders: 0,
        risks: [],
        freezeable: false,
        mintable: false,
        isError: true,
        errorMessage: data.fileMeta.error,
      };
    }

    // Calculate total liquidity
    const totalLiquidity = data.markets.reduce(
      (sum, market) => sum + (market.liquidity?.usd || 0),
      0
    );

    // Calculate average LP locked percentage
    const avgLpLocked = data.markets.length > 0
      ? data.markets.reduce((sum, market) => sum + (market.lpLockedPct || 0), 0) / data.markets.length
      : 0;

    // Calculate top holders percentage
    const topHoldersPct = data.topHolders
      .slice(0, 10)
      .reduce((sum, holder) => sum + holder.pct, 0);

    // Extract critical risks
    const criticalRisks = data.risks.filter(
      risk => risk.level === 'danger' || risk.level === 'warn'
    );

    // Check for freezeable and mintable flags
    const freezeable = data.risks.some(
      risk => risk.name.toLowerCase().includes('freeze')
    );
    const mintable = data.risks.some(
      risk => risk.name.toLowerCase().includes('mint')
    );

    return {
      score: data.score || 0,
      liquidity: totalLiquidity,
      liquidityLocked: avgLpLocked,
      topHoldersPct,
      holders: data.topHolders.length,
      risks: criticalRisks,
      freezeable,
      mintable,
      isError: false,
    };
  } catch (error: any) {
    console.error('Error fetching RugCheck report:', error);
    return {
      score: 0,
      liquidity: 0,
      liquidityLocked: 0,
      topHoldersPct: 0,
      holders: 0,
      risks: [],
      freezeable: false,
      mintable: false,
      isError: true,
      errorMessage: error.response?.data?.message || 'Failed to fetch safety data',
    };
  }
}

/**
 * Get a human-readable safety rating
 */
export function getSafetyRating(score: number): {
  label: string;
  color: string;
  status: 'good' | 'warning' | 'danger';
} {
  if (score >= 8000) {
    return { label: 'Excellent', color: '#10b981', status: 'good' };
  } else if (score >= 6000) {
    return { label: 'Good', color: '#10b981', status: 'good' };
  } else if (score >= 4000) {
    return { label: 'Fair', color: '#FFB800', status: 'warning' };
  } else if (score >= 2000) {
    return { label: 'Poor', color: '#FF8800', status: 'warning' };
  } else {
    return { label: 'Dangerous', color: '#FF0080', status: 'danger' };
  }
}
