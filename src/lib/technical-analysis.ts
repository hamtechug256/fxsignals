// Technical Analysis Library - ICT Concepts
// Order Blocks, Fair Value Gaps, Liquidity Zones, Break of Structure

export interface OrderBlock {
  id: string;
  pair: string;
  type: 'bullish' | 'bearish';
  high: number;
  low: number;
  open: number;
  close: number;
  time: number;
  tested: boolean;
  strength: number; // 1-10
}

export interface FairValueGap {
  id: string;
  pair: string;
  type: 'bullish' | 'bearish';
  high: number;
  low: number;
  time: number;
  filled: boolean;
  fillPercentage: number;
}

export interface LiquidityZone {
  id: string;
  pair: string;
  type: 'buy_side' | 'sell_side';
  price: number;
  strength: number; // 1-10
  sweeps: number;
}

export interface BreakOfStructure {
  id: string;
  pair: string;
  type: 'bullish' | 'bearish';
  price: number;
  time: number;
  confirmed: boolean;
}

export interface SignalAnalysis {
  pair: string;
  trend: 'bullish' | 'bearish' | 'ranging';
  trendStrength: number;
  orderBlocks: OrderBlock[];
  fvgs: FairValueGap[];
  liquidityZones: LiquidityZone[];
  breakOfStructure: BreakOfStructure | null;
  keyLevels: {
    support: number[];
    resistance: number[];
  };
  signal: {
    direction: 'BUY' | 'SELL' | 'WAIT';
    confidence: number;
    entry: number;
    stopLoss: number;
    takeProfits: number[];
    reasoning: string;
  };
}

// Detect Order Blocks from candle data
export function detectOrderBlocks(
  candles: { open: number; high: number; low: number; close: number; time: number }[],
  pair: string,
  lookback: number = 20
): OrderBlock[] {
  const orderBlocks: OrderBlock[] = [];
  
  for (let i = 2; i < Math.min(candles.length - 1, lookback); i++) {
    const current = candles[i];
    const prev = candles[i - 1];
    const next = candles[i + 1];
    
    // Bullish Order Block: Down candle followed by strong up move
    if (current.close < current.open && next.close > next.open) {
      const moveSize = next.close - next.open;
      const bodySize = current.open - current.close;
      
      if (moveSize > bodySize * 1.5) {
        orderBlocks.push({
          id: `ob-${pair}-${current.time}`,
          pair,
          type: 'bullish',
          high: current.open,
          low: current.close,
          open: current.open,
          close: current.close,
          time: current.time,
          tested: false,
          strength: Math.min(10, Math.floor(moveSize / bodySize))
        });
      }
    }
    
    // Bearish Order Block: Up candle followed by strong down move
    if (current.close > current.open && next.close < next.open) {
      const moveSize = next.open - next.close;
      const bodySize = current.close - current.open;
      
      if (moveSize > bodySize * 1.5) {
        orderBlocks.push({
          id: `ob-${pair}-${current.time}`,
          pair,
          type: 'bearish',
          high: current.close,
          low: current.open,
          open: current.open,
          close: current.close,
          time: current.time,
          tested: false,
          strength: Math.min(10, Math.floor(moveSize / bodySize))
        });
      }
    }
  }
  
  return orderBlocks;
}

// Detect Fair Value Gaps
export function detectFVGs(
  candles: { open: number; high: number; low: number; close: number; time: number }[],
  pair: string,
  lookback: number = 30
): FairValueGap[] {
  const fvgs: FairValueGap[] = [];
  
  for (let i = 1; i < Math.min(candles.length - 1, lookback); i++) {
    const prev = candles[i + 1];
    const next = candles[i - 1];
    
    // Bullish FVG: Gap between prev high and next low
    if (prev.high < next.low) {
      fvgs.push({
        id: `fvg-${pair}-${candles[i].time}`,
        pair,
        type: 'bullish',
        high: next.low,
        low: prev.high,
        time: candles[i].time,
        filled: false,
        fillPercentage: 0
      });
    }
    
    // Bearish FVG: Gap between prev low and next high
    if (prev.low > next.high) {
      fvgs.push({
        id: `fvg-${pair}-${candles[i].time}`,
        pair,
        type: 'bearish',
        high: prev.low,
        low: next.high,
        time: candles[i].time,
        filled: false,
        fillPercentage: 0
      });
    }
  }
  
  return fvgs;
}

