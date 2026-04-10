import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import EventsList from './EventsList';
import { useSessionStore } from '../store/sessionStore';

describe('EventsList', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useSessionStore.setState({
      mode: 'guest',
      studioJwt: null,
      galleryToken: 'guest-token',
      studioSlug: 'mppf-photography',
      weddingSlug: 'umesh-and-shruti',
      currentStudio: { id: 'studio-1', studio_name: 'MPPF Photography', slug: 'mppf-photography' },
      currentWedding: { id: 'wedding-1', slug: 'umesh-and-shruti', couple_name: 'Umesh & Shruti' },
      loading: false,
      error: null,
    });
  });

  it('loads ceremonies from the guest gallery API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: [
          {
            id: 'ceremony-1',
            slug: 'engagement',
            name: 'Engagement',
            scheduled_at: '2026-02-08T12:00:00.000Z',
            photo_count: 24,
            cover_image_url: 'https://example.com/engagement.jpg',
          },
        ],
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter>
        <EventsList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/ceremonies',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    expect(await screen.findByText('Engagement')).toBeInTheDocument();
    expect(screen.getAllByText('24 photos').length).toBeGreaterThan(0);
  });
});
