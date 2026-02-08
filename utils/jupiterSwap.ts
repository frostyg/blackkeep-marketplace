import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { createJupiterApiClient } from '@jup-ag/api';

const jupiterQuoteApi = createJupiterApiClient();

// Platform fee configuration
export const FEE_WALLET = process.env.NEXT_PUBLIC_FEE_WALLET || "";
export const PLATFORM_FEE_BPS = 80; // 0.8% platform fee

export interface SwapParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps: number;
  userPublicKey: string;
}

export interface SwapQuote {
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  routePlan: any[];
  otherAmountThreshold: string;
}

/**
 * Get a quote for a swap from Jupiter
 */
export async function getSwapQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50 // 0.5% slippage
): Promise<SwapQuote | null> {
  try {
    // Convert amount to lamports (assuming SOL input with 9 decimals)
    const amountInLamports = Math.floor(amount * Math.pow(10, 9));

    const quote = await jupiterQuoteApi.quoteGet({
      inputMint,
      outputMint,
      amount: amountInLamports,
      slippageBps,
      onlyDirectRoutes: false,
      asLegacyTransaction: false,
    });

    if (!quote) {
      throw new Error('No quote found');
    }

    return {
      inAmount: quote.inAmount,
      outAmount: quote.outAmount,
      priceImpactPct: parseFloat(quote.priceImpactPct),
      routePlan: quote.routePlan,
      otherAmountThreshold: quote.otherAmountThreshold,
    };
  } catch (error) {
    console.error('Error getting Jupiter quote:', error);
    return null;
  }
}

/**
 * Execute a swap using Jupiter
 */
export async function executeSwap(
  connection: Connection,
  wallet: any,
  quote: any
): Promise<string | null> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    // Get swap transaction
    const swapResult = await jupiterQuoteApi.swapPost({
      swapRequest: {
        quoteResponse: quote,
        userPublicKey: wallet.publicKey.toBase58(),
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
        // Platform fee collection (0.8% of swap volume)
        feeAccount: FEE_WALLET,
        platformFeeBps: PLATFORM_FEE_BPS,
      },
    });

    // Deserialize the transaction
    const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // Sign the transaction
    const signedTransaction = await wallet.signTransaction(transaction);

    // Send the transaction
    const rawTransaction = signedTransaction.serialize();
    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 2,
    });

    // Confirm the transaction
    await connection.confirmTransaction(txid, 'confirmed');

    return txid;
  } catch (error) {
    console.error('Error executing swap:', error);
    return null;
  }
}

/**
 * Get the native SOL mint address
 */
export const SOL_MINT = 'So11111111111111111111111111111111111111112';

/**
 * Format token amount from lamports
 */
export function formatTokenAmount(amount: string, decimals: number): string {
  const value = parseFloat(amount) / Math.pow(10, decimals);
  return value.toFixed(decimals);
}
