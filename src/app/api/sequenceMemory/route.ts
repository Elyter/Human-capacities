import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { score } = await request.json();
    const result = await prisma.sequenceMemoryResult.create({
      data: {
        score,
        timestamp: new Date(),
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function GET() {
  try {
    const results = await prisma.sequenceMemoryResult.findMany({
      orderBy: {
        timestamp: 'desc',
      },
      take: 10,
    });
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
} 