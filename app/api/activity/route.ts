import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Activity logging is optional: without DATABASE_URL the routes no-op.
const getSql = () =>
  process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export async function POST(request: NextRequest) {
  const sql = getSql();
  if (!sql) return NextResponse.json({ skipped: true });

  try {
    const { sessionId } = await request.json();
    if (typeof sessionId !== 'string' || !sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }
    await sql`
      INSERT INTO activity_record (session_id, personality, completed)
      VALUES (${sessionId}, NULL, false)
    `;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error creating activity record:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const sql = getSql();
  if (!sql) return NextResponse.json({ skipped: true });

  try {
    const { sessionId, personality } = await request.json();
    if (typeof sessionId !== 'string' || typeof personality !== 'string') {
      return NextResponse.json(
        { error: 'sessionId and personality required' },
        { status: 400 }
      );
    }
    await sql`
      UPDATE activity_record
      SET personality = ${personality}, completed = true
      WHERE session_id = ${sessionId}
    `;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error updating activity record:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
