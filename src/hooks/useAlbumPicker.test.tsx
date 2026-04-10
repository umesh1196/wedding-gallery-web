import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAlbumPicker } from './useAlbumPicker';
import { useSessionStore } from '../store/sessionStore';

describe('useAlbumPicker', () => {
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

  it('loads albums and adds selected photos to an existing album', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'album-1',
              slug: 'our-picks',
              name: 'Our Picks',
              album_type: 'user_created',
              visibility: 'private',
              photos_count: 1,
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
            slug: 'our-picks',
            name: 'Our Picks',
            album_type: 'user_created',
            visibility: 'private',
            photos_count: 2,
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
              id: 'album-1',
              slug: 'our-picks',
              name: 'Our Picks',
              album_type: 'user_created',
              visibility: 'private',
              photos_count: 2,
            },
          ],
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useAlbumPicker('engagement'));

    await waitFor(() => {
      expect(result.current.editableAlbums).toHaveLength(1);
    });

    act(() => {
      result.current.openPicker(['photo-1']);
      result.current.toggleAlbum('album-1');
    });

    await act(async () => {
      await result.current.submitSelection();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/ceremonies/engagement/albums/our-picks/photos',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers),
        body: JSON.stringify({ photo_ids: ['photo-1'] }),
      })
    );

    await waitFor(() => {
      expect(result.current.editableAlbums[0]?.photoCount).toBe(2);
    });
  });
});
