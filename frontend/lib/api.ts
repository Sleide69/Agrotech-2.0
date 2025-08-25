export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const BASE = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8088'

export interface ApiOptions extends RequestInit {
  token?: string | null
}

async function request<T>(path: string, method: HttpMethod, body?: any, opts: ApiOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(opts.headers || {})
  }
  const token = opts.token
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    ...opts,
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || res.statusText
    throw new Error(msg)
  }
  return data as T
}

export const api = {
  get: <T>(path: string, opts?: ApiOptions) => request<T>(path, 'GET', undefined, opts),
  post: <T>(path: string, body?: any, opts?: ApiOptions) => request<T>(path, 'POST', body, opts),
  put:  <T>(path: string, body?: any, opts?: ApiOptions) => request<T>(path, 'PUT', body, opts),
  del:  <T>(path: string, opts?: ApiOptions) => request<T>(path, 'DELETE', undefined, opts),
}
