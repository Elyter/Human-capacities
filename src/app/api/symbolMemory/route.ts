import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM symbol_memory_results 
      ORDER BY timestamp DESC 
      LIMIT 10
    `;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { score } = await request.json();
    const timestamp = Date.now();
    
    await sql`
      INSERT INTO symbol_memory_results (timestamp, score)
      VALUES (${timestamp}, ${score})
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
} 