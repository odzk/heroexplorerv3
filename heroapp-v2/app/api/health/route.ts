import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'hero-explorer-v2',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
}
