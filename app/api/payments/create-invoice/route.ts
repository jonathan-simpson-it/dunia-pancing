import { NextResponse } from 'next/server'
import { createXenditInvoice } from '@/lib/xendit'

export async function POST(request: Request) {
  const body = await request.json()

  try {
    const invoice = await createXenditInvoice({
      externalId: body.orderId,
      amount: body.amount,
      description: body.description || `Pembayaran ${body.orderId}`,
      customer: {
        name: body.customerName,
        phone: body.customerPhone,
        email: body.customerEmail || '',
      },
      items: body.items || [],
      successRedirectUrl: `${request.headers.get('origin') || process.env.AUTH_URL}/order-success/${body.orderId}`,
      failureRedirectUrl: `${request.headers.get('origin') || process.env.AUTH_URL}/checkout`,
    })

    return NextResponse.json(invoice)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create invoice' },
      { status: 500 },
    )
  }
}
