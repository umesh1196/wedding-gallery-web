import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminDashboard from './AdminDashboard';
import { useSessionStore } from '../../store/sessionStore';
import { FeedbackProvider } from '../../components/FeedbackProvider';

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useSessionStore.setState({
      mode: 'admin',
      studioJwt: 'studio-jwt',
      galleryToken: null,
      studioSlug: 'studio-slug',
      weddingSlug: null,
      currentStudio: {
        id: 'studio-1',
        studio_name: 'Studio Name',
        slug: 'studio-slug',
        color_primary: '#112233',
        color_accent: '#c9a96e',
      },
      currentWedding: null,
      loading: false,
      error: null,
    });
  });

  it('submits studio settings updates and refreshes the store', async () => {
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
          data: {
            studio: {
              id: 'studio-1',
              studio_name: 'Studio Name Updated',
              slug: 'studio-name-updated',
              color_primary: '#445566',
              color_accent: '#c9a96e',
            },
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <AdminDashboard />
      </FeedbackProvider>
    );

    const nameInput = screen.getByLabelText(/studio name/i);
    const slugInput = screen.getByLabelText(/studio slug/i);
    const primaryColorInput = screen.getByLabelText(/primary color/i);

    fireEvent.change(nameInput, { target: { value: 'Studio Name Updated' } });
    fireEvent.change(slugInput, { target: { value: 'studio-name-updated' } });
    fireEvent.change(primaryColorInput, { target: { value: '#445566' } });

    fireEvent.click(screen.getByRole('button', { name: /save settings/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/studio',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.any(Headers),
        })
      );
    });

    const [, init] = fetchMock.mock.calls[1];
    expect(init.body).toBe(
      JSON.stringify({
        studio: {
          studio_name: 'Studio Name Updated',
          slug: 'studio-name-updated',
          color_primary: '#445566',
          color_accent: '#c9a96e',
        },
      })
    );

    await waitFor(() => {
      expect(useSessionStore.getState().currentStudio?.studio_name).toBe('Studio Name Updated');
      expect(screen.getByText(/settings saved/i)).toBeInTheDocument();
    });
  });

  it('loads weddings and creates a new wedding from the admin shell', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'wedding-1',
              slug: 'shruti-umesh',
              couple_name: 'Shruti & Umesh',
              wedding_date: '2026-02-10',
              allow_download: 'shortlist',
              allow_comments: true,
              expired: false,
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
            id: 'wedding-2',
            slug: 'priya-arjun',
            couple_name: 'Priya & Arjun',
            wedding_date: '2026-12-31',
            allow_download: 'all',
            allow_comments: true,
            expired: false,
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <AdminDashboard />
      </FeedbackProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Shruti & Umesh')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/couple names/i), {
      target: { value: 'Priya & Arjun' },
    });
    fireEvent.change(screen.getByLabelText(/wedding date/i), {
      target: { value: '2026-12-31' },
    });
    fireEvent.change(screen.getByLabelText(/gallery expiry date/i), {
      target: { value: '2027-12-31' },
    });
    fireEvent.change(screen.getByLabelText(/gallery password/i), {
      target: { value: 'gallery123' },
    });
    fireEvent.change(screen.getByLabelText(/download policy/i), {
      target: { value: 'all' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create wedding/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/weddings',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
    });

    const [, postInit] = fetchMock.mock.calls[1];
    expect(postInit.body).toBe(
      JSON.stringify({
        wedding: {
          couple_name: 'Priya & Arjun',
          wedding_date: '2026-12-31',
          password: 'gallery123',
          expires_at: '2027-12-31T00:00:00.000Z',
          allow_download: 'all',
          allow_comments: true,
        },
      })
    );

    await waitFor(() => {
      expect(screen.getByText('Priya & Arjun')).toBeInTheDocument();
      expect(screen.getByText(/wedding created/i)).toBeInTheDocument();
    });
  });

  it('loads wedding detail and saves wedding updates from the admin shell', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'wedding-1',
              slug: 'shruti-umesh',
              couple_name: 'Shruti & Umesh',
              wedding_date: '2026-02-10',
              allow_download: 'shortlist',
              allow_comments: true,
              expired: false,
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
            id: 'wedding-1',
            slug: 'shruti-umesh',
            couple_name: 'Shruti & Umesh',
            wedding_date: '2026-02-10',
            allow_download: 'shortlist',
            allow_comments: true,
            expired: false,
          },
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
            id: 'wedding-1',
            slug: 'shruti-umesh-updated',
            couple_name: 'Shruti & Umesh Updated',
            wedding_date: '2026-02-11',
            allow_download: 'all',
            allow_comments: false,
            expired: false,
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <AdminDashboard />
      </FeedbackProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Shruti & Umesh')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /manage wedding/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/weddings/shruti-umesh',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/weddings/shruti-umesh/ceremonies',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    const editCoupleNamesInput = await screen.findByLabelText(/edit couple names/i);

    await waitFor(() => {
      expect(editCoupleNamesInput).toHaveValue('Shruti & Umesh');
    });

    fireEvent.change(editCoupleNamesInput, {
      target: { value: 'Shruti & Umesh Updated' },
    });
    fireEvent.change(screen.getByLabelText(/edit wedding date/i), {
      target: { value: '2026-02-11' },
    });
    fireEvent.change(screen.getByLabelText(/new gallery password/i), {
      target: { value: '1234' },
    });
    fireEvent.change(screen.getByLabelText(/edit download policy/i), {
      target: { value: 'all' },
    });
    fireEvent.click(screen.getByLabelText(/disable guest comments/i));

    fireEvent.click(screen.getByRole('button', { name: /save wedding changes/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/weddings/shruti-umesh',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.any(Headers),
        })
      );
    });

    const [, patchInit] = fetchMock.mock.calls[3];
    expect(patchInit.body).toBe(
      JSON.stringify({
        wedding: {
          couple_name: 'Shruti & Umesh Updated',
          wedding_date: '2026-02-11',
          password: '1234',
          allow_download: 'all',
          allow_comments: false,
        },
      })
    );

    await waitFor(() => {
      expect(screen.getAllByText('Shruti & Umesh Updated').length).toBeGreaterThan(0);
      expect(screen.getByText(/wedding updated/i)).toBeInTheDocument();
    });
  });

  it('loads chapters for the selected wedding and creates a new chapter', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'wedding-1',
              slug: 'shruti-umesh',
              couple_name: 'Shruti & Umesh',
              wedding_date: '2026-02-10',
              allow_download: 'shortlist',
              allow_comments: true,
              expired: false,
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
            id: 'wedding-1',
            slug: 'shruti-umesh',
            couple_name: 'Shruti & Umesh',
            wedding_date: '2026-02-10',
            allow_download: 'shortlist',
            allow_comments: true,
            expired: false,
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
              id: 'ceremony-1',
              slug: 'haldi',
              name: 'Haldi',
              scheduled_at: '2026-02-08T19:00:00Z',
              description: 'Yellow ceremony',
              photo_count: 10,
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
            id: 'ceremony-2',
            slug: 'mehendi',
            name: 'Mehendi',
            scheduled_at: '2026-02-09T18:00:00Z',
            description: 'Henna evening',
            photo_count: 0,
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <AdminDashboard />
      </FeedbackProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Shruti & Umesh')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /manage wedding/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/weddings/shruti-umesh/ceremonies',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Haldi')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/chapter name/i), {
      target: { value: 'Mehendi' },
    });
    fireEvent.change(screen.getByLabelText(/chapter date/i), {
      target: { value: '2026-02-09T18:00' },
    });
    fireEvent.change(screen.getByLabelText(/chapter description/i), {
      target: { value: 'Henna evening' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create chapter/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/weddings/shruti-umesh/ceremonies',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
    });

    const [, postInit] = fetchMock.mock.calls[3];
    expect(postInit.body).toBe(
      JSON.stringify({
        ceremony: {
          name: 'Mehendi',
          scheduled_at: '2026-02-09T18:00',
          description: 'Henna evening',
        },
      })
    );

    await waitFor(() => {
      expect(screen.getByText('Mehendi')).toBeInTheDocument();
      expect(screen.getByText(/chapter created/i)).toBeInTheDocument();
    });
  });

  it('loads a chapter, updates it, and deletes it', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'wedding-1',
              slug: 'shruti-umesh',
              couple_name: 'Shruti & Umesh',
              wedding_date: '2026-02-10',
              allow_download: 'shortlist',
              allow_comments: true,
              expired: false,
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
            id: 'wedding-1',
            slug: 'shruti-umesh',
            couple_name: 'Shruti & Umesh',
            wedding_date: '2026-02-10',
            allow_download: 'shortlist',
            allow_comments: true,
            expired: false,
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
              id: 'ceremony-1',
              slug: 'haldi',
              name: 'Haldi',
              scheduled_at: '2026-02-08T19:00:00Z',
              description: 'Yellow ceremony',
              photo_count: 10,
            },
            {
              id: 'ceremony-2',
              slug: 'mehendi',
              name: 'Mehendi',
              scheduled_at: '2026-02-09T18:00:00Z',
              description: 'Henna evening',
              photo_count: 0,
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
            id: 'ceremony-1',
            slug: 'haldi',
            name: 'Haldi',
            scheduled_at: '2026-02-08T19:00:00Z',
            description: 'Yellow ceremony',
            photo_count: 10,
          },
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
            id: 'ceremony-1',
            slug: 'haldi-updated',
            name: 'Haldi Updated',
            scheduled_at: '2026-02-08T20:00:00Z',
            description: 'Updated chapter',
            photo_count: 10,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: {
            id: 'ceremony-1',
            slug: 'haldi-updated',
            name: 'Haldi Updated',
            scheduled_at: '2026-02-08T20:00:00Z',
            description: 'Updated chapter',
            photo_count: 10,
          },
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
            id: 'ceremony-1',
            slug: 'haldi-updated',
            name: 'Haldi Updated',
            scheduled_at: '2026-02-08T20:00:00Z',
            description: 'Updated chapter',
            photo_count: 10,
          },
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
          data: { deleted: true },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <AdminDashboard />
      </FeedbackProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Shruti & Umesh')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /manage wedding/i }));

    await waitFor(() => {
      expect(screen.getByText('Haldi')).toBeInTheDocument();
      expect(screen.getByText('Mehendi')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('button', { name: /manage chapter/i })[0]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/weddings/shruti-umesh/ceremonies/haldi',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    const editChapterNameInput = await screen.findByLabelText(/edit chapter name/i);
    fireEvent.change(editChapterNameInput, {
      target: { value: 'Haldi Updated' },
    });
    fireEvent.change(screen.getByLabelText(/edit chapter date/i), {
      target: { value: '2026-02-08T20:00' },
    });
    fireEvent.change(screen.getByLabelText(/edit chapter description/i), {
      target: { value: 'Updated chapter' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save chapter changes/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/weddings/shruti-umesh/ceremonies/haldi',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.any(Headers),
        })
      );
    });

    const [, patchInit] = fetchMock.mock.calls[5];
    expect(patchInit.body).toBe(
      JSON.stringify({
        ceremony: {
          name: 'Haldi Updated',
          scheduled_at: '2026-02-08T20:00',
          description: 'Updated chapter',
        },
      })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/weddings/shruti-umesh/ceremonies/haldi-updated',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    fireEvent.click(screen.getByRole('button', { name: /delete chapter/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/weddings/shruti-umesh/ceremonies/haldi-updated',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.any(Headers),
        })
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Haldi Updated')).not.toBeInTheDocument();
      expect(screen.getByText(/chapter deleted/i)).toBeInTheDocument();
    });
  });

  it('loads chapter photos and uploads a new photo through presign and confirm', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'wedding-1',
              slug: 'shruti-umesh',
              couple_name: 'Shruti & Umesh',
              wedding_date: '2026-02-10',
              allow_download: 'shortlist',
              allow_comments: true,
              expired: false,
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
            id: 'wedding-1',
            slug: 'shruti-umesh',
            couple_name: 'Shruti & Umesh',
            wedding_date: '2026-02-10',
            allow_download: 'shortlist',
            allow_comments: true,
            expired: false,
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
              id: 'ceremony-1',
              slug: 'haldi',
              name: 'Haldi',
              scheduled_at: '2026-02-08T19:00:00Z',
              description: 'Yellow ceremony',
              photo_count: 10,
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
            id: 'ceremony-1',
            slug: 'haldi',
            name: 'Haldi',
            scheduled_at: '2026-02-08T19:00:00Z',
            description: 'Yellow ceremony',
            photo_count: 10,
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
              original_filename: 'existing.jpg',
              processing_status: 'ready',
              thumbnail_url: 'https://cdn.example.com/existing-thumb.jpg',
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
              photo_id: 'photo-2',
              presigned_url: 'https://uploads.example.com/presigned/photo-2',
              object_key: 'photos/photo-2/original.jpg',
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: {
            id: 'photo-2',
            original_filename: 'new-upload.jpg',
            processing_status: 'pending',
            thumbnail_url: 'https://cdn.example.com/new-thumb.jpg',
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <AdminDashboard />
      </FeedbackProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Shruti & Umesh')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /manage wedding/i }));
    fireEvent.click(await screen.findByRole('button', { name: /manage chapter/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/weddings/shruti-umesh/ceremonies/haldi/photos',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('existing.jpg')).toBeInTheDocument();
    });

    const file = new File(['photo-bytes'], 'new-upload.jpg', { type: 'image/jpeg' });
    const uploadInput = screen.getByLabelText(/upload chapter photos/i) as HTMLInputElement;
    fireEvent.change(uploadInput, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /upload photos/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/weddings/shruti-umesh/ceremonies/haldi/photos/presign',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
    });

    const [, presignInit] = fetchMock.mock.calls[5];
    expect(presignInit.body).toBe(
      JSON.stringify({
        files: [
          {
            filename: 'new-upload.jpg',
            content_type: 'image/jpeg',
            byte_size: file.size,
          },
        ],
      })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'https://uploads.example.com/presigned/photo-2',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/photos/photo-2/confirm',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('new-upload.jpg')).toBeInTheDocument();
      expect(screen.getByText(/photos uploaded/i)).toBeInTheDocument();
    });
  });

  it('sets a photo as cover and deletes another photo from the chapter list', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'wedding-1',
              slug: 'shruti-umesh',
              couple_name: 'Shruti & Umesh',
              wedding_date: '2026-02-10',
              allow_download: 'shortlist',
              allow_comments: true,
              expired: false,
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
            id: 'wedding-1',
            slug: 'shruti-umesh',
            couple_name: 'Shruti & Umesh',
            wedding_date: '2026-02-10',
            allow_download: 'shortlist',
            allow_comments: true,
            expired: false,
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
              id: 'ceremony-1',
              slug: 'haldi',
              name: 'Haldi',
              scheduled_at: '2026-02-08T19:00:00Z',
              description: 'Yellow ceremony',
              photo_count: 2,
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
            id: 'ceremony-1',
            slug: 'haldi',
            name: 'Haldi',
            scheduled_at: '2026-02-08T19:00:00Z',
            description: 'Yellow ceremony',
            photo_count: 2,
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
              original_filename: 'cover.jpg',
              processing_status: 'ready',
              is_cover: false,
            },
            {
              id: 'photo-2',
              original_filename: 'remove.jpg',
              processing_status: 'ready',
              is_cover: false,
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
            original_filename: 'cover.jpg',
            processing_status: 'ready',
            is_cover: true,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: {
            id: 'photo-2',
            deleted: true,
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <AdminDashboard />
      </FeedbackProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Shruti & Umesh')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /manage wedding/i }));
    fireEvent.click(await screen.findByRole('button', { name: /manage chapter/i }));

    await waitFor(() => {
      expect(screen.getByText('cover.jpg')).toBeInTheDocument();
      expect(screen.getByText('remove.jpg')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /set cover for cover\.jpg/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/photos/photo-1/set_cover',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText(/cover photo/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/cover updated/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /delete photo remove\.jpg/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/photos/photo-2',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.any(Headers),
        })
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('remove.jpg')).not.toBeInTheDocument();
      expect(screen.getByText(/photo deleted/i)).toBeInTheDocument();
    });
  });

  it('reorders photos within the selected chapter', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'wedding-1',
              slug: 'shruti-umesh',
              couple_name: 'Shruti & Umesh',
              wedding_date: '2026-02-10',
              allow_download: 'shortlist',
              allow_comments: true,
              expired: false,
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
            id: 'wedding-1',
            slug: 'shruti-umesh',
            couple_name: 'Shruti & Umesh',
            wedding_date: '2026-02-10',
            allow_download: 'shortlist',
            allow_comments: true,
            expired: false,
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
              id: 'ceremony-1',
              slug: 'haldi',
              name: 'Haldi',
              scheduled_at: '2026-02-08T19:00:00Z',
              description: 'Yellow ceremony',
              photo_count: 2,
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
            id: 'ceremony-1',
            slug: 'haldi',
            name: 'Haldi',
            scheduled_at: '2026-02-08T19:00:00Z',
            description: 'Yellow ceremony',
            photo_count: 2,
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
              original_filename: 'first.jpg',
              processing_status: 'ready',
              is_cover: false,
            },
            {
              id: 'photo-2',
              original_filename: 'second.jpg',
              processing_status: 'ready',
              is_cover: false,
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
              original_filename: 'second.jpg',
              processing_status: 'ready',
              is_cover: false,
            },
            {
              id: 'photo-1',
              original_filename: 'first.jpg',
              processing_status: 'ready',
              is_cover: false,
            },
          ],
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <AdminDashboard />
      </FeedbackProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Shruti & Umesh')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /manage wedding/i }));
    fireEvent.click(await screen.findByRole('button', { name: /manage chapter/i }));

    await waitFor(() => {
      expect(screen.getByText('first.jpg')).toBeInTheDocument();
      expect(screen.getByText('second.jpg')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /move photo second\.jpg up/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/weddings/shruti-umesh/ceremonies/haldi/photos/reorder',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.any(Headers),
        })
      );
    });

    const [, reorderInit] = fetchMock.mock.calls[5];
    expect(reorderInit.body).toBe(
      JSON.stringify({
        order: ['photo-2', 'photo-1'],
      })
    );

    await waitFor(() => {
      const photoTitles = screen
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent)
        .filter((text): text is string => text === 'first.jpg' || text === 'second.jpg');

      expect(photoTitles.slice(0, 2)).toEqual(['second.jpg', 'first.jpg']);
    });
  });

  it('retries failed photo import and processing actions from the chapter list', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'wedding-1',
              slug: 'shruti-umesh',
              couple_name: 'Shruti & Umesh',
              wedding_date: '2026-02-10',
              allow_download: 'shortlist',
              allow_comments: true,
              expired: false,
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
            id: 'wedding-1',
            slug: 'shruti-umesh',
            couple_name: 'Shruti & Umesh',
            wedding_date: '2026-02-10',
            allow_download: 'shortlist',
            allow_comments: true,
            expired: false,
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
              id: 'ceremony-1',
              slug: 'haldi',
              name: 'Haldi',
              scheduled_at: '2026-02-08T19:00:00Z',
              description: 'Yellow ceremony',
              photo_count: 2,
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
            id: 'ceremony-1',
            slug: 'haldi',
            name: 'Haldi',
            scheduled_at: '2026-02-08T19:00:00Z',
            description: 'Yellow ceremony',
            photo_count: 2,
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
              original_filename: 'import-failed.jpg',
              ingestion_status: 'failed',
              processing_status: 'pending',
            },
            {
              id: 'photo-2',
              original_filename: 'process-failed.jpg',
              ingestion_status: 'copied',
              processing_status: 'failed',
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
            original_filename: 'import-failed.jpg',
            ingestion_status: 'queued',
            processing_status: 'pending',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: {
            id: 'photo-2',
            original_filename: 'process-failed.jpg',
            ingestion_status: 'copied',
            processing_status: 'pending',
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <AdminDashboard />
      </FeedbackProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Shruti & Umesh')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /manage wedding/i }));
    fireEvent.click(await screen.findByRole('button', { name: /manage chapter/i }));

    await waitFor(() => {
      expect(screen.getByText('import-failed.jpg')).toBeInTheDocument();
      expect(screen.getByText('process-failed.jpg')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /retry import for import-failed\.jpg/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/photos/photo-1/retry_import',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
    });

    fireEvent.click(screen.getByRole('button', { name: /retry processing for process-failed\.jpg/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/photos/photo-2/retry_processing',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/import retry queued/i)).toBeInTheDocument();
      expect(screen.getByText(/processing retry queued/i)).toBeInTheDocument();
    });
  });

  it('uploads a chapter cover and refreshes the selected chapter details', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'wedding-1',
              slug: 'shruti-umesh',
              couple_name: 'Shruti & Umesh',
              wedding_date: '2026-02-10',
              allow_download: 'shortlist',
              allow_comments: true,
              expired: false,
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
            id: 'wedding-1',
            slug: 'shruti-umesh',
            couple_name: 'Shruti & Umesh',
            wedding_date: '2026-02-10',
            allow_download: 'shortlist',
            allow_comments: true,
            expired: false,
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
              id: 'ceremony-1',
              slug: 'haldi',
              name: 'Haldi',
              scheduled_at: '2026-02-08T19:00:00Z',
              description: 'Yellow ceremony',
              photo_count: 0,
              cover_image_url: null,
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
            id: 'ceremony-1',
            slug: 'haldi',
            name: 'Haldi',
            scheduled_at: '2026-02-08T19:00:00Z',
            description: 'Yellow ceremony',
            photo_count: 0,
            cover_image_url: null,
          },
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
            key: 'studios/studio-1/weddings/wedding-1/ceremonies/ceremony-1/cover.jpg',
            url: 'https://cdn.example.com/haldi-cover.jpg',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: {
            id: 'ceremony-1',
            slug: 'haldi',
            name: 'Haldi',
            scheduled_at: '2026-02-08T19:00:00Z',
            description: 'Yellow ceremony',
            photo_count: 0,
            cover_image_url: 'https://cdn.example.com/haldi-cover.jpg',
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackProvider>
        <AdminDashboard />
      </FeedbackProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Shruti & Umesh')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /manage wedding/i }));
    fireEvent.click(await screen.findByRole('button', { name: /manage chapter/i }));

    const file = new File(['cover-bytes'], 'haldi-cover.jpg', { type: 'image/jpeg' });
    const coverInput = (await screen.findByLabelText(/upload chapter cover/i)) as HTMLInputElement;
    fireEvent.change(coverInput, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /upload chapter cover/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/weddings/shruti-umesh/ceremonies/haldi/cover',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
    });

    const [, uploadInit] = fetchMock.mock.calls[5];
    expect(uploadInit.body).toBeInstanceOf(FormData);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:3000/api/v1/weddings/shruti-umesh/ceremonies/haldi',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/cover uploaded/i)).toBeInTheDocument();
      expect(screen.getByText(/haldi-cover\.jpg uploaded successfully/i)).toBeInTheDocument();
      expect(screen.getByAltText(/haldi cover preview/i)).toHaveAttribute(
        'src',
        'https://cdn.example.com/haldi-cover.jpg'
      );
    });
  });
});
