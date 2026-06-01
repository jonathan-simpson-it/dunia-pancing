import { NextResponse } from 'next/server'
import { kaPost } from '@/lib/kiriminaja'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { search } = body
    if (!search || typeof search !== 'string') {
      return NextResponse.json({ error: 'Missing search query' }, { status: 400 })
    }
    const data = await kaPost('/search_kecamatan', { search })
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 },
    )
  }
}
