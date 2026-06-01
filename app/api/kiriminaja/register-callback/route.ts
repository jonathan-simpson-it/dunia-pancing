import { NextResponse } from 'next/server'
import { kaPost } from '@/lib/kiriminaja'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = body
    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }
    const data = await kaPost('/set_callback', { url })
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Register callback failed' },
      { status: 500 },
    )
  }
}
