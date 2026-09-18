const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const DEFAULT_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT || 10000);

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function setToken(token) {
  if (token) localStorage.setItem('anxiang_token', token);
  else localStorage.removeItem('anxiang_token');
}

export async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);
  const token = localStorage.getItem('anxiang_token');
  const headers = { Accept: 'application/json', ...options.headers };
  if (options.body !== undefined && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body: options.body instanceof FormData ? options.body : options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
    const type = response.headers.get('content-type') || '';
    const payload = type.includes('application/json') ? await response.json() : await response.text();
    if (!response.ok) throw new ApiError(payload?.message || `请求失败（${response.status}）`, response.status, payload);
    if (payload && typeof payload === 'object' && 'code' in payload && ![0, 200].includes(payload.code)) {
      throw new ApiError(payload.message || '业务请求失败', response.status, payload);
    }
    return payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;
  } catch (error) {
    if (error.name === 'AbortError') throw new ApiError('请求超时，请稍后重试');
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message || '网络连接失败');
  } finally {
    clearTimeout(timeout);
  }
}

export const http = {
  get(path, params = {}) {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value != null));
    return request(`${path}${query.size ? `?${query}` : ''}`);
  },
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
