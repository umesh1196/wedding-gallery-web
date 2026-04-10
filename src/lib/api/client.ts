import { getApiBaseUrl } from './config';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions extends RequestInit {
  token?: string;
  galleryToken?: string;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function buildAdminHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function buildGalleryHeaders(galleryToken?: string) {
  return galleryToken ? { 'X-Gallery-Token': galleryToken } : {};
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, galleryToken, headers, body, ...init } = options;
  const requestHeaders = new Headers(headers);

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isFormData) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const adminHeaders = buildAdminHeaders(token);
  const galleryHeaders = buildGalleryHeaders(galleryToken);

  Object.entries({ ...adminHeaders, ...galleryHeaders }).forEach(([key, value]) => {
    if (value) requestHeaders.set(key, value);
  });

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    body,
    headers: requestHeaders,
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message || `Request failed with status ${response.status}`,
      response.status,
      payload?.error?.code
    );
  }

  return payload as T;
}
