import { NextRequest, NextResponse } from 'next/server'
import { kaPost } from '@/lib/kiriminaja'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await kaPost('/shipping_price', body)
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
