"use client";

import { useState, useEffect } from "react";
import SafetyBadge from "./SafetyBadge";
import { getRugCheckReport } from "../utils/rugcheck";
import { getDexScreenerToken } from "../utils/dexscreener";
import { analytics } from "../utils/analytics";
import { getJupiterTokenLogo } from "../utils/tokenLogo";
import { getTokenLogoUrl } from "../utils/tokenLogosMap";

interface TokenScannerProps {
  selectedToken: any;
  onSelectToken: (token: any) => void;
}

// Real Solana token data with verified mint addresses
const MOCK_TOKENS = [
  {
    symbol: "SOL",
    name: "Solana",
    mint: "So11111111111111111111111111111111111111112",
    logoURI: getTokenLogoUrl("So11111111111111111111111111111111111111112"),
    decimals: 9,
    price: 142.56,
    change24h: 5.3,
    volume24h: 2840000000,
    marketCap: 67400000000,
    safetyScore: 9.5,
    liquidity: 156000000,
    holders: 1847293,
    age: 1456,
  },
  {
    symbol: "BONK",
    name: "Bonk",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    logoURI: getTokenLogoUrl("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"),
    decimals: 5,
    price: 0.00001234,
    change24h: 12.3,
    volume24h: 45000000,
    marketCap: 187000000,
    safetyScore: 7.8,
    liquidity: 2400000,
    holders: 12847,
    age: 287,
  },
  {
    symbol: "WIF",
    name: "dogwifhat",
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    logoURI: getTokenLogoUrl("EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm"),
    decimals: 6,
    price: 1.87,
    change24h: 45.2,
    volume24h: 128000000,
    marketCap: 2400000000,
    safetyScore: 6.2,
    liquidity: 8200000,
    holders: 45213,
    age: 156,
  },
  {
    symbol: "PONKE",
    name: "Ponke",
    mint: "5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC",
    logoURI: getTokenLogoUrl("5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC", "https://bafkreidvkvd3ortk4bryfi55pko6qbe7weng7t53cyber26t2z5c2amzk5u.ipfs.nftstorage.link"),
    decimals: 9,
    price: 0.42,
    change24h: 340.8,
    volume24h: 23000000,
    marketCap: 87000000,
    safetyScore: 4.5,
    liquidity: 1200000,
    holders: 8934,
    age: 45,
  },
  {
    symbol: "POPCAT",
    name: "Popcat",
    mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
    logoURI: getTokenLogoUrl("7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", "https://bafkreidqcipmf6yusnpwaod6mweoszi4zs43cvjko4vfwowmwnxo6tpwkq.ipfs.nftstorage.link"),
    decimals: 9,
    price: 0.56,
    change24h: -8.4,
    volume24h: 67000000,
    marketCap: 340000000,
    safetyScore: 8.1,
    liquidity: 4500000,
    holders: 23456,
    age: 198,
  },
  {
    symbol: "MYRO",
    name: "Myro",
    mint: "HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4",
    logoURI: getTokenLogoUrl("HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4", "https://bafkreidmz6wqyskkcs6hzfakeajvpm5p4qqj6f3arz5mf4a25t6d26eohm.ipfs.nftstorage.link"),
    decimals: 9,
    price: 0.089,
    change24h: 5.7,
    volume24h: 12000000,
    marketCap: 89000000,
    safetyScore: 5.3,
    liquidity: 890000,
    holders: 5678,
    age: 234,
  },
  {
    symbol: "BOME",
    name: "Book of Meme",
    mint: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82",
    logoURI: getTokenLogoUrl("ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82"),
    decimals: 6,
    price: 0.012,
    change24h: -5.2,
    volume24h: 34000000,
    marketCap: 234000000,
    safetyScore: 6.8,
    liquidity: 3200000,
    holders: 15678,
    age: 89,
  },
  {
    symbol: "SAMO",
    name: "Samoyedcoin",
    mint: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    logoURI: getTokenLogoUrl("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"),
    decimals: 9,
    price: 0.0078,
    change24h: 7.8,
    volume24h: 8900000,
    marketCap: 45000000,
    safetyScore: 8.9,
    liquidity: 1800000,
    holders: 34567,
    age: 567,
  },
  {
    symbol: "SLERF",
    name: "Slerf",
    mint: "7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3",
    logoURI: getTokenLogoUrl("7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3", "https://bafkreibtprwpwk3lry3trm2uexn32jjm6upj6exxp73iteofsl6e4qrzpu.ipfs.nftstorage.link"),
    decimals: 9,
    price: 0.145,
    change24h: 125.4,
    volume24h: 56000000,
    marketCap: 145000000,
    safetyScore: 3.2,
    liquidity: 4200000,
    holders: 8934,
    age: 12,
  },
  {
    symbol: "WEN",
    name: "Wen",
    mint: "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk",
    logoURI: getTokenLogoUrl("WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk"),
    decimals: 5,
    price: 0.00006,
    change24h: 15.3,
    volume24h: 12000000,
    marketCap: 67000000,
    safetyScore: 7.4,
    liquidity: 2100000,
    holders: 23456,
    age: 67,
  },
  {
    symbol: "MICHI",
    name: "Michicoin",
    mint: "5mbK36SZ7J19An8jFochhQS4of8g6BwUjbeCSxBSoWdp",
    logoURI: getTokenLogoUrl("5mbK36SZ7J19An8jFochhQS4of8g6BwUjbeCSxBSoWdp", "https://bafkreigjvbuhw5y7dd2w4lsupg7nkxgvnbqy3ggmzlx66fzbvf4qwjjygy.ipfs.nftstorage.link"),
    decimals: 9,
    price: 0.028,
    change24h: 45.7,
    volume24h: 23000000,
    marketCap: 89000000,
    safetyScore: 2.8,
    liquidity: 2800000,
    holders: 12345,
    age: 34,
  },
  {
    symbol: "MEW",
    name: "Cat in a Dogs World",
    mint: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
    logoURI: getTokenLogoUrl("MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5", "https://bafkreidqk5hvlm5h6gfliojh42xgxqqk57y6ziqzchwqela6xz66b2q4xa.ipfs.nftstorage.link"),
    decimals: 5,
    change24h: 23.9,
    price: 0.0034,
    volume24h: 45000000,
    marketCap: 178000000,
    safetyScore: 5.7,
    liquidity: 3900000,
    holders: 34567,
    age: 45,
  },
  {
    symbol: "JUP",
    name: "Jupiter",
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    logoURI: getTokenLogoUrl("JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"),
    decimals: 6,
    price: 0.95,
    change24h: 8.2,
    volume24h: 125000000,
    marketCap: 1250000000,
    safetyScore: 9.2,
    liquidity: 15000000,
    holders: 125000,
    age: 420,
  },
  {
    symbol: "PYTH",
    name: "Pyth Network",
    mint: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
    logoURI: getTokenLogoUrl("HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3"),
    decimals: 6,
    price: 0.42,
    change24h: 3.5,
    volume24h: 45000000,
    marketCap: 850000000,
    safetyScore: 9.1,
    liquidity: 8500000,
    holders: 78000,
    age: 550,
  },
  {
    symbol: "JTO",
    name: "Jito",
    mint: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
    logoURI: getTokenLogoUrl("jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL"),
    decimals: 9,
    price: 2.85,
    change24h: 12.4,
    volume24h: 89000000,
    marketCap: 425000000,
    safetyScore: 8.8,
    liquidity: 6200000,
    holders: 45000,
    age: 180,
  },
  {
    symbol: "RNDR",
    name: "Render",
    mint: "rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof",
    logoURI: getTokenLogoUrl("rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof"),
    decimals: 8,
    price: 7.25,
    change24h: -2.1,
    volume24h: 156000000,
    marketCap: 2800000000,
    safetyScore: 8.9,
    liquidity: 18000000,
    holders: 95000,
    age: 890,
  },
  {
    symbol: "RAY",
    name: "Raydium",
    mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    logoURI: getTokenLogoUrl("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"),
    decimals: 6,
    price: 2.45,
    change24h: 5.8,
    volume24h: 67000000,
    marketCap: 650000000,
    safetyScore: 9.0,
    liquidity: 12000000,
    holders: 67000,
    age: 1100,
  },
  {
    symbol: "ORCA",
    name: "Orca",
    mint: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
    logoURI: getTokenLogoUrl("orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE"),
    decimals: 6,
    price: 3.20,
    change24h: 4.2,
    volume24h: 34000000,
    marketCap: 425000000,
    safetyScore: 8.7,
    liquidity: 7800000,
    holders: 52000,
    age: 980,
  },
  {
    symbol: "MOBILE",
    name: "Helium Mobile",
    mint: "mb1eu7TzEc71KxDpsmsKoucSSuuoGLv1drys1oP2jh6",
    logoURI: getTokenLogoUrl("mb1eu7TzEc71KxDpsmsKoucSSuuoGLv1drys1oP2jh6"),
    decimals: 6,
    price: 0.0015,
    change24h: 8.9,
    volume24h: 12000000,
    marketCap: 245000000,
    safetyScore: 8.5,
    liquidity: 3200000,
    holders: 38000,
    age: 310,
  },
  {
    symbol: "HNT",
    name: "Helium",
    mint: "hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux",
    logoURI: getTokenLogoUrl("hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux"),
    decimals: 8,
    price: 5.67,
    change24h: 6.3,
    volume24h: 45000000,
    marketCap: 980000000,
    safetyScore: 8.8,
    liquidity: 9800000,
    holders: 67000,
    age: 890,
  },
  {
    symbol: "DRIFT",
    name: "Drift Protocol",
    mint: "DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7",
    logoURI: getTokenLogoUrl("DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7"),
    decimals: 6,
    price: 0.68,
    change24h: 15.2,
    volume24h: 23000000,
    marketCap: 178000000,
    safetyScore: 7.9,
    liquidity: 4200000,
    holders: 28000,
    age: 210,
  },
  {
    symbol: "KMNO",
    name: "Kamino",
    mint: "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS",
    logoURI: getTokenLogoUrl("KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS"),
    decimals: 6,
    price: 0.045,
    change24h: 3.8,
    volume24h: 8900000,
    marketCap: 95000000,
    safetyScore: 8.2,
    liquidity: 2100000,
    holders: 19000,
    age: 280,
  },
  {
    symbol: "W",
    name: "Wormhole",
    mint: "85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ",
    logoURI: getTokenLogoUrl("85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ"),
    decimals: 6,
    price: 0.35,
    change24h: -1.5,
    volume24h: 67000000,
    marketCap: 1200000000,
    safetyScore: 9.0,
    liquidity: 14000000,
    holders: 89000,
    age: 245,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    logoURI: getTokenLogoUrl("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    decimals: 6,
    price: 1.00,
    change24h: 0.01,
    volume24h: 890000000,
    marketCap: 42000000000,
    safetyScore: 10.0,
    liquidity: 125000000,
    holders: 450000,
    age: 1200,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    logoURI: getTokenLogoUrl("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),
    decimals: 6,
    price: 1.00,
    change24h: 0.00,
    volume24h: 1200000000,
    marketCap: 118000000000,
    safetyScore: 10.0,
    liquidity: 145000000,
    holders: 520000,
    age: 980,
  },
  {
    symbol: "MNDE",
    name: "Marinade",
    mint: "MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey",
    logoURI: getTokenLogoUrl("MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey"),
    decimals: 9,
    price: 0.12,
    change24h: 2.4,
    volume24h: 3400000,
    marketCap: 45000000,
    safetyScore: 8.4,
    liquidity: 1200000,
    holders: 23000,
    age: 890,
  },
  {
    symbol: "TNSR",
    name: "Tensor",
    mint: "TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6",
    logoURI: getTokenLogoUrl("TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6"),
    decimals: 9,
    price: 0.52,
    change24h: 18.7,
    volume24h: 28000000,
    marketCap: 195000000,
    safetyScore: 7.8,
    liquidity: 4500000,
    holders: 34000,
    age: 156,
  },
  {
    symbol: "FIDA",
    name: "Bonfida",
    mint: "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp",
    logoURI: getTokenLogoUrl("EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp"),
    decimals: 6,
    price: 0.28,
    change24h: -3.2,
    volume24h: 5600000,
    marketCap: 38000000,
    safetyScore: 8.1,
    liquidity: 980000,
    holders: 18000,
    age: 1050,
  },
  {
    symbol: "FORGE",
    name: "Blocksmith Labs",
    mint: "FoRGERiW7odcCBGU1bztZi16osPBHjxharvDathL5eds",
    logoURI: getTokenLogoUrl("FoRGERiW7odcCBGU1bztZi16osPBHjxharvDathL5eds"),
    decimals: 9,
    price: 0.0089,
    change24h: 5.6,
    volume24h: 2300000,
    marketCap: 12000000,
    safetyScore: 6.5,
    liquidity: 450000,
    holders: 8900,
    age: 145,
  },
  {
    symbol: "SILLY",
    name: "Silly Dragon",
    mint: "7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs",
    logoURI: getTokenLogoUrl("7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs"),
    decimals: 9,
    price: 0.0125,
    change24h: 28.4,
    volume24h: 8900000,
    marketCap: 42000000,
    safetyScore: 5.2,
    liquidity: 1200000,
    holders: 15000,
    age: 78,
  },
  {
    symbol: "ZEUS",
    name: "Zeus Network",
    mint: "ZEUS1aR7aX8DFFJf5QjWj2ftDDdNTroMNGo8YoQm3Gq",
    logoURI: getTokenLogoUrl("ZEUS1aR7aX8DFFJf5QjWj2ftDDdNTroMNGo8YoQm3Gq"),
    decimals: 6,
    price: 0.38,
    change24h: 11.2,
    volume24h: 15000000,
    marketCap: 89000000,
    safetyScore: 7.6,
    liquidity: 2800000,
    holders: 28000,
    age: 198,
  },


  {
    symbol: "COPE",
    name: "Cope",
    mint: "8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh",
    logoURI: getTokenLogoUrl("8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh"),
    decimals: 6,
    price: 0.045,
    change24h: -2.1,
    volume24h: 890000,
    marketCap: 12000000,
    safetyScore: 7.2,
    liquidity: 340000,
    holders: 7800,
    age: 980,
  },
  {
    symbol: "STEP",
    name: "Step Finance",
    mint: "StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT",
    logoURI: getTokenLogoUrl("StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT"),
    decimals: 9,
    price: 0.038,
    change24h: 4.5,
    volume24h: 1200000,
    marketCap: 15000000,
    safetyScore: 7.8,
    liquidity: 450000,
    holders: 12000,
    age: 890,
  },
  {
    symbol: "SLND",
    name: "Solend",
    mint: "SLNDpmoWTVADgEdndyvWzroNL7zSi1dF9PC3xHGtPwp",
    logoURI: getTokenLogoUrl("SLNDpmoWTVADgEdndyvWzroNL7zSi1dF9PC3xHGtPwp"),
    decimals: 6,
    price: 1.24,
    change24h: 6.8,
    volume24h: 4500000,
    marketCap: 58000000,
    safetyScore: 8.3,
    liquidity: 1800000,
    holders: 24000,
    age: 890,
  },
  {
    symbol: "SHDW",
    name: "GenesysGo Shadow",
    mint: "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y",
    logoURI: getTokenLogoUrl("SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y"),
    decimals: 9,
    price: 0.52,
    change24h: 9.2,
    volume24h: 8900000,
    marketCap: 94000000,
    safetyScore: 8.1,
    liquidity: 2400000,
    holders: 28000,
    age: 678,
  },
  {
    symbol: "AUDIO",
    name: "Audius",
    mint: "9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM",
    logoURI: getTokenLogoUrl("9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM"),
    decimals: 8,
    price: 0.18,
    change24h: 3.4,
    volume24h: 12000000,
    marketCap: 156000000,
    safetyScore: 8.6,
    liquidity: 3400000,
    holders: 45000,
    age: 1100,
  },
  {
    symbol: "MAPS",
    name: "Maps",
    mint: "MAPS41MDahZ9QdKXhVa4dWB9RuyfV4XqhyAZ8XcYepb",
    logoURI: getTokenLogoUrl("MAPS41MDahZ9QdKXhVa4dWB9RuyfV4XqhyAZ8XcYepb"),
    decimals: 6,
    price: 0.034,
    change24h: 12.6,
    volume24h: 2300000,
    marketCap: 23000000,
    safetyScore: 6.8,
    liquidity: 780000,
    holders: 15000,
    age: 234,
  },
  {
    symbol: "OXYGEN",
    name: "Oxygen",
    mint: "z3dn17yLaGMKffVogeFHQ9zWVcXgqgf3PQnDsNs2g6M",
    logoURI: getTokenLogoUrl("z3dn17yLaGMKffVogeFHQ9zWVcXgqgf3PQnDsNs2g6M"),
    decimals: 6,
    price: 0.0089,
    change24h: -1.2,
    volume24h: 890000,
    marketCap: 8900000,
    safetyScore: 7.1,
    liquidity: 290000,
    holders: 9800,
    age: 890,
  },
  {
    symbol: "GOFX",
    name: "GooseFX",
    mint: "GFX1ZjR2P15tmrSwow6FjyDYcEkoFb4p4gJCpLBjaxHD",
    logoURI: getTokenLogoUrl("GFX1ZjR2P15tmrSwow6FjyDYcEkoFb4p4gJCpLBjaxHD"),
    decimals: 9,
    price: 0.15,
    change24h: 8.4,
    volume24h: 1200000,
    marketCap: 12000000,
    safetyScore: 7.4,
    liquidity: 450000,
    holders: 8900,
    age: 567,
  },
  {
    symbol: "PRT",
    name: "Parrot Protocol",
    mint: "PRT88RkA4Kg5z7pKnezeNH4mafTvtQdfFgpQTGRjz44",
    logoURI: getTokenLogoUrl("PRT88RkA4Kg5z7pKnezeNH4mafTvtQdfFgpQTGRjz44"),
    decimals: 6,
    price: 0.0023,
    change24h: -5.6,
    volume24h: 450000,
    marketCap: 4500000,
    safetyScore: 6.2,
    liquidity: 180000,
    holders: 6700,
    age: 780,
  },
  {
    symbol: "SBR",
    name: "Saber",
    mint: "Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1",
    logoURI: getTokenLogoUrl("Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1"),
    decimals: 6,
    price: 0.0045,
    change24h: 2.1,
    volume24h: 890000,
    marketCap: 9800000,
    safetyScore: 7.8,
    liquidity: 340000,
    holders: 18000,
    age: 1050,
  },
  {
    symbol: "PORT",
    name: "Port Finance",
    mint: "PoRTjZMPXb9T7dyU7tpLEZRQj7e6ssfAE62j2oQuc6y",
    logoURI: getTokenLogoUrl("PoRTjZMPXb9T7dyU7tpLEZRQj7e6ssfAE62j2oQuc6y"),
    decimals: 6,
    price: 0.023,
    change24h: -3.8,
    volume24h: 670000,
    marketCap: 7800000,
    safetyScore: 7.0,
    liquidity: 280000,
    holders: 8900,
    age: 890,
  },
  {
    symbol: "MEDIA",
    name: "Media Network",
    mint: "ETAtLmCmsoiEEKfNrHKJ2kYy3MoABhU6NQvpSfij5tDs",
    logoURI: getTokenLogoUrl("ETAtLmCmsoiEEKfNrHKJ2kYy3MoABhU6NQvpSfij5tDs"),
    decimals: 6,
    price: 3.45,
    change24h: 15.2,
    volume24h: 5600000,
    marketCap: 34000000,
    safetyScore: 7.5,
    liquidity: 1200000,
    holders: 12000,
    age: 890,
  },
  {
    symbol: "TINY",
    name: "TinyColony",
    mint: "HKfs24UEDQpHS5hUyKYkHd9q7GY5UQ679q2bokeL2whu",
    logoURI: getTokenLogoUrl("HKfs24UEDQpHS5hUyKYkHd9q7GY5UQ679q2bokeL2whu"),
    decimals: 6,
    price: 0.0089,
    change24h: 34.2,
    volume24h: 1800000,
    marketCap: 8900000,
    safetyScore: 5.8,
    liquidity: 450000,
    holders: 7800,
    age: 156,
  },
  {
    symbol: "LIKE",
    name: "Only1",
    mint: "3bRTivrVsitbmCTGtqwp7hxXPsybkjn4XLNtPsHqa3zR",
    logoURI: getTokenLogoUrl("3bRTivrVsitbmCTGtqwp7hxXPsybkjn4XLNtPsHqa3zR"),
    decimals: 9,
    price: 0.012,
    change24h: 5.6,
    volume24h: 890000,
    marketCap: 6700000,
    safetyScore: 6.8,
    liquidity: 290000,
    holders: 8900,
    age: 780,
  },
  {
    symbol: "BASIS",
    name: "basis.markets",
    mint: "Basis9oJw9j8cw53oMV7iqsgo6ihi9ALw4QR31rcjUJa",
    logoURI: getTokenLogoUrl("Basis9oJw9j8cw53oMV7iqsgo6ihi9ALw4QR31rcjUJa"),
    decimals: 6,
    price: 0.056,
    change24h: 18.9,
    volume24h: 3400000,
    marketCap: 18000000,
    safetyScore: 6.9,
    liquidity: 890000,
    holders: 11000,
    age: 201,
  },
  {
    symbol: "TULIP",
    name: "Tulip Protocol",
    mint: "TuLipcqtGVXP9XR62wM8WWCm6a9vhLs7T1uoWBk6FDs",
    logoURI: getTokenLogoUrl("TuLipcqtGVXP9XR62wM8WWCm6a9vhLs7T1uoWBk6FDs"),
    decimals: 6,
    price: 0.89,
    change24h: -2.4,
    volume24h: 2300000,
    marketCap: 12000000,
    safetyScore: 7.6,
    liquidity: 560000,
    holders: 9800,
    age: 890,
  },
  {
    symbol: "GRAPE",
    name: "Grape Protocol",
    mint: "8upjSpvjcdpuzhfR1zriwg5NXkwDruejqNE9WNbPRtyA",
    logoURI: getTokenLogoUrl("8upjSpvjcdpuzhfR1zriwg5NXkwDruejqNE9WNbPRtyA"),
    decimals: 6,
    price: 0.0023,
    change24h: 7.8,
    volume24h: 450000,
    marketCap: 3400000,
    safetyScore: 6.5,
    liquidity: 180000,
    holders: 8900,
    age: 678,
  },
  {
    symbol: "POLIS",
    name: "Star Atlas DAO",
    mint: "poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk",
    logoURI: getTokenLogoUrl("poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk"),
    decimals: 8,
    price: 0.12,
    change24h: 4.2,
    volume24h: 1800000,
    marketCap: 23000000,
    safetyScore: 7.9,
    liquidity: 780000,
    holders: 18000,
    age: 890,
  },
  {
    symbol: "ATLAS",
    name: "Star Atlas",
    mint: "ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx",
    logoURI: getTokenLogoUrl("ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx"),
    decimals: 8,
    price: 0.0034,
    change24h: 6.5,
    volume24h: 3400000,
    marketCap: 45000000,
    safetyScore: 7.8,
    liquidity: 1200000,
    holders: 23000,
    age: 890,
  },
  {
    symbol: "SUSHI",
    name: "SushiToken",
    mint: "ChVzxWRmrTeSgwd3Ui3UumcN8KX7VK3WaD4KGeSKpypj",
    logoURI: getTokenLogoUrl("ChVzxWRmrTeSgwd3Ui3UumcN8KX7VK3WaD4KGeSKpypj"),
    decimals: 8,
    price: 1.12,
    change24h: -1.8,
    volume24h: 23000000,
    marketCap: 156000000,
    safetyScore: 8.4,
    liquidity: 4500000,
    holders: 34000,
    age: 1200,
  },
  {
    symbol: "SRM",
    name: "Serum",
    mint: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
    logoURI: getTokenLogoUrl("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt"),
    decimals: 6,
    price: 0.023,
    change24h: -4.2,
    volume24h: 1200000,
    marketCap: 15000000,
    safetyScore: 7.2,
    liquidity: 560000,
    holders: 28000,
    age: 1200,
  },
  {
    symbol: "DUST",
    name: "DUST Protocol",
    mint: "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ",
    logoURI: getTokenLogoUrl("DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ"),
    decimals: 9,
    price: 0.18,
    change24h: 22.4,
    volume24h: 8900000,
    marketCap: 67000000,
    safetyScore: 6.8,
    liquidity: 2300000,
    holders: 19000,
    age: 456,
  },
  {
    symbol: "CAVE",
    name: "Crypto Cavemen",
    mint: "4SZjjNABoqhbd4hnapbvoEPEqT8mnNkfbEoAwALf1V8t",
    logoURI: getTokenLogoUrl("4SZjjNABoqhbd4hnapbvoEPEqT8mnNkfbEoAwALf1V8t"),
    decimals: 6,
    price: 0.0089,
    change24h: 12.5,
    volume24h: 890000,
    marketCap: 5600000,
    safetyScore: 6.2,
    liquidity: 230000,
    holders: 6700,
    age: 234,
  },
];

export default function TokenScanner({ selectedToken, onSelectToken }: TokenScannerProps) {
  const [filter, setFilter] = useState<"all" | "new" | "hot" | "verified">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tokens, setTokens] = useState<any[]>([]);
  const [loadingSafety, setLoadingSafety] = useState(false);

  // Fetch token list from Jupiter API on mount
  useEffect(() => {
    const fetchJupiterTokens = async () => {
      try {
        const response = await fetch("https://token.jup.ag/strict");
        if (!response.ok) throw new Error("Jupiter API error");
        const jupTokens = await response.json();
        // Map Jupiter tokens to expected format
        const mappedTokens = jupTokens.map((t: any) => ({
          symbol: t.symbol,
          name: t.name,
          mint: t.address,
          logoURI: t.logoURI,
          decimals: t.decimals,
          price: t.price || 0,
          change24h: t.priceChange24h || 0,
          volume24h: t.volume24h || 0,
          marketCap: t.marketCap || 0,
          safetyScore: t.safetyScore || 0,
          liquidity: t.liquidity || 0,
          holders: t.holders || 0,
          age: t.age || 0,
        }));
        setTokens(mappedTokens);
      } catch (error) {
        console.error("Error fetching Jupiter tokens:", error);
        setTokens(MOCK_TOKENS);
      }
    };
    fetchJupiterTokens();
  }, []);

  // Fetch real safety scores in background (doesn't block UI)
  useEffect(() => {
    const updateTokenData = async () => {
      setLoadingSafety(true);
      
      // Update tokens one by one to avoid rate limits
      for (const token of tokens) {
        try {
          // Fetch DexScreener data
          const dexData = await getDexScreenerToken(token.mint);
          
          if (dexData) {
            setTokens(prevTokens => 
              prevTokens.map(t => 
                t.mint === token.mint 
                  ? {
                      ...t,
                      price: dexData.price || t.price,
                      change24h: dexData.priceChange24h || t.change24h,
                      volume24h: dexData.volume24h || t.volume24h,
                      liquidity: dexData.liquidity || t.liquidity,
                      marketCap: dexData.marketCap || t.marketCap,
                      age: dexData.age || t.age,
                    }
                  : t
              )
            );
          }
          
          // Fetch RugCheck data
          const safetyData = await getRugCheckReport(token.mint);
          
          if (safetyData && !safetyData.isError && safetyData.score > 0) {
            setTokens(prevTokens => 
              prevTokens.map(t => 
                t.mint === token.mint 
                  ? {
                      ...t,
                      safetyScore: (safetyData.score / 1000), // Convert to 0-10
                      liquidity: safetyData.liquidity || t.liquidity,
                      holders: safetyData.holders || t.holders,
                    }
                  : t
              )
            );
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 800));
        } catch (error) {
          // Silently fail for individual token data fetches
          // console.error(`Failed to fetch data for ${token.symbol}:`, error);
        }
      }
      
      setLoadingSafety(false);
    };

    // Start fetching data after tokens are loaded
    if (tokens.length > 0) {
      updateTokenData();
    }
  }, [tokens]);

  // Auto-refresh prices every 30 seconds
  useEffect(() => {
    const refreshPrices = async () => {
      // Update prices for all tokens (lighter than full data fetch)
      for (const token of tokens) {
        try {
          const dexData = await getDexScreenerToken(token.mint);
          
          if (dexData) {
            setTokens(prevTokens => 
              prevTokens.map(t => 
                t.mint === token.mint 
                  ? {
                      ...t,
                      price: dexData.price || t.price,
                      change24h: dexData.priceChange24h || t.change24h,
                      volume24h: dexData.volume24h || t.volume24h,
                    }
                  : t
              )
            );
          }
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          // Silently fail
        }
      }
    };

    // Set up polling interval (30 seconds)
    const interval = setInterval(refreshPrices, 30000);
    
    return () => clearInterval(interval);
  }, [tokens.length]); // Only re-create interval if token count changes

  const solToken = tokens.find(token => token.symbol === "SOL");
  
  const filteredTokens = tokens.filter(token => {
    // Exclude SOL from regular list
    if (token.symbol === "SOL") return false;
    
    // Search filter
    if (searchQuery && !token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !token.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (filter === "new" && token.age > 7) return false;
    if (filter === "hot" && token.change24h < 50) return false;
    if (filter === "verified" && token.safetyScore < 8) return false;

    return true;
  });

  const formatMarketCap = (mcap: number) => {
    if (mcap >= 1000000000) return `$${(mcap / 1000000000).toFixed(2)}B`;
    if (mcap >= 1000000) return `$${(mcap / 1000000).toFixed(1)}M`;
    if (mcap >= 1000) return `$${(mcap / 1000).toFixed(0)}K`;
    return `$${mcap}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 h-[calc(100vh-20px)] flex flex-col">
      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Tokens
      </h2>
      
      {/* Filters */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 font-semibold text-sm transition-all ${
            filter === "all"
              ? "text-[#10b981] border-b-2 border-[#10b981]"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("new")}
          className={`px-4 py-2 font-semibold text-sm transition-all ${
            filter === "new"
              ? "text-[#10b981] border-b-2 border-[#10b981]"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          New
        </button>
        <button
          onClick={() => setFilter("hot")}
          className={`px-4 py-2 font-semibold text-sm transition-all flex items-center gap-1.5 ${
            filter === "hot"
              ? "text-[#10b981] border-b-2 border-[#10b981]"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Trending
        </button>
        <button
          onClick={() => setFilter("verified")}
          className={`px-4 py-2 font-semibold text-sm transition-all ${
            filter === "verified"
              ? "text-[#10b981] border-b-2 border-[#10b981]"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Safe
        </button>
      </div>
      
      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tokens..."
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#10b981] transition-all"
        />
        <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      {/* Token List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {loadingSafety && tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFA3]"></div>
            <p className="mt-4 text-slate-400">Loading tokens...</p>
          </div>
        ) : filteredTokens.length === 0 && !solToken ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-2">No tokens found</p>
            <p className="text-sm text-slate-500">Try a different search</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* SOL Token - Featured */}
            {solToken && (
              <TokenCard
                token={solToken}
                isSelected={selectedToken?.mint === solToken.mint}
                onClick={() => onSelectToken(solToken)}
              />
            )}
            
            {filteredTokens.map((token) => (
              <TokenCard
                key={token.mint}
                token={token}
                isSelected={selectedToken?.mint === token.mint}
                onClick={() => onSelectToken(token)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
        active
          ? "bg-[#10b981] text-[#0A0E27]"
          : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

function TokenCard({ token, isSelected, onClick }: any) {
  const getSafetyColor = (score: number) => {
    if (score >= 8) return "text-[#10b981]"; // Green
    if (score >= 6) return "text-yellow-400"; // Yellow
    if (score >= 4) return "text-orange-400"; // Orange
    return "text-red-500"; // Red
  };

  const getSafetyBg = (score: number) => {
    if (score >= 8) return "bg-[#10b981]/10 border-[#10b981]/30"; // Green
    if (score >= 6) return "bg-yellow-400/10 border-yellow-400/30"; // Yellow
    if (score >= 4) return "bg-orange-400/10 border-orange-400/30"; // Orange
    return "bg-red-500/10 border-red-500/30"; // Red
  };

  const handleClick = () => {
    console.log('Token clicked:', token.symbol);
    analytics.track('token_viewed', {
      symbol: token.symbol,
      name: token.name,
      price: token.price,
      marketCap: token.marketCap,
      safetyScore: token.safetyScore,
    });
    onClick();
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative bg-white hover:bg-gray-50 rounded-xl p-3 cursor-pointer transition-all duration-300 border border-gray-100 ${
        isSelected
          ? "border-[#10b981]"
          : "hover:border-[#10b981]/50"
      }`}
    >
      {/* Glow effect on hover */}
      {!isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#10b981]/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      )}

      <div className="relative flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <img 
            src={token.logoURI} 
            alt={token.symbol}
            className="w-10 h-10 rounded-full ring-2 ring-gray-200 group-hover:ring-[#10b981] group-hover:ring-4 transition-all duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const parent = target.parentElement;
              if (parent && target.style.display !== 'none') {
                const fallback = document.createElement('div');
                fallback.className = 'w-10 h-10 rounded-full ring-2 ring-gray-200 group-hover:ring-[#10b981] transition-all bg-[#10b981] flex items-center justify-center text-white font-bold text-base';
                fallback.textContent = token.symbol[0];
                parent.replaceChild(fallback, target);
              }
            }}
          />
          <div>
            <div className="font-bold text-gray-900 text-base">{token.symbol}</div>
            <div className="text-xs text-gray-500">{token.name}</div>
          </div>
        </div>

        <div className={`px-2 py-0.5 rounded-full border font-bold text-xs ${getSafetyBg(token.safetyScore)}`}>
          <span className={getSafetyColor(token.safetyScore)}>{token.safetyScore.toFixed(1)}</span>
        </div>
      </div>

      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 mb-0.5">Market Cap</div>
          <div className="font-semibold text-gray-900 text-sm">
            {token.marketCap >= 1000000000 
              ? `$${(token.marketCap / 1000000000).toFixed(2)}B`
              : token.marketCap >= 1000000
              ? `$${(token.marketCap / 1000000).toFixed(1)}M`
              : `$${(token.marketCap / 1000).toFixed(0)}K`
            }
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500 mb-0.5">24h Change</div>
          <div className={`font-bold text-base transition-all duration-300 ${
            token.change24h > 0 ? "text-[#10b981]" : "text-[#FF0080]"
          }`}>
            {token.change24h > 0 ? "+" : ""}{token.change24h.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Safety Progress Bar */}
      <div className="relative mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all ${
            token.safetyScore >= 8 ? "bg-[#10b981]" :
            token.safetyScore >= 6 ? "bg-yellow-400" :
            token.safetyScore >= 4 ? "bg-orange-400" :
            "bg-red-500"
          }`}
          style={{ width: `${token.safetyScore * 10}%` }}
        />
      </div>
    </div>
  );
}
