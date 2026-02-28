import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FX Signals database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fxsignals.com' },
    update: {},
    create: {
      email: 'admin@fxsignals.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      plan: 'VIP',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create sample signals with ICT analysis
  const signals = [
    {
      pair: 'EUR/USD',
      type: 'BUY',
      entryPrice: 1.08500,
      takeProfit1: 1.08750,
      takeProfit2: 1.08950,
      takeProfit3: 1.09200,
      stopLoss: 1.08250,
      analysis: ' bullish Order Block identified at 1.08400. Fair Value Gap present between 1.08450-1.08550. Previous session liquidity cleared below swing low. Premium zone entry with optimal entry.',
      confidence: 85,
      timeframe: 'H1',
      status: 'ACTIVE',
    },
    {
      pair: 'GBP/USD',
      type: 'SELL',
      entryPrice: 1.26500,
      takeProfit1: 1.26250,
      takeProfit2: 1.26000,
      takeProfit3: 1.25750,
      stopLoss: 1.26800,
      analysis: 'Bearish Fair Value Gap at 1.26550-1.26650. Price reached premium zone. Expecting liquidity sweep of previous session lows. Institutional selling pressure evident.',
      confidence: 78,
      timeframe: 'H4',
      status: 'ACTIVE',
    },
    {
      pair: 'USD/JPY',
      type: 'BUY',
      entryPrice: 149.500,
      takeProfit1: 149.850,
      takeProfit2: 150.150,
      takeProfit3: 150.500,
      stopLoss: 149.150,
      analysis: 'Strong bullish structure on higher timeframe. Order Block at 149.300 acting as strong support. Target liquidity resting above 150.00 swing high.',
      confidence: 82,
      timeframe: 'H1',
      status: 'ACTIVE',
    },
    {
      pair: 'XAU/USD',
      type: 'BUY',
      entryPrice: 2325.00,
      takeProfit1: 2340.00,
      takeProfit2: 2355.00,
      takeProfit3: 2370.00,
      stopLoss: 2312.00,
      analysis: 'Gold showing strong bullish momentum after liquidity grab below previous swing low. Bullish FVG formed at 2320-2328. Institutional buying evident on volume.',
      confidence: 88,
      timeframe: 'H4',
      status: 'ACTIVE',
    },
    {
      pair: 'EUR/GBP',
      type: 'SELL',
      entryPrice: 0.8580,
      takeProfit1: 0.8555,
      takeProfit2: 0.8530,
      takeProfit3: 0.8505,
      stopLoss: 0.8605,
      analysis: 'Bearish market structure on H4 timeframe. Order block at 0.8590-0.8600 rejecting price. Looking for continuation to downside liquidity.',
      confidence: 75,
      timeframe: 'H4',
      status: 'ACTIVE',
    },
    {
      pair: 'AUD/USD',
      type: 'BUY',
      entryPrice: 0.6550,
      takeProfit1: 0.6580,
      takeProfit2: 0.6610,
      takeProfit3: 0.6640,
      stopLoss: 0.6520,
      analysis: 'Bullish divergence on RSI at key support level. Previous swing low liquidity cleared. Expecting reversal with target at swing high liquidity.',
      confidence: 72,
      timeframe: 'H1',
      status: 'ACTIVE',
    },
    // Closed signals for performance history
    {
      pair: 'GBP/JPY',
      type: 'BUY',
      entryPrice: 195.500,
      takeProfit1: 195.850,
      takeProfit2: 196.200,
      stopLoss: 195.100,
      analysis: 'Strong bullish momentum. Order block retest complete.',
      confidence: 80,
      timeframe: 'H1',
      status: 'HIT_TP',
      result: 'WIN',
      pips: 70.0,
    },
    {
      pair: 'USD/CHF',
      type: 'SELL',
      entryPrice: 0.8920,
      takeProfit1: 0.8890,
      takeProfit2: 0.8860,
      stopLoss: 0.8950,
      analysis: 'Bearish structure. Liquidity sweep above swing high.',
      confidence: 76,
      timeframe: 'H4',
      status: 'HIT_TP',
      result: 'WIN',
      pips: 55.0,
    },
    {
      pair: 'NZD/USD',
      type: 'BUY',
      entryPrice: 0.6050,
      takeProfit1: 0.6080,
      takeProfit2: 0.6110,
      stopLoss: 0.6020,
      analysis: 'Bullish order block confirmed.',
      confidence: 68,
      timeframe: 'H1',
      status: 'HIT_SL',
      result: 'LOSS',
      pips: -30.0,
    },
    {
      pair: 'USD/CAD',
      type: 'SELL',
      entryPrice: 1.3620,
      takeProfit1: 1.3590,
      takeProfit2: 1.3560,
      stopLoss: 1.3650,
      analysis: 'Bearish FVG at premium zone.',
      confidence: 74,
      timeframe: 'H4',
      status: 'HIT_TP',
      result: 'WIN',
      pips: 60.0,
    },
  ];

  for (const signal of signals) {
    await prisma.signal.create({
      data: signal as any,
    });
  }

  console.log('✅ Created', signals.length, 'sample signals');

  // Create performance stats for different periods
  await prisma.signalPerformance.upsert({
    where: { period: 'all' },
    update: {},
    create: {
      period: 'all',
      totalSignals: 10,
      winCount: 3,
      lossCount: 1,
      pendingCount: 6,
      winRate: 75.0,
      totalPips: 155.0,
      avgPips: 38.75,
    },
  });

  await prisma.signalPerformance.upsert({
    where: { period: 'week' },
    update: {},
    create: {
      period: 'week',
      totalSignals: 5,
      winCount: 2,
      lossCount: 1,
      pendingCount: 2,
      winRate: 66.67,
      totalPips: 85.0,
      avgPips: 28.33,
    },
  });

  await prisma.signalPerformance.upsert({
    where: { period: 'month' },
    update: {},
    create: {
      period: 'month',
      totalSignals: 8,
      winCount: 3,
      lossCount: 1,
      pendingCount: 4,
      winRate: 75.0,
      totalPips: 115.0,
      avgPips: 28.75,
    },
  });

  console.log('✅ Created performance stats');

  console.log('');
  console.log('═'.repeat(50));
  console.log('🎉 Database seeded successfully!');
  console.log('═'.repeat(50));
  console.log('');
  console.log('🔐 Admin Login Credentials:');
  console.log('   Email:    admin@fxsignals.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('📊 Sample Data Created:');
  console.log('   - 6 Active trading signals');
  console.log('   - 4 Closed signals (for performance history)');
  console.log('   - Performance statistics');
  console.log('═'.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
