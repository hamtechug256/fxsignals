"""
HAMCODZ Trading Signal Engine
=============================
A comprehensive signal generation engine with ICT concepts.
Built by Hamza (hamcodz.duckdns.org)

Features:
- EMA Crossover Detection
- RSI Overbought/Oversold
- Support/Resistance Detection
- Order Block Identification (ICT)
- Fair Value Gap Detection (ICT)
- Liquidity Sweep Detection
"""

import numpy as np
import pandas as pd
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class SignalType(Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"


class SignalStrength(Enum):
    STRONG = "STRONG"
    MODERATE = "MODERATE"
    WEAK = "WEAK"


@dataclass
class Signal:
    """Trading signal data structure"""
    pair: str
    signal_type: SignalType
    entry_price: float
    take_profit_1: float
    take_profit_2: float
    stop_loss: float
    strength: SignalStrength
    analysis: str
    timestamp: datetime
    ema_crossover: bool = False
    rsi_signal: bool = False
    order_block: bool = False
    fvg: bool = False
    liquidity_sweep: bool = False


class TechnicalAnalysis:
    """Technical analysis utility functions"""
    
    @staticmethod
    def calculate_ema(prices: np.ndarray, period: int) -> np.ndarray:
        """Calculate Exponential Moving Average"""
        if len(prices) < period:
            return np.array([])
        
        multiplier = 2 / (period + 1)
        ema = np.zeros(len(prices))
        ema[:period] = np.mean(prices[:period])
        
        for i in range(period, len(prices)):
            ema[i] = (prices[i] * multiplier) + (ema[i-1] * (1 - multiplier))
        
        return ema
    
    @staticmethod
    def calculate_sma(prices: np.ndarray, period: int) -> np.ndarray:
        """Calculate Simple Moving Average"""
        if len(prices) < period:
            return np.array([])
        
        sma = np.convolve(prices, np.ones(period)/period, mode='valid')
        return np.pad(sma, (period-1, 0), 'edge')
    
    @staticmethod
    def calculate_rsi(prices: np.ndarray, period: int = 14) -> np.ndarray:
        """Calculate Relative Strength Index"""
        if len(prices) < period + 1:
            return np.array([])
        
        deltas = np.diff(prices)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)
        
        avg_gain = np.zeros(len(prices))
        avg_loss = np.zeros(len(prices))
        
        avg_gain[period] = np.mean(gains[:period])
        avg_loss[period] = np.mean(losses[:period])
        
        for i in range(period + 1, len(prices)):
            avg_gain[i] = (avg_gain[i-1] * (period - 1) + gains[i-1]) / period
            avg_loss[i] = (avg_loss[i-1] * (period - 1) + losses[i-1]) / period
        
        rs = np.where(avg_loss != 0, avg_gain / avg_loss, 0)
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    @staticmethod
    def calculate_atr(high: np.ndarray, low: np.ndarray, close: np.ndarray, period: int = 14) -> np.ndarray:
        """Calculate Average True Range"""
        if len(high) < period + 1:
            return np.array([])
        
        tr = np.zeros(len(high))
        tr[0] = high[0] - low[0]
        
        for i in range(1, len(high)):
            tr[i] = max(
                high[i] - low[i],
                abs(high[i] - close[i-1]),
                abs(low[i] - close[i-1])
            )
        
        atr = np.zeros(len(high))
        atr[period-1] = np.mean(tr[:period])
        
        for i in range(period, len(high)):
            atr[i] = (atr[i-1] * (period - 1) + tr[i]) / period
        
        return atr
    
    @staticmethod
    def find_support_resistance(prices: np.ndarray, window: int = 20) -> Tuple[List[float], List[float]]:
        """Find support and resistance levels"""
        if len(prices) < window:
            return [], []
        
        supports = []
        resistances = []
        
        for i in range(window, len(prices) - window):
            local_min = min(prices[i-window:i+window])
            local_max = max(prices[i-window:i+window])
            
            if prices[i] == local_min:
                supports.append(prices[i])
            elif prices[i] == local_max:
                resistances.append(prices[i])
        
        # Cluster nearby levels
        def cluster_levels(levels, threshold=0.001):
            if not levels:
                return []
            
            clustered = []
            levels = sorted(levels)
            current_cluster = [levels[0]]
            
            for level in levels[1:]:
                if abs(level - current_cluster[-1]) / current_cluster[-1] < threshold:
                    current_cluster.append(level)
                else:
                    clustered.append(np.mean(current_cluster))
                    current_cluster = [level]
            
            clustered.append(np.mean(current_cluster))
            return clustered
        
        return cluster_levels(supports), cluster_levels(resistances)


