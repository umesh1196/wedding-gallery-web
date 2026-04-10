import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EventAlbums from './EventAlbums';
import { FeedbackProvider } from '../components/FeedbackProvider';
import { useSessionStore } from '../store/sessionStore';
import { useViewerStore } from '../store/viewerStore';

describe('EventAlbums', () => {
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

  it('loads chapter albums from the guest backend', async () => {
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
              photo_count: 12,
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
              id: 'album-1',
              slug: 'family',
              name: 'Family',
              photos_count: 3,
              album_type: 'user_created',
            },
          ],
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <MemoryRouter initialEntries={['/event/engagement/albums']}>
          <Routes>
            <Route path="/event/:id/albums" element={<EventAlbums />} />
          </Routes>
        </MemoryRouter>
      </FeedbackProvider>
    );

    expect(await screen.findByText('Engagement')).toBeInTheDocument();
    expect(await screen.findByText('Family')).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/ceremonies/engagement/albums',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });
  });

  it('creates a new album and shows it immediately', async () => {
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
              photo_count: 12,
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
          data: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: {
            id: 'album-2',
            slug: 'cousins',
            name: 'Cousins',
            photos_count: 0,
            album_type: 'user_created',
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <MemoryRouter initialEntries={['/event/engagement/albums']}>
          <Routes>
            <Route path="/event/:id/albums" element={<EventAlbums />} />
          </Routes>
        </MemoryRouter>
      </FeedbackProvider>
    );

    expect(await screen.findByText('Engagement')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /start a collection/i }));
    fireEvent.change(screen.getByPlaceholderText('Name this collection...'), {
      target: { value: 'Cousins' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Cousins')).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/ceremonies/engagement/albums',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
    });
  });
});
