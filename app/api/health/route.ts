import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    env: process.env.KIRIMINAJA_ENV || 'sandbox',
  })
}