class ICTConcepts:
    """ICT (Inner Circle Trader) concept implementations"""
    
    @staticmethod
    def detect_order_blocks(candles: pd.DataFrame, lookback: int = 10) -> List[Dict]:
        """
        Detect Order Blocks (OB)
        An order block is the last opposing candle before a strong move.
        
        Returns list of order blocks with their levels.
        """
        if len(candles) < lookback + 5:
            return []
        
        order_blocks = []
        
        for i in range(lookback, len(candles) - 3):
            # Bullish Order Block: Last bearish candle before bullish move
            if candles.iloc[i]['close'] < candles.iloc[i]['open']:  # Bearish candle
                # Check for bullish move after
                move = 0
                for j in range(i + 1, min(i + 4, len(candles))):
                    move += candles.iloc[j]['close'] - candles.iloc[j]['open']
                
                if move > (candles.iloc[i]['high'] - candles.iloc[i]['low']) * 1.5:
                    ob = {
                        'type': 'BULLISH',
                        'high': candles.iloc[i]['high'],
                        'low': candles.iloc[i]['low'],
                        'index': i,
                        'tested': False
                    }
                    order_blocks.append(ob)
            
            # Bearish Order Block: Last bullish candle before bearish move
            elif candles.iloc[i]['close'] > candles.iloc[i]['open']:  # Bullish candle
                move = 0
                for j in range(i + 1, min(i + 4, len(candles))):
                    move += candles.iloc[j]['close'] - candles.iloc[j]['open']
                
                if move < -(candles.iloc[i]['high'] - candles.iloc[i]['low']) * 1.5:
                    ob = {
                        'type': 'BEARISH',
                        'high': candles.iloc[i]['high'],
                        'low': candles.iloc[i]['low'],
                        'index': i,
                        'tested': False
                    }
                    order_blocks.append(ob)
        
        return order_blocks
    
    @staticmethod
    def detect_fvg(candles: pd.DataFrame) -> List[Dict]:
        """
        Detect Fair Value Gaps (FVG)
        A FVG occurs when there's an imbalance between buyers and sellers.
        
        Bullish FVG: Gap between candle 1 high and candle 3 low
        Bearish FVG: Gap between candle 1 low and candle 3 high
        """
        if len(candles) < 3:
            return []
        
        fvgs = []
        
        for i in range(2, len(candles)):
            c1 = candles.iloc[i-2]
            c2 = candles.iloc[i-1]
            c3 = candles.iloc[i]
            
            # Bullish FVG
            if c1['high'] < c3['low'] and c2['close'] > c2['open']:
                fvg = {
                    'type': 'BULLISH',
                    'high': c3['low'],
                    'low': c1['high'],
                    'index': i,
                    'filled': False
                }
                fvgs.append(fvg)
            
            # Bearish FVG
            elif c1['low'] > c3['high'] and c2['close'] < c2['open']:
                fvg = {
                    'type': 'BEARISH',
                    'high': c1['low'],
                    'low': c3['high'],
                    'index': i,
                    'filled': False
                }
                fvgs.append(fvg)
        
        return fvgs
    
    @staticmethod
    def detect_liquidity_sweep(candles: pd.DataFrame, swing_lookback: int = 10) -> List[Dict]:
        """
        Detect Liquidity Sweeps
        A liquidity sweep occurs when price breaks a swing high/low and reverses.
        """
        if len(candles) < swing_lookback + 2:
            return []
        
        sweeps = []
        
        for i in range(swing_lookback, len(candles)):
            # Find swing high/low
            swing_high = max(candles.iloc[i-swing_lookback:i]['high'])
            swing_low = min(candles.iloc[i-swing_lookback:i]['low'])
            
            current = candles.iloc[i]
            
            # Bullish sweep: Price breaks below swing low and closes above
            if current['low'] < swing_low and current['close'] > swing_low:
                sweep = {
                    'type': 'BULLISH',
                    'level': swing_low,
                    'index': i
                }
                sweeps.append(sweep)
            
            # Bearish sweep: Price breaks above swing high and closes below
            elif current['high'] > swing_high and current['close'] < swing_high:
                sweep = {
                    'type': 'BEARISH',
                    'level': swing_high,
                    'index': i
                }
                sweeps.append(sweep)
        
        return sweeps
    
    @staticmethod
    def detect_breaker_blocks(candles: pd.DataFrame) -> List[Dict]:
        """
        Detect Breaker Blocks
        A breaker block forms when an order block fails and price breaks through.
        """
        # Simplified breaker detection
        breakers = []
        order_blocks = ICTConcepts.detect_order_blocks(candles)
        
        for ob in order_blocks:
            idx = ob['index']
            if idx + 5 < len(candles):
                # Check if OB was broken
                if ob['type'] == 'BULLISH':
                    if candles.iloc[idx+5]['close'] < ob['low']:
                        breakers.append({
                            'type': 'BEARISH_BREAKER',
                            'level': ob['low'],
                            'index': idx
                        })
                else:
                    if candles.iloc[idx+5]['close'] > ob['high']:
                        breakers.append({
                            'type': 'BULLISH_BREAKER',
                            'level': ob['high'],
                            'index': idx
                        })
        
        return breakers


