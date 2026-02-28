// Risk Management Calculator Utilities

export interface RiskCalculation {
  lotSize: number;
  pipValue: number;
  riskAmount: number;
  potentialProfit: number;
  potentialLoss: number;
  riskRewardRatio: number;
  marginRequired: number;
  effectiveLeverage: number;
}

export interface RiskInput {
  accountBalance: number;
  riskPercent: number;
  stopLossPips: number;
  takeProfitPips: number;
  pair: string;
  accountCurrency: string;
  leverage: number;
}

// Get pip value multiplier for different pairs
export function getPipMultiplier(pair: string): number {
  if (pair.includes('JPY')) return 100;
  if (pair.includes('XAU')) return 100;
  if (pair.includes('XAG')) return 1000;
  return 10000;
}

// Calculate pip value in account currency
export function calculatePipValue(
  pair: string,
  lotSize: number,
  accountCurrency: string = 'USD'
): number {
  const isJpyPair = pair.includes('JPY');
  const isXauPair = pair.includes('XAU');
  
  // Base pip value per lot
  let pipValuePerLot: number;
  
  if (isJpyPair) {
    pipValuePerLot = 1000; // For JPY pairs, 1 pip = 0.01
  } else if (isXauPair) {
    pipValuePerLot = 1; // For Gold, 1 pip = $0.01
  } else {
    pipValuePerLot = 10; // For other pairs, 1 pip = 0.0001
  }
  
  // Adjust for cross pairs
  if (!pair.includes('USD')) {
    // Simplified cross pair adjustment
    if (pair.startsWith('EUR') || pair.startsWith('GBP')) {
      pipValuePerLot *= 1.1; // Approximate conversion
    }
  }
  
  return pipValuePerLot * lotSize;
}

// Calculate lot size based on risk parameters
export function calculateLotSize(
  accountBalance: number,
  riskPercent: number,
  stopLossPips: number,
  pair: string,
  accountCurrency: string = 'USD'
): number {
  const riskAmount = accountBalance * (riskPercent / 100);
  const pipValue = calculatePipValue(pair, 1, accountCurrency);
  
  const lotSize = riskAmount / (stopLossPips * pipValue);
  
  // Round to standard lot sizes
  if (lotSize >= 1) {
    return Math.floor(lotSize * 10) / 10; // Round to 0.1
  } else if (lotSize >= 0.1) {
    return Math.floor(lotSize * 10) / 10;
  } else {
    return Math.floor(lotSize * 100) / 100; // Round to 0.01
  }
}

// Full risk calculation
export function calculateRisk(input: RiskInput): RiskCalculation {
  const {
    accountBalance,
    riskPercent,
    stopLossPips,
    takeProfitPips,
    pair,
    accountCurrency,
    leverage,
  } = input;
  
  const riskAmount = accountBalance * (riskPercent / 100);
  const lotSize = calculateLotSize(accountBalance, riskPercent, stopLossPips, pair, accountCurrency);
  const pipValue = calculatePipValue(pair, lotSize, accountCurrency);
  
  const potentialLoss = stopLossPips * pipValue;
  const potentialProfit = takeProfitPips * pipValue;
  
  const riskRewardRatio = takeProfitPips / stopLossPips;
  
  // Margin calculation (simplified)
  const contractValue = getContractValue(pair);
  const marginRequired = (contractValue * lotSize) / leverage;
  
  // Effective leverage
  const effectiveLeverage = (contractValue * lotSize) / accountBalance;
  
  return {
    lotSize,
    pipValue,
    riskAmount,
    potentialProfit,
    potentialLoss,
    riskRewardRatio,
    marginRequired,
    effectiveLeverage,
  };
}

// Get contract value for different pairs
function getContractValue(pair: string): number {
  // Standard lot contract values
  const baseValue = 100000; // Standard lot
  
  if (pair.includes('XAU')) {
    return 100; // 100 oz gold per lot
  }
  
  return baseValue;
}

// Calculate position size for specific risk amount
export function calculatePositionForRisk(
  riskAmount: number,
  stopLossPips: number,
  pair: string
): number {
  const pipValue = calculatePipValue(pair, 1);
  return Math.floor((riskAmount / (stopLossPips * pipValue)) * 100) / 100;
}

// Calculate break-even price
export function calculateBreakEven(
  entryPrice: number,
  spreadPips: number,
  pair: string,
  direction: 'BUY' | 'SELL'
): number {
  const pipSize = getPipSize(pair);
  const spread = spreadPips * pipSize;
  
  if (direction === 'BUY') {
    return entryPrice + spread;
  } else {
    return entryPrice - spread;
  }
}

// Get pip size for a pair
export function getPipSize(pair: string): number {
  if (pair.includes('JPY')) return 0.01;
  if (pair.includes('XAU')) return 0.01;
  if (pair.includes('XAG')) return 0.001;
  return 0.0001;
}

// Format lot size for display
export function formatLotSize(lotSize: number): string {
  if (lotSize >= 1) {
    return `${lotSize.toFixed(1)} lot${lotSize >= 2 ? 's' : ''}`;
  } else if (lotSize >= 0.1) {
    return `${(lotSize * 10).toFixed(0)} mini lots`;
  } else {
    return `${(lotSize * 100).toFixed(0)} micro lots`;
  }
}

// Risk levels color coding
export function getRiskLevelColor(riskPercent: number): string {
  if (riskPercent <= 1) return 'text-emerald-400';
  if (riskPercent <= 2) return 'text-yellow-400';
  if (riskPercent <= 3) return 'text-orange-400';
  return 'text-red-400';
}

// Risk level description
export function getRiskLevelDescription(riskPercent: number): string {
  if (riskPercent <= 1) return 'Conservative - Recommended';
  if (riskPercent <= 2) return 'Moderate - Standard risk';
  if (riskPercent <= 3) return 'Aggressive - Higher risk';
  return 'Very High - Not recommended';
}

// Calculate compound growth
export function calculateCompoundGrowth(
  initialBalance: number,
  monthlyReturnPercent: number,
  months: number,
  riskPerTrade: number
): { balance: number; totalTrades: number; projectedPips: number } {
  let balance = initialBalance;
  const monthlyTrades = 20; // Assume 20 trading days
  const winRate = 0.65; // Assume 65% win rate
  const avgRR = 1.5; // Assume 1:1.5 risk/reward
  
  for (let m = 0; m < months; m++) {
    for (let t = 0; t < monthlyTrades; t++) {
      const riskAmount = balance * (riskPerTrade / 100);
      const isWin = Math.random() < winRate;
      
      if (isWin) {
        balance += riskAmount * avgRR;
      } else {
        balance -= riskAmount;
      }
    }
  }
  
  return {
    balance: Math.round(balance * 100) / 100,
    totalTrades: monthlyTrades * months,
    projectedPips: Math.round((balance - initialBalance) / 10), // Rough estimate
  };
}
