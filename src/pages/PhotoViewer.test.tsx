import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PhotoViewer from './PhotoViewer';
import { useSessionStore } from '../store/sessionStore';
import { useViewerStore } from '../store/viewerStore';
import { FeedbackProvider } from '../components/FeedbackProvider';
import * as downloadModule from '../lib/download';

describe('PhotoViewer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(downloadModule, 'downloadPhoto').mockImplementation(() => {});
    useSessionStore.setState({
      mode: 'guest',
      studioJwt: null,
      galleryToken: 'guest-token',
      studioSlug: 'mppf-photography',
      weddingSlug: 'umesh-and-shruti',
      currentStudio: { id: 'studio-1', studio_name: 'MPPF Photography', slug: 'mppf-photography' },
      currentWedding: {
        id: 'wedding-1',
        slug: 'umesh-and-shruti',
        couple_name: 'Umesh & Shruti',
        allow_comments: true,
      },
      loading: false,
      error: null,
    });
    useViewerStore.setState({
      favouriteIds: [],
      userAlbums: [],
    });
  });

  it('loads the current photo from guest gallery APIs', async () => {
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
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/photo/photo-2',
              state: { backTo: '/event/engagement', backLabel: 'Photos', eventId: 'engagement' },
            },
          ]}
        >
          <Routes>
            <Route path="/photo/:id" element={<PhotoViewer />} />
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
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/ceremonies/engagement/photos?limit=200',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    expect(await screen.findByAltText('engagement-2.jpg')).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('can recover the photo by searching chapters when route state is missing', async () => {
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
              photo_count: 1,
              cover_image_url: 'https://example.com/engagement-cover.jpg',
            },
            {
              id: 'ceremony-2',
              slug: 'haldi',
              name: 'Haldi',
              scheduled_at: '2026-02-09T12:00:00.000Z',
              photo_count: 1,
              cover_image_url: 'https://example.com/haldi-cover.jpg',
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
              id: 'photo-2',
              ceremony_slug: 'haldi',
              original_filename: 'haldi-1.jpg',
              preview_url: 'https://example.com/photo-2-preview.jpg',
              thumbnail_url: 'https://example.com/photo-2-thumb.jpg',
            },
          ],
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <MemoryRouter initialEntries={['/photo/photo-2']}>
          <Routes>
            <Route path="/photo/:id" element={<PhotoViewer />} />
          </Routes>
        </MemoryRouter>
      </FeedbackProvider>
    );

    expect(await screen.findByAltText('haldi-1.jpg')).toBeInTheDocument();
  });

  it('downloads the original photo through the backend download endpoint', async () => {
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
              photo_count: 1,
              cover_image_url: 'https://example.com/engagement-cover.jpg',
            },
          ],
        }),
      })
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
              id: 'photo-1',
              ceremony_slug: 'engagement',
              original_filename: 'engagement-1.jpg',
              preview_url: 'https://example.com/photo-1-preview.jpg',
              thumbnail_url: 'https://example.com/photo-1-thumb.jpg',
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
            download_url: 'https://example.com/original.jpg',
            filename: 'engagement-1-original.jpg',
            expires_at: '2026-04-10T12:00:00Z',
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/photo/photo-1',
              state: { backTo: '/event/engagement', backLabel: 'Photos', eventId: 'engagement' },
            },
          ]}
        >
          <Routes>
            <Route path="/photo/:id" element={<PhotoViewer />} />
          </Routes>
        </MemoryRouter>
      </FeedbackProvider>
    );

    expect(await screen.findByAltText('engagement-1.jpg')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save photo' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/photos/photo-1/download',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    expect(downloadModule.downloadPhoto).toHaveBeenCalledWith(
      'https://example.com/original.jpg',
      'engagement-1-original.jpg'
    );
  });

  it('likes a photo through the guest API', async () => {
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
            id: 'photo-1',
            liked: true,
            shortlisted: false,
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/photo/photo-1',
              search: '?event=engagement',
            },
          ]}
        >
          <Routes>
            <Route path="/photo/:id" element={<PhotoViewer />} />
          </Routes>
        </MemoryRouter>
      </FeedbackProvider>
    );

    expect(await screen.findByAltText('engagement-1.jpg')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Add to favourites'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/photos/photo-1/like',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
    });

    expect(useViewerStore.getState().favouriteIds).toContain('photo-1');
  });

  it('creates a comment from the viewer details panel', async () => {
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
            id: 'comment-1',
            body: 'Love this frame',
            visitor_name: 'Asha',
            created_at: '2026-04-09T18:00:00.000Z',
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <MemoryRouter initialEntries={['/photo/photo-1?event=engagement']}>
          <Routes>
            <Route path="/photo/:id" element={<PhotoViewer />} />
          </Routes>
        </MemoryRouter>
      </FeedbackProvider>
    );

    expect(await screen.findByAltText('engagement-1.jpg')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Show details'));
    fireEvent.change(screen.getByPlaceholderText('Add a comment...'), {
      target: { value: 'Love this frame' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/photos/photo-1/comments',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
          body: JSON.stringify({
            comment: { body: 'Love this frame' },
          }),
        })
      );
    });

    expect(await screen.findByText('Love this frame')).toBeInTheDocument();
  });
});