class SignalEngine:
    """Main signal generation engine"""
    
    def __init__(self, risk_reward_ratio: float = 1.5, min_rr: float = 1.5):
        self.ta = TechnicalAnalysis()
        self.ict = ICTConcepts()
        self.risk_reward_ratio = risk_reward_ratio
        self.min_rr = min_rr
    
    def analyze(self, pair: str, candles: pd.DataFrame) -> Optional[Signal]:
        """
        Analyze price data and generate trading signal.
        
        Args:
            pair: Currency pair (e.g., "EUR/USD")
            candles: DataFrame with 'open', 'high', 'low', 'close' columns
        
        Returns:
            Signal object if valid signal found, None otherwise
        """
        if len(candles) < 50:
            return None
        
        # Extract price data
        close = candles['close'].values
        high = candles['high'].values
        low = candles['low'].values
        
        # Calculate indicators
        ema_9 = self.ta.calculate_ema(close, 9)
        ema_21 = self.ta.calculate_ema(close, 21)
        ema_50 = self.ta.calculate_ema(close, 50)
        rsi = self.ta.calculate_rsi(close, 14)
        atr = self.ta.calculate_atr(high, low, close, 14)
        
        # ICT concepts
        order_blocks = self.ict.detect_order_blocks(candles)
        fvgs = self.ict.detect_fvg(candles)
        sweeps = self.ict.detect_liquidity_sweep(candles)
        
        # Current values
        current_price = close[-1]
        current_rsi = rsi[-1] if len(rsi) > 0 else 50
        current_atr = atr[-1] if len(atr) > 0 else 0.001
        
        # Signal conditions
        signals_found = {
            'ema_crossover': False,
            'rsi_signal': False,
            'order_block': False,
            'fvg': False,
            'liquidity_sweep': False
        }
        
        signal_type = SignalType.HOLD
        analysis_points = []
        
        # 1. EMA Crossover Detection
        if len(ema_9) > 1 and len(ema_21) > 1:
            # Bullish crossover
            if ema_9[-2] < ema_21[-2] and ema_9[-1] > ema_21[-1]:
                signals_found['ema_crossover'] = True
                signal_type = SignalType.BUY
                analysis_points.append("EMA 9/21 bullish crossover detected")
            # Bearish crossover
            elif ema_9[-2] > ema_21[-2] and ema_9[-1] < ema_21[-1]:
                signals_found['ema_crossover'] = True
                signal_type = SignalType.SELL
                analysis_points.append("EMA 9/21 bearish crossover detected")
        
        # 2. RSI Overbought/Oversold
        if current_rsi < 30:
            signals_found['rsi_signal'] = True
            if signal_type == SignalType.HOLD:
                signal_type = SignalType.BUY
            analysis_points.append(f"RSI oversold ({current_rsi:.1f})")
        elif current_rsi > 70:
            signals_found['rsi_signal'] = True
            if signal_type == SignalType.HOLD:
                signal_type = SignalType.SELL
            analysis_points.append(f"RSI overbought ({current_rsi:.1f})")
        
        # 3. Order Block Detection
        if order_blocks:
            latest_ob = order_blocks[-1]
            if latest_ob['type'] == 'BULLISH' and current_price <= latest_ob['high']:
                signals_found['order_block'] = True
                if signal_type != SignalType.SELL:
                    signal_type = SignalType.BUY
                analysis_points.append("Bullish order block identified")
            elif latest_ob['type'] == 'BEARISH' and current_price >= latest_ob['low']:
                signals_found['order_block'] = True
                if signal_type != SignalType.BUY:
                    signal_type = SignalType.SELL
                analysis_points.append("Bearish order block identified")
        
        # 4. FVG Detection
        if fvgs:
            latest_fvg = fvgs[-1]
            if latest_fvg['type'] == 'BULLISH' and latest_fvg['low'] <= current_price <= latest_fvg['high']:
                signals_found['fvg'] = True
                if signal_type != SignalType.SELL:
                    signal_type = SignalType.BUY
                analysis_points.append("Price within bullish FVG zone")
            elif latest_fvg['type'] == 'BEARISH' and latest_fvg['low'] <= current_price <= latest_fvg['high']:
                signals_found['fvg'] = True
                if signal_type != SignalType.BUY:
                    signal_type = SignalType.SELL
                analysis_points.append("Price within bearish FVG zone")
        
        # 5. Liquidity Sweep
        if sweeps:
            latest_sweep = sweeps[-1]
            if latest_sweep['type'] == 'BULLISH':
                signals_found['liquidity_sweep'] = True
                if signal_type != SignalType.SELL:
                    signal_type = SignalType.BUY
                analysis_points.append("Bullish liquidity sweep detected")
            elif latest_sweep['type'] == 'BEARISH':
                signals_found['liquidity_sweep'] = True
                if signal_type != SignalType.BUY:
                    signal_type = SignalType.SELL
                analysis_points.append("Bearish liquidity sweep detected")
        
        # No signal found
        if signal_type == SignalType.HOLD:
            return None
        
        # Count confluences
        confluences = sum(1 for v in signals_found.values() if v)
        
        # Determine signal strength
        if confluences >= 4:
            strength = SignalStrength.STRONG
        elif confluences >= 2:
            strength = SignalStrength.MODERATE
        else:
            strength = SignalStrength.WEAK
        
        # Calculate entry, TP, SL
        if signal_type == SignalType.BUY:
            entry_price = current_price
            stop_loss = current_price - (current_atr * 2)
            take_profit_1 = current_price + (current_atr * 2 * self.risk_reward_ratio)
            take_profit_2 = current_price + (current_atr * 3 * self.risk_reward_ratio)
        else:  # SELL
            entry_price = current_price
            stop_loss = current_price + (current_atr * 2)
            take_profit_1 = current_price - (current_atr * 2 * self.risk_reward_ratio)
            take_profit_2 = current_price - (current_atr * 3 * self.risk_reward_ratio)
        
        # Build analysis string
        analysis = " | ".join(analysis_points)
        
        return Signal(
            pair=pair,
            signal_type=signal_type,
            entry_price=round(entry_price, 5),
            take_profit_1=round(take_profit_1, 5),
            take_profit_2=round(take_profit_2, 5),
            stop_loss=round(stop_loss, 5),
            strength=strength,
            analysis=analysis,
            timestamp=datetime.utcnow(),
            ema_crossover=signals_found['ema_crossover'],
            rsi_signal=signals_found['rsi_signal'],
            order_block=signals_found['order_block'],
            fvg=signals_found['fvg'],
            liquidity_sweep=signals_found['liquidity_sweep']
        )
    
    def get_pip_multiplier(self, pair: str) -> int:
        """Get pip multiplier based on pair type"""
        # JPY pairs use 100 (2 decimal places)
        if 'JPY' in pair:
            return 100
        # Gold uses 10 (1 pip = $0.10 move)
        elif 'XAU' in pair:
            return 10
        # Standard pairs use 10000 (4 decimal places)
        else:
            return 10000
    
    def format_signal_for_telegram(self, signal: Signal) -> str:
        """Format signal for Telegram message"""
        emoji = "🟢" if signal.signal_type == SignalType.BUY else "🔴"
        direction = signal.signal_type.value
        
        # Get correct pip multiplier for this pair
        pip_mult = self.get_pip_multiplier(signal.pair)
        
        # Calculate pips
        if signal.signal_type == SignalType.BUY:
            tp1_pips = (signal.take_profit_1 - signal.entry_price) * pip_mult
            tp2_pips = (signal.take_profit_2 - signal.entry_price) * pip_mult
            sl_pips = (signal.entry_price - signal.stop_loss) * pip_mult
        else:
            tp1_pips = (signal.entry_price - signal.take_profit_1) * pip_mult
            tp2_pips = (signal.entry_price - signal.take_profit_2) * pip_mult
            sl_pips = (signal.stop_loss - signal.entry_price) * pip_mult
        
        strength_emoji = {
            SignalStrength.STRONG: "💪💪💪",
            SignalStrength.MODERATE: "💪💪",
            SignalStrength.WEAK: "💪"
        }
        
        # Format price decimals based on pair type
        decimals = 2 if 'JPY' in signal.pair else 5
        if 'XAU' in signal.pair:
            decimals = 2
        
        message = f"""
{emoji} <b>{signal.pair} SIGNAL - {direction}</b> {emoji}

📊 <b>Entry:</b> {signal.entry_price:.{decimals}f}
🎯 <b>TP1:</b> {signal.take_profit_1:.{decimals}f} (+{tp1_pips:.0f} pips)
🎯 <b>TP2:</b> {signal.take_profit_2:.{decimals}f} (+{tp2_pips:.0f} pips)
🛑 <b>SL:</b> {signal.stop_loss:.{decimals}f} (-{sl_pips:.0f} pips)

📝 <b>Analysis:</b>
{signal.analysis}

⏰ <b>Time:</b> {signal.timestamp.strftime('%H:%M UTC')}
📊 <b>Strength:</b> {strength_emoji[signal.strength]}
📉 <b>Risk:</b> 1-2% recommended

<i>Signal by HAMCODZ Trading</i>
"""
        return message.strip()


# Example usage
if __name__ == "__main__":
    # Create sample data for testing
    np.random.seed(42)
    n_candles = 100
    
    # Generate realistic price data
    base_price = 1.0850  # EUR/USD
    returns = np.random.normal(0, 0.001, n_candles)
    prices = base_price * np.cumprod(1 + returns)
    
    # Create candles DataFrame
    candles = pd.DataFrame({
        'open': prices,
        'high': prices * (1 + np.abs(np.random.normal(0, 0.0005, n_candles))),
        'low': prices * (1 - np.abs(np.random.normal(0, 0.0005, n_candles))),
        'close': prices * (1 + np.random.normal(0, 0.0003, n_candles))
    })
    
    # Initialize engine and analyze
    engine = SignalEngine()
    signal = engine.analyze("EUR/USD", candles)
    
    if signal:
        print("Signal Generated!")
        print(engine.format_signal_for_telegram(signal))
    else:
        print("No signal found at this time.")