// Detect Liquidity Zones (swing highs/lows)
export function detectLiquidityZones(
  candles: { high: number; low: number; time: number }[],
  pair: string,
  lookback: number = 50
): LiquidityZone[] {
  const zones: LiquidityZone[] = [];
  const swingLookback = 5;
  
  for (let i = swingLookback; i < Math.min(candles.length - swingLookback, lookback); i++) {
    const current = candles[i];
    let isSwingHigh = true;
    let isSwingLow = true;
    
    // Check surrounding candles
    for (let j = i - swingLookback; j <= i + swingLookback; j++) {
      if (j === i) continue;
      if (candles[j].high >= current.high) isSwingHigh = false;
      if (candles[j].low <= current.low) isSwingLow = false;
    }
    
    if (isSwingHigh) {
      zones.push({
        id: `liq-sell-${pair}-${current.time}`,
        pair,
        type: 'sell_side',
        price: current.high,
        strength: swingLookback,
        sweeps: 0
      });
    }
    
    if (isSwingLow) {
      zones.push({
        id: `liq-buy-${pair}-${current.time}`,
        pair,
        type: 'buy_side',
        price: current.low,
        strength: swingLookback,
        sweeps: 0
      });
    }
  }
  
  return zones;
}

// Detect Break of Structure
export function detectBOS(
  candles: { high: number; low: number; close: number; time: number }[],
  pair: string
): BreakOfStructure | null {
  if (candles.length < 10) return null;
  
  const recent = candles.slice(0, 10);
  const higherHighs = [];
  const higherLows = [];
  const lowerHighs = [];
  const lowerLows = [];
  
  // Find swing points
  for (let i = 1; i < recent.length - 1; i++) {
    if (recent[i].high > recent[i-1].high && recent[i].high > recent[i+1].high) {
      higherHighs.push(recent[i].high);
    }
    if (recent[i].low < recent[i-1].low && recent[i].low < recent[i+1].low) {
      lowerLows.push(recent[i].low);
    }
  }
  
  // Check for bullish BOS (breaking above recent lower high)
  if (higherHighs.length >= 2) {
    const lastHigh = higherHighs[higherHighs.length - 1];
    const prevHigh = higherHighs[higherHighs.length - 2];
    if (lastHigh > prevHigh) {
      return {
        id: `bos-bull-${pair}-${Date.now()}`,
        pair,
        type: 'bullish',
        price: lastHigh,
        time: recent[0].time,
        confirmed: true
      };
    }
  }
  
  // Check for bearish BOS
  if (lowerLows.length >= 2) {
    const lastLow = lowerLows[lowerLows.length - 1];
    const prevLow = lowerLows[lowerLows.length - 2];
    if (lastLow < prevLow) {
      return {
        id: `bos-bear-${pair}-${Date.now()}`,
        pair,
        type: 'bearish',
        price: lastLow,
        time: recent[0].time,
        confirmed: true
      };
    }
  }
  
  return null;
}

