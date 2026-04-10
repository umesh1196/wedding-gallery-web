import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AlbumDetail from './AlbumDetail';
import { FeedbackProvider } from '../components/FeedbackProvider';
import { useSessionStore } from '../store/sessionStore';
import { useViewerStore } from '../store/viewerStore';

describe('AlbumDetail', () => {
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
      userAlbums: [
        {
          id: 'album-1',
          slug: 'family',
          title: 'Family',
          eventId: 'engagement',
          photoIds: ['photo-1'],
          photoCount: 1,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  });

  it('loads album detail and photos from the guest backend', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: {
            id: 'album-1',
            slug: 'family',
            name: 'Family',
            photos_count: 1,
            album_type: 'user_created',
          },
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
              original_filename: 'family-1.jpg',
              preview_url: 'https://example.com/family-1-preview.jpg',
              thumbnail_url: 'https://example.com/family-1-thumb.jpg',
            },
          ],
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <MemoryRouter initialEntries={['/event/engagement/albums/album-1']}>
          <Routes>
            <Route path="/event/:id/albums/:albumId" element={<AlbumDetail />} />
          </Routes>
        </MemoryRouter>
      </FeedbackProvider>
    );

    expect(await screen.findByText('Family')).toBeInTheDocument();
    expect(await screen.findByAltText('family-1.jpg')).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/ceremonies/engagement/albums/album-1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/ceremonies/engagement/albums/album-1/photos?limit=100',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });
  });

  it('removes a photo from the album via the backend', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: {
            id: 'album-1',
            slug: 'family',
            name: 'Family',
            photos_count: 1,
            album_type: 'user_created',
          },
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
              original_filename: 'family-1.jpg',
              preview_url: 'https://example.com/family-1-preview.jpg',
              thumbnail_url: 'https://example.com/family-1-thumb.jpg',
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: {
            id: 'album-1',
            slug: 'family',
            name: 'Family',
            photos_count: 0,
            album_type: 'user_created',
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <MemoryRouter initialEntries={['/event/engagement/albums/album-1']}>
          <Routes>
            <Route path="/event/:id/albums/:albumId" element={<AlbumDetail />} />
          </Routes>
        </MemoryRouter>
      </FeedbackProvider>
    );

    expect(await screen.findByAltText('family-1.jpg')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /remove family-1.jpg from album/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/ceremonies/engagement/albums/family/photos/photo-1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.any(Headers),
        })
      );
    });

    await waitFor(() => {
      expect(screen.queryByAltText('family-1.jpg')).not.toBeInTheDocument();
    });
  });
});
