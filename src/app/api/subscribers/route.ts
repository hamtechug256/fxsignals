import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List subscribers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const plan = searchParams.get('plan');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (plan) where.plan = plan;

    const [subscribers, total] = await Promise.all([
      db.subscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.subscriber.count({ where }),
    ]);

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// POST - Add new subscriber
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, telegram, plan } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await db.subscriber.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 400 }
      );
    }

    const subscriber = await db.subscriber.create({
      data: {
        email,
        name,
        telegram,
        plan: plan || 'FREE',
        active: true,
      },
    });

    return NextResponse.json(subscriber, { status: 201 });
  } catch (error) {
    console.error('Error creating subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to create subscriber' },
      { status: 500 }
    );
  }
}
