const API_BASE = '/api/kiriminaja'

export interface PricingRequest {
  origin: number
  destination: number
  weight: number
  item_value: number
  courier?: string[]
}

export interface PricingResult {
  service: string
  service_name: string
  service_type: string
  cost: string
  etd: string
  cod: boolean
  group: string
  drop: boolean
}

export interface CreateOrderPackage {
  order_id: string
  destination_name: string
  destination_phone: string
  destination_address: string
  destination_kecamatan_id: number
  weight: number
  width: number
  length: number
  height: number
  item_value: number
  shipping_cost: number
  service: string
  service_type: string
  cod: number
  package_type_id: number
  item_name: string
  drop: boolean
  qty?: number
}

export interface CreateOrderRequest {
  address: string
  phone: string
  name: string
  kecamatan_id: number
  packages: CreateOrderPackage[]
}

export interface Courier {
  code: string
  name: string
  type: string
}

export interface KiriminAjaResponse<T = unknown> {
  status: boolean
  text: string
  method: string
  [key: string]: unknown
  details?: T
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`KiriminAja proxy error: ${res.status} — ${err}`)
  }
  return res.json()
}

export async function getPricing(
  req: PricingRequest,
): Promise<{ results: PricingResult[] }> {
  return post('/pricing', req)
}

export async function createOrder(
  req: CreateOrderRequest,
): Promise<KiriminAjaResponse> {
  return post('/create-order', req)
}

export async function getCouriers(): Promise<{ datas: Courier[] }> {
  return post('/couriers')
}

export async function getPickupSchedules(): Promise<{
  schedules: { clock: string; until: string; expired: number; libur: boolean }[]
}> {
  return post('/pickup-schedules')
}

export async function trackOrder(
  awb: string,
): Promise<KiriminAjaResponse> {
  return post('/tracking', { awb })
}

export async function cancelOrderKiriminAja(
  awb: string,
  reason: string,
): Promise<KiriminAjaResponse> {
  return post('/cancel', { awb, reason })
}

export async function getCreditBalance(): Promise<{ data: { balance: number } }> {
  return post('/credit')
}
