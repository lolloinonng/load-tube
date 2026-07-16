import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

let initialized = false;

export async function GET() {
  if (!initialized) { await initDb(); initialized = true; }
  return NextResponse.json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
}
