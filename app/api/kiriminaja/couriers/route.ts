import { NextResponse } from 'next/server'
import { kaPost } from '@/lib/kiriminaja'

export async function GET() {
  try {
    const data = await kaPost('/get_active_courier', {})
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
