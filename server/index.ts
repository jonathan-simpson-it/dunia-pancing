import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const API_KEY = process.env.KIRIMINAJA_API_KEY || ''
const BASE_URL = process.env.KIRIMINAJA_ENV === 'production'
  ? 'https://client.kiriminaja.com'
  : 'https://tdev.kiriminaja.com'
const PORT = parseInt(process.env.PORT || '3001', 10)

const KA_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: `Bearer ${API_KEY}`,
}

async function kaPost(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    method: 'POST',
    headers: KA_HEADERS,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`KiriminAja ${res.status}: ${text}`)
  }
  return res.json()
}

app.post('/api/kiriminaja/pricing', async (req, res) => {
  try {
    const data = await kaPost('/shipping_price', req.body)
    res.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(502).json({ error: message })
  }
})

app.post('/api/kiriminaja/create-order', async (req, res) => {
  try {
    const data = await kaPost('/request_pickup', req.body)
    res.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(502).json({ error: message })
  }
})

app.get('/api/kiriminaja/couriers', async (_req, res) => {
  try {
    const data = await kaPost('/get_active_courier', {})
    res.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(502).json({ error: message })
  }
})

app.get('/api/kiriminaja/pickup-schedules', async (_req, res) => {
  try {
    const data = await kaPost('/schedules', {})
    res.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(502).json({ error: message })
  }
})

app.post('/api/kiriminaja/tracking', async (req, res) => {
  try {
    const data = await kaPost('/tracking', req.body)
    res.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(502).json({ error: message })
  }
})

app.post('/api/kiriminaja/cancel', async (req, res) => {
  try {
    const data = await kaPost('/void', req.body)
    res.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(502).json({ error: message })
  }
})

app.get('/api/kiriminaja/credit', async (_req, res) => {
  try {
    const data = await kaPost('/credit', {})
    res.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(502).json({ error: message })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.KIRIMINAJA_ENV || 'sandbox' })
})

app.listen(PORT, () => {
  console.log(`KiriminAja proxy running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.KIRIMINAJA_ENV || 'sandbox'}`)
  console.log(`API Key set: ${API_KEY ? 'yes' : 'no'}`)
})