// Generate trading signal based on ICT analysis
export function generateICTSignal(
  pair: string,
  currentPrice: number,
  candles: { open: number; high: number; low: number; close: number; time: number }[]
): SignalAnalysis {
  // Detect ICT concepts
  const orderBlocks = detectOrderBlocks(candles, pair);
  const fvgs = detectFVGs(candles, pair);
  const liquidityZones = detectLiquidityZones(candles, pair);
  const bos = detectBOS(candles, pair);
  
  // Determine trend
  const recentCloses = candles.slice(0, 10).map(c => c.close);
  const avgClose = recentCloses.reduce((a, b) => a + b, 0) / recentCloses.length;
  const oldestClose = recentCloses[recentCloses.length - 1];
  
  let trend: 'bullish' | 'bearish' | 'ranging' = 'ranging';
  let trendStrength = 50;
  
  if (avgClose > oldestClose * 1.002) {
    trend = 'bullish';
    trendStrength = Math.min(100, Math.floor(((avgClose / oldestClose) - 1) * 10000));
  } else if (avgClose < oldestClose * 0.998) {
    trend = 'bearish';
    trendStrength = Math.min(100, Math.floor((1 - (avgClose / oldestClose)) * 10000));
  }
  
  // Find key levels
  const support = liquidityZones.filter(z => z.type === 'buy_side').map(z => z.price).slice(0, 3);
  const resistance = liquidityZones.filter(z => z.type === 'sell_side').map(z => z.price).slice(0, 3);
  
  // Generate signal
  let direction: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
  let confidence = 0;
  let entry = currentPrice;
  let stopLoss = currentPrice;
  let takeProfits: number[] = [];
  let reasoning = '';
  
  // Check for bullish setup
  const bullishOB = orderBlocks.find(ob => ob.type === 'bullish' && ob.low < currentPrice && ob.high > currentPrice * 0.995);
  const bullishFVG = fvgs.find(fvg => fvg.type === 'bullish' && fvg.low < currentPrice && fvg.high > currentPrice * 0.998);
  
  if (trend === 'bullish' && (bullishOB || bullishFVG) && bos?.type === 'bullish') {
    direction = 'BUY';
    confidence = 75 + (bullishOB?.strength || 0) * 2;
    entry = bullishOB?.low || bullishFVG?.low || currentPrice;
    stopLoss = entry - (entry * 0.003); // 30 pips approx
    takeProfits = [
      entry + (entry - stopLoss) * 1.5,
      entry + (entry - stopLoss) * 2,
      entry + (entry - stopLoss) * 3
    ];
    reasoning = `Bullish setup: Order Block at ${bullishOB?.low.toFixed(5)}, BOS confirmed, targeting liquidity above ${resistance[0]?.toFixed(5)}`;
  }
  
  // Check for bearish setup
  const bearishOB = orderBlocks.find(ob => ob.type === 'bearish' && ob.high > currentPrice && ob.low < currentPrice * 1.005);
  const bearishFVG = fvgs.find(fvg => fvg.type === 'bearish' && fvg.high > currentPrice && fvg.low < currentPrice * 1.002);
  
  if (trend === 'bearish' && (bearishOB || bearishFVG) && bos?.type === 'bearish') {
    direction = 'SELL';
    confidence = 75 + (bearishOB?.strength || 0) * 2;
    entry = bearishOB?.high || bearishFVG?.high || currentPrice;
    stopLoss = entry + (entry * 0.003);
    takeProfits = [
      entry - (stopLoss - entry) * 1.5,
      entry - (stopLoss - entry) * 2,
      entry - (stopLoss - entry) * 3
    ];
    reasoning = `Bearish setup: Order Block at ${bearishOB?.high.toFixed(5)}, BOS confirmed, targeting liquidity below ${support[0]?.toFixed(5)}`;
  }
  
  if (direction === 'WAIT') {
    reasoning = 'No clear ICT setup detected. Waiting for Order Block retest or FVG fill.';
  }
  
  return {
    pair,
    trend,
    trendStrength,
    orderBlocks: orderBlocks.slice(0, 5),
    fvgs: fvgs.slice(0, 5),
    liquidityZones: liquidityZones.slice(0, 8),
    breakOfStructure: bos,
    keyLevels: { support, resistance },
    signal: {
      direction,
      confidence: Math.min(95, confidence),
      entry,
      stopLoss,
      takeProfits,
      reasoning
    }
  };
}

// Calculate risk metrics
export function calculateRiskMetrics(
  accountBalance: number,
  riskPercent: number,
  entryPrice: number,
  stopLoss: number,
  pair: string
) {
  const riskAmount = accountBalance * (riskPercent / 100);
  const pipDifference = Math.abs(entryPrice - stopLoss) / (pair.includes('JPY') ? 0.01 : 0.0001);
  const pipValue = pair.includes('JPY') ? 9.5 : 10; // Approximate
  const lotSize = riskAmount / (pipDifference * pipValue);
  const potentialLoss = pipDifference * pipValue * lotSize;
  
  return {
    riskAmount: parseFloat(riskAmount.toFixed(2)),
    lotSize: parseFloat(lotSize.toFixed(2)),
    pipDifference: Math.round(pipDifference),
    pipValue,
    potentialLoss: parseFloat(potentialLoss.toFixed(2)),
    riskRewardRatio: 0 // Calculated when TPs are known
  };
}
