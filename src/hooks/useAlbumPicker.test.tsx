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

  it('loads print albums and adds selected photos to an existing bucket', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'bucket-1',
              slug: 'bride-side-album',
              name: 'Bride Side Album',
              selected_count: 1,
              selection_limit: 10,
              remaining_count: 9,
              locked: false,
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
            id: 'bucket-1',
            slug: 'bride-side-album',
            name: 'Bride Side Album',
            selected_count: 2,
            selection_limit: 10,
            remaining_count: 8,
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
              id: 'bucket-1',
              slug: 'bride-side-album',
              name: 'Bride Side Album',
              selected_count: 2,
              selection_limit: 10,
              remaining_count: 8,
              locked: false,
            },
          ],
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useAlbumPicker());

    await waitFor(() => {
      expect(result.current.editableAlbums).toHaveLength(1);
    });

    act(() => {
      result.current.openPicker(['photo-1']);
      result.current.toggleAlbum('bucket-1');
    });

    await act(async () => {
      await result.current.submitSelection();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:3000/api/v1/g/mppf-photography/umesh-and-shruti/print_selection_buckets/bride-side-album/photos',
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
