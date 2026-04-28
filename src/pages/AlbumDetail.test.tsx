import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AlbumDetail from './AlbumDetail';
import { FeedbackProvider } from '../components/FeedbackProvider';
import { useSessionStore } from '../store/sessionStore';

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
            selected_count: 1,
            selection_limit: 40,
            remaining_count: 39,
            locked: false,
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
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/print_selection_buckets/album-1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/print_selection_buckets/album-1/photos?limit=300',
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
            selected_count: 1,
            selection_limit: 40,
            remaining_count: 39,
            locked: false,
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
            selected_count: 0,
            selection_limit: 40,
            remaining_count: 40,
            locked: false,
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

    fireEvent.click(screen.getByRole('button', { name: /remove family-1.jpg from print album/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/print_selection_buckets/album-1/photos/photo-1',
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
