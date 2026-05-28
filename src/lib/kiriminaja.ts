export const KA_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

function getBaseUrl() {
  return process.env.KIRIMINAJA_ENV === 'production'
    ? 'https://client.kiriminaja.com'
    : 'https://tdev.kiriminaja.com'
}

export async function kaPost(path: string, body: unknown) {
  const headers: Record<string, string> = { ...KA_HEADERS }
  const key = process.env.KIRIMINAJA_API_KEY
  if (key) {
    headers.Authorization = `Bearer ${key}`
  }
  const res = await fetch(`${getBaseUrl()}/api/v1${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`KiriminAja ${res.status}: ${text}`)
  }
  return res.json()
}
