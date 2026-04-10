import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Saved from './Saved';
import { useSessionStore } from '../store/sessionStore';
import { useViewerStore } from '../store/viewerStore';

describe('Saved', () => {
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
    useViewerStore.setState({
      favouriteIds: [],
      userAlbums: [],
    });
  });

  it('loads liked photos from the guest API', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
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
              photo_count: 2,
              cover_image_url: 'https://example.com/engagement-cover.jpg',
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'photo-1',
              ceremony_slug: 'engagement',
              original_filename: 'engagement-1.jpg',
              preview_url: 'https://example.com/photo-1-preview.jpg',
              thumbnail_url: 'https://example.com/photo-1-thumb.jpg',
              is_liked: true,
            },
          ],
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter>
        <Saved />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/likes',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    expect(await screen.findByText('Engagement')).toBeInTheDocument();
    expect(screen.getByText(/1 saved photo/i)).toBeInTheDocument();
    expect(useViewerStore.getState().favouriteIds).toContain('photo-1');
  });
});
