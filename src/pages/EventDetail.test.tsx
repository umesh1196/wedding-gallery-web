import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EventDetail from './EventDetail';
import { useSessionStore } from '../store/sessionStore';
import { FeedbackProvider } from '../components/FeedbackProvider';
import * as downloadModule from '../lib/download';

describe('EventDetail', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.spyOn(downloadModule, 'downloadPhoto').mockImplementation(() => {});
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

  it('loads a chapter and its photos from the guest APIs', async () => {
    const fetchMock = vi
      .fn()
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
            },
            {
              id: 'photo-2',
              ceremony_slug: 'engagement',
              original_filename: 'engagement-2.jpg',
              preview_url: 'https://example.com/photo-2-preview.jpg',
              thumbnail_url: 'https://example.com/photo-2-thumb.jpg',
            },
          ],
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <MemoryRouter initialEntries={['/event/engagement']}>
          <Routes>
            <Route path="/event/:id" element={<EventDetail />} />
          </Routes>
        </MemoryRouter>
      </FeedbackProvider>
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

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/ceremonies/engagement/photos?limit=20',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    expect(await screen.findByText('Engagement')).toBeInTheDocument();
    expect(screen.getByAltText('engagement-2.jpg')).toBeInTheDocument();
  });

  it('keeps a single photo visible in the grid so it can still be opened', async () => {
    const fetchMock = vi
      .fn()
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
          data: [
            {
              id: 'ceremony-1',
              slug: 'engagement',
              name: 'Engagement',
              scheduled_at: '2026-02-08T12:00:00.000Z',
              photo_count: 1,
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
            },
          ],
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <MemoryRouter initialEntries={['/event/engagement']}>
          <Routes>
            <Route path="/event/:id" element={<EventDetail />} />
          </Routes>
        </MemoryRouter>
      </FeedbackProvider>
    );

    expect(await screen.findAllByAltText('engagement-1.jpg')).not.toHaveLength(0);
    const photoLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href') === '/photo/photo-1?event=engagement');
    expect(photoLinks.length).toBeGreaterThan(0);
  });

  it('links chapter photos to the viewer with chapter context', async () => {
    const fetchMock = vi
      .fn()
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
              download_url: 'https://example.com/photo-1-download.jpg',
            },
            {
              id: 'photo-2',
              ceremony_slug: 'engagement',
              original_filename: 'engagement-2.jpg',
              preview_url: 'https://example.com/photo-2-preview.jpg',
              thumbnail_url: 'https://example.com/photo-2-thumb.jpg',
              download_url: 'https://example.com/photo-2-download.jpg',
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
          data: [],
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
              download_url: 'https://example.com/photo-1-download.jpg',
            },
            {
              id: 'photo-2',
              ceremony_slug: 'engagement',
              original_filename: 'engagement-2.jpg',
              preview_url: 'https://example.com/photo-2-preview.jpg',
              thumbnail_url: 'https://example.com/photo-2-thumb.jpg',
              download_url: 'https://example.com/photo-2-download.jpg',
            },
          ],
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <MemoryRouter initialEntries={['/event/engagement']}>
          <Routes>
            <Route path="/event/:id" element={<EventDetail />} />
          </Routes>
        </MemoryRouter>
      </FeedbackProvider>
    );

    const photoLink = await screen.findByRole('link', { name: 'engagement-2.jpg' });
    expect(photoLink.getAttribute('href')).toBe('/photo/photo-2?event=engagement');
  });

  it('loads additional chapter photos when the backend returns a cursor', async () => {
    const fetchMock = vi
      .fn()
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
          data: [
            {
              id: 'ceremony-1',
              slug: 'engagement',
              name: 'Engagement',
              scheduled_at: '2026-02-08T12:00:00.000Z',
              photo_count: 3,
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
            },
            {
              id: 'photo-2',
              ceremony_slug: 'engagement',
              original_filename: 'engagement-2.jpg',
              preview_url: 'https://example.com/photo-2-preview.jpg',
              thumbnail_url: 'https://example.com/photo-2-thumb.jpg',
            },
          ],
          meta: {
            next_cursor: 'cursor-2',
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
              id: 'photo-3',
              ceremony_slug: 'engagement',
              original_filename: 'engagement-3.jpg',
              preview_url: 'https://example.com/photo-3-preview.jpg',
              thumbnail_url: 'https://example.com/photo-3-thumb.jpg',
            },
          ],
          meta: {},
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <MemoryRouter initialEntries={['/event/engagement']}>
          <Routes>
            <Route path="/event/:id" element={<EventDetail />} />
          </Routes>
        </MemoryRouter>
      </FeedbackProvider>
    );

    expect(await screen.findByText('Engagement')).toBeInTheDocument();
    const loadMoreButton = await screen.findByRole('button', { name: 'Load more' });

    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/ceremonies/engagement/photos?limit=20&cursor=cursor-2',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    expect(await screen.findByAltText('engagement-3.jpg')).toBeInTheDocument();
  });

  it('supports hold-to-select with batch like actions', async () => {
    const fetchMock = vi
      .fn()
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
          data: [
            {
              id: 'ceremony-1',
              slug: 'engagement',
              name: 'Engagement',
              scheduled_at: '2026-02-08T12:00:00.000Z',
              photo_count: 3,
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
              is_liked: false,
            },
            {
              id: 'photo-2',
              ceremony_slug: 'engagement',
              original_filename: 'engagement-2.jpg',
              preview_url: 'https://example.com/photo-2-preview.jpg',
              thumbnail_url: 'https://example.com/photo-2-thumb.jpg',
              is_liked: false,
            },
            {
              id: 'photo-3',
              ceremony_slug: 'engagement',
              original_filename: 'engagement-3.jpg',
              preview_url: 'https://example.com/photo-3-preview.jpg',
              thumbnail_url: 'https://example.com/photo-3-thumb.jpg',
              is_liked: false,
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
            id: 'photo-2',
            liked: true,
            shortlisted: false,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: {
            id: 'photo-3',
            liked: true,
            shortlisted: false,
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <MemoryRouter initialEntries={['/event/engagement']}>
          <Routes>
            <Route path="/event/:id" element={<EventDetail />} />
          </Routes>
        </MemoryRouter>
      </FeedbackProvider>
    );

    const firstSelectablePhoto = await screen.findByAltText('engagement-2.jpg');
    fireEvent.pointerDown(firstSelectablePhoto);
    await new Promise((resolve) => setTimeout(resolve, 650));

    expect(await screen.findByRole('button', { name: 'Like selected photos' })).toBeInTheDocument();

    fireEvent.click(screen.getByAltText('engagement-3.jpg'));
    fireEvent.click(screen.getByRole('button', { name: 'Like selected photos' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/photos/photo-2/like',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/photos/photo-3/like',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
    });
  }, 10000);

  it('creates a selected-photos ZIP download for multi-select', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: [] }),
      })
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
              is_liked: false,
            },
            {
              id: 'photo-2',
              ceremony_slug: 'engagement',
              original_filename: 'engagement-2.jpg',
              preview_url: 'https://example.com/photo-2-preview.jpg',
              thumbnail_url: 'https://example.com/photo-2-thumb.jpg',
              is_liked: false,
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
            id: 'download-1',
            status: 'queued',
            filename: 'selected.zip',
            scope_type: 'selected_photos',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: {
            id: 'download-1',
            status: 'ready',
            filename: 'selected.zip',
            scope_type: 'selected_photos',
            download_url: 'https://example.com/selected.zip',
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <MemoryRouter initialEntries={['/event/engagement']}>
          <Routes>
            <Route path="/event/:id" element={<EventDetail />} />
          </Routes>
        </MemoryRouter>
      </FeedbackProvider>
    );

    const firstSelectablePhoto = await screen.findByAltText('engagement-2.jpg');
    fireEvent.pointerDown(firstSelectablePhoto);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 650));
    });

    fireEvent.click(screen.getByRole('button', { name: 'Download selected' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/downloads',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
    });

    await waitFor(() => {
      expect(downloadModule.downloadPhoto).toHaveBeenCalledWith(
        'https://example.com/selected.zip',
        'selected.zip'
      );
    });
  }, 10000);
});
