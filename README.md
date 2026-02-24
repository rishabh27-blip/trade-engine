# 📊 Trade Decision Engine - PWA

A professional Progressive Web App for evaluating commodity trades with intelligent risk analysis and machine learning capabilities.

## ✨ Features

- **Smart Trade Evaluation**: 8-factor risk scoring algorithm
- **Risk/Reward Analysis**: Automated margin, volatility, and holding period assessment
- **Machine Learning**: Tracks actual vs predicted outcomes to improve decision accuracy
- **Performance Analytics**: Analyze trades by score buckets to identify winning patterns
- **Trade History**: Complete record of all evaluated and saved trades
- **Data Export**: CSV export for external analysis
- **Offline Support**: Works without internet connection
- **Mobile Optimized**: Responsive design for all screen sizes
- **Installable**: Install on your phone like a native app

## 📱 Installation Instructions

### **Android (Chrome/Edge)**

1. Open Chrome browser on your phone
2. Navigate to the hosted URL where you've deployed the app
3. Tap the menu (⋮) and select **"Add to Home screen"** or **"Install app"**
4. Tap **"Install"** in the popup
5. The app icon will appear on your home screen

### **iPhone/iPad (Safari)**

1. Open Safari browser
2. Navigate to the hosted URL
3. Tap the **Share** button (square with arrow pointing up)
4. Scroll down and tap **"Add to Home Screen"**
5. Tap **"Add"** in the top right
6. The app will appear on your home screen

### **Desktop (Chrome/Edge/Brave)**

1. Open the app URL in your browser
2. Look for the install icon (⊕) in the address bar
3. Click **"Install"**
4. The app will open in its own window

## 🚀 Hosting Options

### **Option 1: GitHub Pages (Free)**

1. Create a GitHub account at https://github.com
2. Create a new repository (e.g., `trade-engine-pwa`)
3. Upload all files from the `trade-engine-pwa` folder
4. Go to Settings → Pages
5. Select "Deploy from main branch"
6. Your app will be live at: `https://yourusername.github.io/trade-engine-pwa`

### **Option 2: Netlify (Free)**

1. Go to https://www.netlify.com
2. Drag and drop the entire `trade-engine-pwa` folder
3. Your app will be instantly deployed with a URL like: `https://random-name.netlify.app`

### **Option 3: Vercel (Free)**

1. Go to https://vercel.com
2. Sign up and click "New Project"
3. Upload the folder or connect to GitHub
4. Deploy instantly

### **Option 4: Local Testing**

```bash
# Install a simple HTTP server
npm install -g http-server

# Navigate to the folder
cd trade-engine-pwa

# Start the server
http-server -p 8080

# Open http://localhost:8080 in your browser
```

## 📖 How to Use

### 1. **Evaluate a Trade**
- Enter all 8 parameters (buy price, sell price, quantity, costs, days, volatility, reliability)
- Tap **"Evaluate Trade"**
- Review the decision, score, and risk analysis

### 2. **Save Trade Results**
- After evaluation, tap **"Save Trade"**
- Enter the actual profit/loss you achieved
- The trade is saved to your history

### 3. **View History**
- Tap **"History"** to see all saved trades
- View statistics: total trades, win rate, total profit, average profit

### 4. **Analyze Performance**
- Tap **"Analytics"** to see learning insights
- Trades are grouped by score (High/Mid/Low)
- Identify which score ranges produce the best results
- Requires at least 5 saved trades

### 5. **Export Data**
- Tap **"Export"** to download all trades as CSV
- Open in Excel/Google Sheets for deeper analysis

## 🎯 Scoring System

The app uses a 100-point scoring system based on:

| Factor | Max Points | Criteria |
|--------|-----------|----------|
| **Margin** | 30 | Profit per kg after all costs |
| **Risk** | 30 | Volatility × holding days vs margin |
| **Holding Period** | 20 | Days to sell (lower is better) |
| **Reliability** | 20 | Counterparty rating 1-5 |

### Decision Thresholds:
- **70+ points**: ✅ TRADE (high confidence)
- **55-70 points**: ⚠️ CONSIDER (use 50% position size)
- **<55 points**: ❌ NO TRADE

## 🔒 Privacy & Data

- All data is stored **locally** on your device using browser localStorage
- **No data is sent to any server**
- No account required, no tracking
- Your trade history stays on your device
- Export data anytime to backup

## 🛠 Technical Details

- **Framework**: Vanilla JavaScript (no dependencies)
- **Storage**: localStorage API
- **Offline**: Service Worker for caching
- **Manifest**: Full PWA manifest for installation
- **Responsive**: Mobile-first CSS design
- **Size**: ~50KB total (very lightweight)

## 📊 Future Enhancements (Planned)

- Cloud backup and sync
- Multi-device support
- Advanced charting and visualizations
- Commodity-specific scoring profiles
- Trade alerts and notifications
- Portfolio risk management
- Market data integration

## 🐛 Troubleshooting

**App won't install:**
- Make sure you're using HTTPS (required for PWA)
- Try a different browser (Chrome/Edge recommended)
- Clear browser cache and try again

**Data lost:**
- Data is stored in browser localStorage
- Clearing browser data will erase trades
- Use Export feature regularly to backup

**Offline mode not working:**
- First visit requires internet to cache files
- After that, works completely offline
- Check that service worker is registered (see console)

## 📄 License

Free to use for personal and commercial purposes.

## 🙏 Support

For questions or issues, create an issue on GitHub or contact the developer.

---

**Version**: 2.0  
**Last Updated**: February 2026  
**Made with** ❤️ **for traders**
