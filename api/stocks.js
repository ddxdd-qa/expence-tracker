import axios from 'axios';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // TradingView Scanner API endpoint for IDX
    // We use a predefined payload for IDX stocks.
    const url = 'https://scanner.tradingview.com/indonesia/scan';
    
    // We request standard technical metrics
    const payload = {
      symbols: { tickers: [] },
      columns: [
        'name', 'close', 'change', 'Recommend.All', 'Recommend.MA', 'Recommend.Other',
        'volume', 'market_cap_basic', 'price_earnings_ttm', 'dividend_yield_recent',
        'RSI', 'Stoch.K', 'CCI20', 'ADX', 'AO', 'Mom', 'MACD.macd', 'MACD.signal',
        'SMA20', 'SMA50', 'EMA20', 'W%R'
      ],
      sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' },
      range: [0, 50]
    };

    const response = await axios.post(url, payload);
    res.status(200).json(response.data.data);
  } catch (error) {
    console.error('TradingView API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
}
