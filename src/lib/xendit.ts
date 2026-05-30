export function getXenditHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'api-version': '2022-07-31',
  }
}

export function getXenditAuth(): string {
  const apiKey = process.env.XENDIT_API_KEY || ''
  return Buffer.from(`${apiKey}:`).toString('base64')
}

export interface XenditInvoice {
  id: string
  invoice_url: string
  status: string
  external_id: string
  amount: number
  expiry_date: string
}

export async function createXenditInvoice(params: {
  externalId: string
  amount: number
  description: string
  customer: { name: string; phone: string; email?: string }
  items: { name: string; quantity: number; price: number }[]
  successRedirectUrl: string
  failureRedirectUrl: string
}): Promise<XenditInvoice> {
  const body = {
    external_id: params.externalId,
    amount: params.amount,
    description: params.description,
    payer_email: params.customer.email || '',
    customer: {
      given_names: params.customer.name,
      surname: '',
      email: params.customer.email || '',
      mobile_number: params.customer.phone,
    },
    customer_notification_preference: {
      invoice_created: ['whatsapp', 'email'],
      invoice_paid: ['whatsapp', 'email'],
      invoice_reminder: ['whatsapp', 'email'],
    },
    success_redirect_url: params.successRedirectUrl,
    failure_redirect_url: params.failureRedirectUrl,
    currency: 'IDR',
    items: params.items,
  }

  const res = await fetch('https://api.xendit.co/v2/invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${getXenditAuth()}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Xendit error: ${res.status} ${error}`)
  }

  return res.json()
}
