# 🚀 BlackKeep - Memecoin Trading Terminal

**Safe, fast memecoin trading on Solana.** Trade smarter with built-in safety checks, real-time analytics, and beginner-friendly features.

![BlackKeep Terminal](https://via.placeholder.com/1200x600/0A0E27/00FFA3?text=BlackKeep+Terminal)

## ✨ Features

### 🛡️ **Safety First**
- **Real-time Safety Scoring** (1-10 scale)
- Automatic rug detection
- Liquidity verification
- Holder concentration analysis
- Contract verification checks
- Honeypot detection

### 📊 **Smart Trading**
- Token discovery scanner
- Live trending feed
- Price charts & analytics
- One-click buy/sell
- Market & limit orders
- Quick percentage buttons

### 👥 **Social Trading**
- Network activity feed
- Copy trading (coming soon)
- Friend recommendations
- Trading squads (coming soon)

### 📱 **Mobile-First Design**
- Responsive on all devices
- Touch-optimized interface
- Swipeable tabs
- Fast, intuitive UX

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Blockchain:** Solana Web3.js
- **Wallet:** Solana Wallet Adapter
- **State:** React Hooks

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Solana wallet (Phantom, Solflare, etc.)
- Basic knowledge of React/Next.js

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/blackkeep-memecoin.git
cd blackkeep-memecoin
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. Connect your Solana wallet (Phantom recommended)
2. Switch to Devnet in your wallet settings (for testing)
3. Get some Devnet SOL from [SolFaucet](https://solfaucet.com/)
4. Start trading!

## 📁 Project Structure

```
blackkeep-memecoin/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx             # Main application page
│   └── globals.css          # Global styles
├── components/
│   ├── TopNav.tsx           # Navigation bar
│   ├── TokenScanner.tsx     # Token discovery panel
│   ├── TradePanel.tsx       # Main trading interface
│   ├── SafetyCheckPanel.tsx # Safety analysis
│   ├── MiniChart.tsx        # Price chart
│   ├── LiveFeed.tsx         # Activity feed
│   ├── SafetyBadge.tsx      # Safety score badge
│   ├── WalletContext.tsx    # Wallet provider
│   └── ConnectButton.tsx    # Wallet connection
├── public/                  # Static assets
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## 🎨 Customization

### Colors

Edit `tailwind.config.ts` to change the color scheme:

```typescript
colors: {
  primary: {
    DEFAULT: "#00FFA3",  // Neon green
    dark: "#00CC82",
  },
  danger: {
    DEFAULT: "#FF0080",  // Hot pink
    dark: "#CC0066",
  },
}
```

### Mock Data

Currently using mock data for development. To connect real data:

1. **Token List:** Replace `MOCK_TOKENS` in `TokenScanner.tsx` with Jupiter API
2. **Safety Checks:** Integrate with RugCheck or similar API
3. **Live Feed:** Connect WebSocket for real-time data

## 🔌 API Integration Guide

### Jupiter Integration (for real swaps)

```typescript
// Install Jupiter SDK
npm install @jup-ag/api

// In your TradePanel.tsx
import { createJupiterApiClient } from '@jup-ag/api';

const jupiterApi = createJupiterApiClient();

// Get quote
const quote = await jupiterApi.quoteGet({
  inputMint: fromToken.mint,
  outputMint: toToken.mint,
  amount: amountInLamports,
  slippageBps: 50, // 0.5%
});

// Execute swap
const swapResult = await jupiterApi.swapPost({
  swapRequest: {
    quoteResponse: quote,
    userPublicKey: wallet.publicKey.toString(),
  }
});
```

### Safety Check API

Options for implementing real safety checks:

1. **RugCheck API** - https://rugcheck.xyz
2. **Birdeye API** - https://birdeye.so
3. **DexScreener API** - https://dexscreener.com
4. **Build your own** using on-chain data

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy with one click
4. Done! Your site is live

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create `.env.local` for production:

```env
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_NETWORK=mainnet-beta
```

## 📊 Roadmap

### Phase 1: MVP (Current)
- [x] Core UI/UX
- [x] Wallet integration
- [x] Mock trading interface
- [x] Safety check display

### Phase 2: Real Trading (Week 2-3)
- [ ] Jupiter API integration
- [ ] Real-time token data
- [ ] Actual swap execution
- [ ] Transaction history

### Phase 3: Advanced Features (Week 4-6)
- [ ] Live safety checks
- [ ] Portfolio tracking
- [ ] P&L analytics
- [ ] Tax reporting

### Phase 4: Social (Month 2-3)
- [ ] Friend system
- [ ] Copy trading
- [ ] Trading squads
- [ ] Leaderboards

### Phase 5: Launch (Month 3)
- [ ] $BLACK token
- [ ] Fee implementation (0.8%)
- [ ] Marketing campaign
- [ ] User acquisition

## 💰 Revenue Model

- **Free Tier:** 0.8% swap fee (competitive)
- **Pro Tier ($20/mo):** 0.5% fee + advanced features
- **Whale Tier ($100/mo):** 0.3% fee + premium support

## 🐛 Known Issues

- Mock data only (not connected to real tokens yet)
- Charts are randomly generated (need real price data)
- No actual swap execution (Jupiter integration needed)
- Safety scores are hardcoded (need RugCheck API)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this code for your own projects

## 🆘 Support

- **Documentation:** [Coming soon]
- **Discord:** [Coming soon]
- **Twitter:** [@blackkeep_sol](https://twitter.com/blackkeep_sol)

## ⚠️ Disclaimer

BlackKeep is in beta. Cryptocurrency trading involves risk. Only invest what you can afford to lose. Always DYOR (Do Your Own Research).

**This is not financial advice.**

---

Built with ❤️ for the Solana memecoin community

**Trade Smarter. Not Harder.**
