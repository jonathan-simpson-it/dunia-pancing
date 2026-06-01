import { NextResponse } from 'next/server'

export async function GET() {
  const xenditKey = process.env.XENDIT_API_KEY
  const kiriminajaKey = process.env.KIRIMINAJA_API_KEY

  return NextResponse.json({
    status: 'ok',
    env: process.env.KIRIMINAJA_ENV || 'sandbox',
    xenditKeyConfigured: !!xenditKey,
    kiriminajaKeyConfigured: !!kiriminajaKey,
    testingMode: process.env.NEXT_PUBLIC_TESTING_MODE === 'true',
  })
}
