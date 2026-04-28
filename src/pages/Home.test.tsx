import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Home from './Home';
import { useSessionStore } from '../store/sessionStore';

describe('Home guest access', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useSessionStore.setState({
      mode: null,
      studioJwt: null,
      galleryToken: null,
      guestIdentityToken: null,
      studioSlug: null,
      weddingSlug: null,
      currentStudio: null,
      currentWedding: null,
      loading: false,
      error: null,
    });
  });

  it('verifies gallery access and navigates to chapters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: {
          session_token: 'guest-token',
          guest_identity_token: 'guest-identity-token',
          gallery: {
            couple_name: 'Umesh & Shruti',
            wedding_date: '2026-02-10',
            hero_image_url: null,
            allow_download: 'all',
            allow_comments: true,
            branding: {
              slug: 'mppf-photography',
              studio_name: 'MPPF Photography',
              color_primary: '#c9506a',
              color_accent: '#c9506a',
            },
          },
        },
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<div>Chapters Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /private gallery/i }));

    fireEvent.change(screen.getByLabelText(/studio slug/i), {
      target: { value: 'mppf-photography' },
    });
    fireEvent.change(screen.getByLabelText(/wedding slug/i), {
      target: { value: 'umesh-and-shruti' },
    });
    fireEvent.change(screen.getByLabelText(/visitor name/i), {
      target: { value: 'Asha' },
    });
    fireEvent.change(screen.getByLabelText(/gallery password/i), {
      target: { value: 'gallery123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /enter gallery/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/verify',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe(
      JSON.stringify({
        password: 'gallery123',
        visitor_name: 'Asha',
        guest_identity_token: undefined,
      })
    );

    await waitFor(() => {
      expect(screen.getByText('Chapters Page')).toBeInTheDocument();
      expect(useSessionStore.getState().galleryToken).toBe('guest-token');
      expect(useSessionStore.getState().guestIdentityToken).toBe('guest-identity-token');
    });
  });
});
