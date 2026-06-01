import { NextResponse } from 'next/server'
import { kaPost } from '@/lib/kiriminaja'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { kecamatan_id } = body
    if (!kecamatan_id) {
      return NextResponse.json({ error: 'Missing kecamatan_id' }, { status: 400 })
    }
    const data = await kaPost('/get_kelurahan_from_kecamatan_id', { kecamatan_id })
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 },
    )
  }
}
