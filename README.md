# \u{1F916} BALU — Market Intelligence Bot

Real-time news sentiment alerts for XAUUSD, BTCUSD, EURUSD, USDJPY, AAPL, TSLA. 

## Features
- Scans news every 2-5 minutes using Claude AI + web search
- Analyzes sentiment (Bullish/Bearish/Neutral) with confidence and duration
- Tracks Polymarket prediction market odds
- Sends Telegram alerts for market-moving events
- Dark-themed dashboard optimized for mobile

## Setup
1. Deploy to Vercel
2. Add environment variables:
   - ANTHROPIC_API_KEY
   - TELEGRAM_BOT_TOKEN
   - TELEGRAM_CHAT_ID
   - CRON_SECRET
3. Set up cron jobs (Vercel Pro or cron-job.org)

## Estimated Cost
~$75-95/month on Claude API

Built with Next.js, Claude AI, Polymarket API, Telegram Bot API.
