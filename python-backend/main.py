"""
HAMCODZ Signal Platform - Main Runner
=====================================
Main script to run signal generation and delivery.

Usage:
    python main.py                    # Run once
    python main.py --schedule         # Run on schedule (every hour)
    python main.py --test             # Test mode (no actual sending)
"""

import os
import sys
import asyncio
import argparse
import logging
from datetime import datetime, timedelta
from typing import Optional, List
import json

# Local imports
from signal_engine import SignalEngine, Signal, SignalType
from telegram_bot import SignalSender

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('signals.log')
    ]
)
logger = logging.getLogger(__name__)


# Configuration
FOREX_PAIRS = [
    "EUR/USD",
    "GBP/USD", 
    "USD/JPY",
    "AUD/USD",
    "USD/CAD",
    "EUR/GBP",
    "GBP/JPY",
    "XAU/USD"  # Gold
]

# API Configuration (using free APIs)
FCS_API_URL = "https://fcsapi.com/api/forex"
EXCHANGERATE_API_URL = "https://api.exchangerate-api.com/v4/latest"


class ForexDataProvider:
    """
    Fetches forex price data from free APIs.
    Supports multiple data sources for redundancy.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("FCS_API_KEY", "")
        self.use_mock = not self.api_key  # Use mock data if no API key
    
    async def fetch_candles(self, pair: str, timeframe: str = "1H", count: int = 100) -> Optional[dict]:
        """
        Fetch candlestick data for a pair.
        
        For free tier, we'll use mock data that simulates real market conditions.
        In production, you'd replace this with actual API calls.
        """
        import aiohttp
        import numpy as np
        import pandas as pd
        
        if self.use_mock:
            return self._generate_mock_candles(pair, count)
        
        try:
            # FCS API call (requires free API key)
            async with aiohttp.ClientSession() as session:
                url = f"{FCS_API_URL}/candles"
                params = {
                    "symbol": pair.replace("/", ""),
                    "period": timeframe,
                    "access_key": self.api_key
                }
                
                async with session.get(url, params=params) as response:
                    data = await response.json()
                    
                    if data.get("status"):
                        return self._parse_fcs_response(data)
                    else:
                        logger.warning(f"API returned no data for {pair}, using mock")
                        return self._generate_mock_candles(pair, count)
                        
        except Exception as e:
            logger.error(f"Error fetching data for {pair}: {e}")
            return self._generate_mock_candles(pair, count)
    
    def _generate_mock_candles(self, pair: str, count: int = 100) -> dict:
        """
        Generate realistic mock candlestick data.
        Uses actual price ranges for each pair with proper ATR.
        """
        import numpy as np
        import pandas as pd
        
        # Realistic price ranges and ATR values for each pair
        # Format: (low, high, typical_atr_in_pips, pip_value)
        pair_configs = {
            "EUR/USD": (1.0800, 1.1000, 15, 0.0001),   # 15 pips ATR
            "GBP/USD": (1.2500, 1.2800, 20, 0.0001),   # 20 pips ATR
            "USD/JPY": (148.00, 152.00, 15, 0.01),     # 15 pips ATR
            "AUD/USD": (0.6400, 0.6700, 12, 0.0001),   # 12 pips ATR
            "USD/CAD": (1.3500, 1.3800, 15, 0.0001),   # 15 pips ATR
            "EUR/GBP": (0.8550, 0.8750, 10, 0.0001),   # 10 pips ATR
            "GBP/JPY": (186.00, 194.00, 25, 0.01),     # 25 pips ATR
            "XAU/USD": (2300.00, 2400.00, 150, 0.1)    # 150 pips (1500 points) ATR
        }
        
        config = pair_configs.get(pair, (1.0000, 2.0000, 10, 0.0001))
        low, high, atr_pips, pip_value = config
        atr = atr_pips * pip_value  # Convert ATR to price units
        
        # Generate base price movement
        np.random.seed(int(datetime.now().timestamp() * 1000) % 100000)
        
        base_price = (low + high) / 2
        prices = [base_price]
        
        # Generate realistic price movement
        for _ in range(count - 1):
            change = np.random.normal(0, atr / 3)
            new_price = prices[-1] + change
            prices.append(np.clip(new_price, low, high))
        
        prices = np.array(prices)
        
        # Create OHLC data with realistic ranges
        candles = pd.DataFrame({
            'open': prices,
            'high': prices + np.abs(np.random.normal(0, atr / 6, count)),
            'low': prices - np.abs(np.random.normal(0, atr / 6, count)),
            'close': prices + np.random.normal(0, atr / 8, count)
        })
        
        # Ensure high > low and proper ordering
        candles['high'] = candles[['high', 'open', 'close']].max(axis=1)
        candles['low'] = candles[['low', 'open', 'close']].min(axis=1)
        
        return {
            'pair': pair,
            'timeframe': '1H',
            'candles': candles,
            'last_update': datetime.now().isoformat()
        }
    
    def _parse_fcs_response(self, data: dict) -> dict:
        """Parse FCS API response into standard format"""
        import pandas as pd
        
        candles_data = data.get("response", [])
        
        df = pd.DataFrame(candles_data)
        df.columns = ['timestamp', 'open', 'high', 'low', 'close', 'volume']
        
        for col in ['open', 'high', 'low', 'close']:
            df[col] = pd.to_numeric(df[col])
        
        return {
            'pair': data.get("symbol", "UNKNOWN"),
            'timeframe': data.get("period", "1H"),
            'candles': df,
            'last_update': datetime.utcnow().isoformat()
        }


class SignalManager:
    """
    Manages signal generation, storage, and delivery.
    """
    
    def __init__(self, 
                 telegram_token: Optional[str] = None,
                 telegram_channel: Optional[str] = None,
                 api_key: Optional[str] = None):
        
        self.engine = SignalEngine()
        self.data_provider = ForexDataProvider(api_key)
        
        # Telegram integration
        self.telegram = None
        if telegram_token and telegram_channel:
            self.telegram = SignalSender(telegram_token, telegram_channel)
        
        # In-memory signal storage (use database in production)
        self.signals: List[Signal] = []
        self.last_signal_time: Optional[datetime] = None
    
    async def analyze_pair(self, pair: str) -> Optional[Signal]:
        """
        Analyze a single pair and generate signal if conditions are met.
        """
        logger.info(f"Analyzing {pair}...")
        
        # Fetch candle data
        data = await self.data_provider.fetch_candles(pair)
        
        if not data or 'candles' not in data:
            logger.warning(f"No data available for {pair}")
            return None
        
        candles = data['candles']
        
        # Generate signal
        signal = self.engine.analyze(pair, candles)
        
        if signal:
            logger.info(f"Signal generated for {pair}: {signal.signal_type.value}")
        else:
            logger.info(f"No signal for {pair}")
        
        return signal
    
    async def analyze_all_pairs(self) -> List[Signal]:
        """
        Analyze all configured pairs and return any signals found.
        """
        signals = []
        
        for pair in FOREX_PAIRS:
            try:
                signal = await self.analyze_pair(pair)
                if signal:
                    signals.append(signal)
            except Exception as e:
                logger.error(f"Error analyzing {pair}: {e}")
        
        return signals
    
    async def send_signal(self, signal: Signal) -> bool:
        """
        Send a signal via Telegram.
        """
        if not self.telegram:
            logger.warning("Telegram not configured, skipping send")
            return False
        
        message = self.engine.format_signal_for_telegram(signal)
        return await self.telegram.send_signal(message)
    
    async def run_once(self, send: bool = True) -> List[Signal]:
        """
        Run analysis once and optionally send signals.
        """
        logger.info("=" * 50)
        logger.info(f"Starting signal analysis at {datetime.utcnow()}")
        logger.info("=" * 50)
        
        signals = await self.analyze_all_pairs()
        
        if signals and send:
            for signal in signals:
                await self.send_signal(signal)
                self.signals.append(signal)
            
            self.last_signal_time = datetime.utcnow()
        
        logger.info(f"Analysis complete. {len(signals)} signals generated.")
        return signals
    
    async def run_scheduled(self, interval_minutes: int = 60):
        """
        Run analysis on a schedule.
        """
        logger.info(f"Starting scheduled analysis (every {interval_minutes} minutes)")
        
        while True:
            try:
                await self.run_once()
            except Exception as e:
                logger.error(f"Error in scheduled run: {e}")
            
            # Wait for next interval
            await asyncio.sleep(interval_minutes * 60)
    
    def save_signals_to_file(self, filepath: str = "signals_history.json"):
        """Save signals to JSON file"""
        data = []
        for signal in self.signals:
            data.append({
                'pair': signal.pair,
                'type': signal.signal_type.value,
                'entry': signal.entry_price,
                'tp1': signal.take_profit_1,
                'tp2': signal.take_profit_2,
                'sl': signal.stop_loss,
                'strength': signal.strength.value,
                'analysis': signal.analysis,
                'timestamp': signal.timestamp.isoformat()
            })
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        
        logger.info(f"Saved {len(data)} signals to {filepath}")


async def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="HAMCODZ Signal Platform")
    parser.add_argument('--schedule', action='store_true', help='Run on schedule')
    parser.add_argument('--test', action='store_true', help='Test mode (no sending)')
    parser.add_argument('--interval', type=int, default=60, help='Interval in minutes')
    parser.add_argument('--pair', type=str, help='Analyze specific pair only')
    args = parser.parse_args()
    
    # Get configuration from environment
    telegram_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    telegram_channel = os.getenv("TELEGRAM_CHANNEL_ID", "")
    api_key = os.getenv("FCS_API_KEY", "")
    
    # Test mode doesn't need Telegram
    if args.test:
        telegram_token = None
        telegram_channel = None
    
    # Initialize manager
    manager = SignalManager(
        telegram_token=telegram_token,
        telegram_channel=telegram_channel,
        api_key=api_key
    )
    
    if args.pair:
        # Analyze specific pair
        signal = await manager.analyze_pair(args.pair)
        if signal:
            print(manager.engine.format_signal_for_telegram(signal))
    
    elif args.schedule:
        # Run on schedule
        await manager.run_scheduled(args.interval)
    
    else:
        # Run once
        signals = await manager.run_once(send=not args.test)
        
        print(f"\n{'='*50}")
        print(f"ANALYSIS COMPLETE")
        print(f"{'='*50}")
        print(f"Signals generated: {len(signals)}")
        
        for signal in signals:
            print(f"\n{manager.engine.format_signal_for_telegram(signal)}")
        
        # Save to file
        if signals:
            manager.save_signals_to_file()


if __name__ == "__main__":
    asyncio.run(main())
