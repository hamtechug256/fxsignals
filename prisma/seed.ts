import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

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

  console.log('Created admin user:', admin.email);

  const signals = [
    {
      pair: 'EUR/USD',
      type: 'BUY',
      entryPrice: 1.08500,
      takeProfit1: 1.08700,
      takeProfit2: 1.08900,
      stopLoss: 1.08300,
      analysis: 'ICT Order Block + FVG confluence. Bullish momentum confirmed.',
      status: 'ACTIVE',
      result: 'PENDING',
    },
    {
      pair: 'GBP/USD',
      type: 'SELL',
      entryPrice: 1.26500,
      takeProfit1: 1.26300,
      takeProfit2: 1.26100,
      stopLoss: 1.26700,
      analysis: 'Bearish order block identified. Fair value gap above.',
      status: 'HIT_TP1',
      result: 'WIN',
      pips: 45.5,
    },
    {
      pair: 'XAU/USD',
      type: 'BUY',
      entryPrice: 2325.50,
      takeProfit1: 2340.00,
      takeProfit2: 2355.00,
      stopLoss: 2315.00,
      analysis: 'Gold finding support at key liquidity zone.',
      status: 'HIT_TP2',
      result: 'WIN',
      pips: 95.0,
    },
    {
      pair: 'USD/JPY',
      type: 'SELL',
      entryPrice: 154.500,
      takeProfit1: 154.200,
      takeProfit2: 153.900,
      stopLoss: 154.800,
      analysis: 'BOJ intervention risk. Short at resistance.',
      status: 'HIT_SL',
      result: 'LOSS',
      pips: -30.0,
    },
    {
      pair: 'GBP/JPY',
      type: 'BUY',
      entryPrice: 195.500,
      takeProfit1: 195.800,
      takeProfit2: 196.200,
      stopLoss: 195.100,
      analysis: 'Strong bullish momentum. Order block retest.',
      status: 'ACTIVE',
      result: 'PENDING',
    },
  ];

  for (const signal of signals) {
    await prisma.signal.create({ data: signal });
  }

  console.log('Created sample signals');

  await prisma.signalPerformance.create({
    data: {
      totalSignals: 5,
      winCount: 2,
      lossCount: 1,
      pendingCount: 2,
      winRate: 66.67,
      avgPips: 36.83,
    },
  });

  console.log('Database seeded successfully!');
  console.log('');
  console.log('='.repeat(50));
  console.log('Admin Login Credentials:');
  console.log('Email: admin@fxsignals.com');
  console.log('Password: admin123');
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
