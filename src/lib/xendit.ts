const XENDIT_API_URL = 'https://api.xendit.co'

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

export interface XenditRefund {
  id: string
  payment_id: string
  amount: number
  status: string
  reference_id: string
}

async function xenditFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${XENDIT_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${getXenditAuth()}`,
      ...(options.headers || {}),
    },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Xendit error: ${res.status} ${error}`)
  }

  return res.json()
}

export async function createXenditInvoice(params: {
  externalId: string
  amount: number
  description: string
  customer: { name: string; phone: string; email?: string }
  items: { name: string; quantity: number; price: number }[]
  successRedirectUrl: string
  failureRedirectUrl: string
  customerPhoneForNotification?: string
}): Promise<XenditInvoice> {
  const notificationPrefs: string[] = ['whatsapp']
  if (params.customer.email) notificationPrefs.push('email')

  const body: Record<string, any> = {
    external_id: params.externalId,
    amount: params.amount,
    description: params.description,
    currency: 'IDR',
    items: params.items,
    success_redirect_url: params.successRedirectUrl,
    failure_redirect_url: params.failureRedirectUrl,
    customer_notification_preference: {
      invoice_created: notificationPrefs,
      invoice_paid: notificationPrefs,
      invoice_reminder: notificationPrefs,
    },
    customer: {
      given_names: params.customer.name,
      surname: '',
      mobile_number: params.customer.phone,
    },
  }

  if (params.customer.email) {
    body.payer_email = params.customer.email
    body.customer.email = params.customer.email
  }

  return xenditFetch('/v2/invoices', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function createXenditRefund(params: {
  paymentId: string
  amount: number
  reason?: string
}): Promise<XenditRefund> {
  return xenditFetch('/refunds', {
    method: 'POST',
    body: JSON.stringify({
      payment_id: params.paymentId,
      amount: params.amount,
      reason: params.reason || 'REQUEST_BY_CUSTOMER',
    }),
  })
}
