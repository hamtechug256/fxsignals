# HAMCODZ Trading Signal Platform

A complete **$0 cost** trading signal platform with ICT-based analysis, automated signal generation, and Telegram delivery.

## Features

- **ICT Concepts Integration**: Order Blocks, Fair Value Gaps, Liquidity Sweeps
- **Technical Analysis**: EMA Crossover, RSI, Support/Resistance
- **Automated Signals**: Runs hourly via GitHub Actions
- **Telegram Delivery**: Instant signal notifications
- **Performance Tracking**: Win rate and pip statistics
- **100% Free**: Uses free APIs and GitHub Actions

## Project Structure

```
├── python-backend/           # Python signal engine
│   ├── main.py              # Main entry point
│   ├── signal_engine.py     # Signal generation logic
│   ├── telegram_bot.py      # Telegram integration
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
│
├── src/                     # Next.js frontend
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   └── lib/                 # Utilities
│
└── .github/workflows/       # GitHub Actions automation
    └── signals.yml          # Hourly signal generation
```

## Quick Start

### 1. Telegram Bot Setup (Free)

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` and follow the prompts
3. Save your **bot token** (looks like: `123456789:ABCdefGHI...`)
4. Create a public channel for your signals
5. Add your bot as channel administrator
6. Get your channel ID using **@userinfobot**

### 2. GitHub Repository Setup

1. Create a new GitHub repository
2. Push this code to the repository
3. Go to **Settings > Secrets and variables > Actions**
4. Add these secrets:
   - `TELEGRAM_BOT_TOKEN`: Your bot token
   - `TELEGRAM_CHANNEL_ID`: Your channel ID (@username or numeric)
   - `FCS_API_KEY`: (Optional) Free API key from fcsapi.com

### 3. Enable GitHub Actions

1. Go to **Actions** tab in your repository
2. Enable workflow if prompted
3. The signal generator will run automatically every hour

### 4. Test Locally (Optional)

```bash
# Install Python dependencies
cd python-backend
pip install -r requirements.txt

# Set environment variables
export TELEGRAM_BOT_TOKEN="your_token"
export TELEGRAM_CHANNEL_ID="@your_channel"

# Run test
python main.py --test

# Run once
python main.py

# Analyze specific pair
python main.py --pair EUR/USD
```

## Signal Types

### BUY Signal Example
```
🟢 EUR/USD SIGNAL - BUY 🟢

📊 Entry: 1.08500
🎯 TP1: 1.08700 (+20 pips)
🎯 TP2: 1.08900 (+40 pips)
🛑 SL: 1.08300 (-20 pips)

📝 Analysis:
EMA 9/21 bullish crossover detected | RSI oversold (28.5) | Bullish order block identified

⏰ Time: 14:30 UTC
📊 Strength: 💪💪💪
📉 Risk: 1-2% recommended
```

## ICT Concepts Implemented

### Order Blocks
- **Bullish OB**: Last bearish candle before a strong bullish move
- **Bearish OB**: Last bullish candle before a strong bearish move

### Fair Value Gaps (FVG)
- **Bullish FVG**: Gap between candle 1 high and candle 3 low
- **Bearish FVG**: Gap between candle 1 low and candle 3 high

### Liquidity Sweeps
- Price breaks a swing high/low and reverses
- Indicates stop hunting before the real move

## Signal Confluence Scoring

| Confluences | Strength | Signal Quality |
|-------------|----------|----------------|
| 4+ | STRONG 💪💪💪 | High probability |
| 2-3 | MODERATE 💪💪 | Good setup |
| 1 | WEAK 💪 | Use caution |

## API Endpoints (Next.js)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/signals` | GET, POST | List/create signals |
| `/api/signals/latest` | GET | Recent active signals |
| `/api/performance` | GET | Win rate statistics |
| `/api/subscribers` | GET, POST | Manage subscribers |

## Supported Pairs

- EUR/USD
- GBP/USD
- USD/JPY
- AUD/USD
- USD/CAD
- EUR/GBP
- GBP/JPY
- XAU/USD (Gold)

## Monetization Strategy

### Free Channel
- 2-3 signals per day
- Basic technical analysis
- Build trust and audience

### Premium Channel ($29/month)
- 5-8 signals per day
- Full ICT analysis
- Priority notifications
- Entry/Exit reasoning

### VIP Access ($79/month)
- All premium features
- Personal mentorship
- Custom analysis
- Risk management coaching

## Deployment

### Frontend (Vercel - Free)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend (Render - Free)
1. Connect GitHub repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `python main.py --schedule`

## Cost Breakdown

| Service | Cost |
|---------|------|
| Telegram Bot API | FREE |
| GitHub Actions | FREE (2000 min/month) |
| Vercel Hosting | FREE |
| FCS API | FREE (1000 requests/day) |
| Render Hosting | FREE |
| **TOTAL** | **$0** |

## Income Potential

| Timeline | Subscribers | Est. Income |
|----------|-------------|-------------|
| Month 1-2 | 50-100 free | $0 |
| Month 3-4 | 200 free, 10 premium | $290 |
| Month 5-6 | 500 free, 30 premium | $870 |
| Month 7+ | 1000+ free, 50+ premium | $1450+ |

## Author

**Hamza (HAMCODZ)**
- Portfolio: [hamcodz.duckdns.org](https://hamcodz.duckdns.org)
- GitHub: [github.com/hamtechug256](https://github.com/hamtechug256)
- Location: Kampala, Uganda

## License

MIT License - Feel free to use and modify for your own signal platform!

---

**Disclaimer**: Trading involves significant risk of loss. This platform is for educational purposes. Past performance does not guarantee future results. Always use proper risk management.
