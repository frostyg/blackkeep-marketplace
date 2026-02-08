# 🚀 BlackKeep Quick Start Guide

Get BlackKeep running in 5 minutes!

## Step 1: Install Dependencies (2 minutes)

```bash
cd blackkeep-memecoin
npm install
```

**Expected output:** 
- Installing packages... 
- Added 300+ packages
- ✓ Done!

## Step 2: Start Development Server (30 seconds)

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

## Step 3: Open in Browser (10 seconds)

Navigate to: **http://localhost:3000**

You should see:
- BlackKeep logo in top left
- "MEMECOIN TERMINAL" subtitle
- Token scanner on left
- Trade panel in center
- Live feed on right

## Step 4: Connect Wallet (1 minute)

1. Click "Connect Wallet" button (top right)
2. Select Phantom or Solflare
3. Approve connection
4. You're connected! 🎉

## Step 5: Start Exploring (1 minute)

### Desktop:
- **Left Panel:** Browse tokens (BONK, WIF, PONKE, etc.)
- **Center Panel:** Click a token to see safety check + trade interface
- **Right Panel:** See trending tokens and activity

### Mobile:
- Swipe between tabs: Discover → Trade → Feed
- Click any token to trade
- Everything is touch-optimized

## 🎨 What You're Seeing (Mock Data)

Currently showing:
- ✅ Full UI/UX (production-ready)
- ✅ Wallet connection (real)
- ⚠️ Token data (mock)
- ⚠️ Safety scores (hardcoded)
- ⚠️ Charts (random)
- ❌ Real swaps (not yet)

## 🔧 Common Issues

### "Module not found"
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### "Port 3000 already in use"
```bash
# Use different port
npm run dev -- -p 3001
```

### Wallet won't connect
- Make sure you have Phantom or Solflare installed
- Refresh the page
- Clear browser cache

### Styling looks broken
```bash
# Rebuild Tailwind
npm run build
npm run dev
```

## 🚀 Next Steps

Now that it's running:

1. **Explore the UI** - Click around, test features
2. **Read README.md** - Full documentation
3. **Integrate Jupiter** - Make real swaps
4. **Connect APIs** - Get real token data
5. **Deploy** - Put it live on Vercel

## 📱 Mobile Testing

Test on your phone:

1. Find your computer's IP (e.g., 192.168.1.100)
2. Open phone browser
3. Go to: `http://YOUR_IP:3000`
4. Test mobile experience

## 🎯 Your First Task

**Make it yours!**

1. Edit `components/TopNav.tsx`
2. Change "BLACKKEEP" to your project name
3. See it update live in browser
4. You're a developer now! 🎉

## 💡 Pro Tips

- **Hot Reload:** Code changes update instantly
- **React DevTools:** Install for debugging
- **Tailwind CSS:** Inspect classes in browser
- **Console:** Check for errors (F12)

## 🆘 Need Help?

- Check README.md for detailed docs
- Look at component comments
- Google error messages
- Ask AI (ChatGPT, Claude, etc.)

## 🎉 You're Ready!

BlackKeep is now running locally. Time to customize and make it yours!

**Happy coding! 🚀**

---

**Next:** Read `INTEGRATION_GUIDE.md` to connect real trading
