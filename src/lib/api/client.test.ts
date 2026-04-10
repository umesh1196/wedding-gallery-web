import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './client';

describe('apiRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not force application/json for FormData uploads', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, data: { ok: true } }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const formData = new FormData();
    formData.append('file', new File(['cover-bytes'], 'cover.jpg', { type: 'image/jpeg' }));

    await apiRequest('/api/v1/test-upload', {
      method: 'POST',
      token: 'studio-jwt',
      body: formData,
    });

    const [, init] = fetchMock.mock.calls[0];
    const headers = init.headers as Headers;

    expect(headers.get('Content-Type')).toBeNull();
    expect(headers.get('Authorization')).toBe('Bearer studio-jwt');
    expect(init.body).toBe(formData);
  });
});
