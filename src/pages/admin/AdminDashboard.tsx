import { useEffect, useState, type FormEvent } from 'react';
import { useSessionStore } from '../../store/sessionStore';
import {
  createCeremony,
  createWedding,
  deletePhoto,
  confirmPhotoUpload,
  deleteCeremony,
  fetchCeremony,
  fetchCeremonies,
  fetchPhotos,
  fetchWedding,
  fetchWeddings,
  presignPhotoUploads,
  reorderPhotos,
  reorderCeremonies,
  retryPhotoImport,
  retryPhotoProcessing,
  setPhotoCover,
  uploadCeremonyCover,
  updateStudio,
  updateCeremony,
  updateWedding,
} from '../../lib/api/admin';
import { useFeedback } from '../../components/FeedbackProvider';
import type { BackendAdminPhoto, BackendCeremony, BackendWedding } from '../../lib/api/types';

function toDateTimeLocalValue(value?: string | null) {
  if (!value) return '';

  const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  if (match) return match[1];

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 16);
}

function toApiDateTime(value?: string) {
  return value || undefined;
}

export default function AdminDashboard() {
  const { currentStudio, studioJwt, clearSession, setCurrentStudio, setError, setLoading, loading, error } =
    useSessionStore();
  const { showFeedback } = useFeedback();
  const [studioName, setStudioName] = useState('');
  const [studioSlug, setStudioSlug] = useState('');
  const [colorPrimary, setColorPrimary] = useState('');
  const [colorAccent, setColorAccent] = useState('');
  const [weddings, setWeddings] = useState<BackendWedding[]>([]);
  const [weddingsLoading, setWeddingsLoading] = useState(false);
  const [coupleName, setCoupleName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [weddingExpiryDate, setWeddingExpiryDate] = useState('');
  const [weddingPassword, setWeddingPassword] = useState('');
  const [allowDownload, setAllowDownload] = useState('shortlist');
  const [allowComments, setAllowComments] = useState(true);
  const [selectedWeddingSlug, setSelectedWeddingSlug] = useState<string | null>(null);
  const [selectedWedding, setSelectedWedding] = useState<BackendWedding | null>(null);
  const [selectedWeddingLoading, setSelectedWeddingLoading] = useState(false);
  const [editCoupleName, setEditCoupleName] = useState('');
  const [editWeddingDate, setEditWeddingDate] = useState('');
  const [editWeddingPassword, setEditWeddingPassword] = useState('');
  const [editAllowDownload, setEditAllowDownload] = useState('shortlist');
  const [editAllowComments, setEditAllowComments] = useState(true);
  const [ceremonies, setCeremonies] = useState<BackendCeremony[]>([]);
  const [ceremoniesLoading, setCeremoniesLoading] = useState(false);
  const [ceremonyName, setCeremonyName] = useState('');
  const [ceremonyDate, setCeremonyDate] = useState('');
  const [ceremonyDescription, setCeremonyDescription] = useState('');
  const [selectedCeremonySlug, setSelectedCeremonySlug] = useState<string | null>(null);
  const [selectedCeremony, setSelectedCeremony] = useState<BackendCeremony | null>(null);
  const [selectedCeremonyLoading, setSelectedCeremonyLoading] = useState(false);
  const [editCeremonyName, setEditCeremonyName] = useState('');
  const [editCeremonyDate, setEditCeremonyDate] = useState('');
  const [editCeremonyDescription, setEditCeremonyDescription] = useState('');
  const [pendingCeremonyCover, setPendingCeremonyCover] = useState<File | null>(null);
  const [photos, setPhotos] = useState<BackendAdminPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  async function loadCeremonyContext(token: string, weddingSlug: string, ceremonySlug: string) {
    const [ceremonyResponse, photosResponse] = await Promise.all([
      fetchCeremony(token, weddingSlug, ceremonySlug),
      fetchPhotos(token, weddingSlug, ceremonySlug),
    ]);

    setSelectedCeremony(ceremonyResponse.data);
    setPhotos(photosResponse.data);
  }

  useEffect(() => {
    setStudioName(currentStudio?.studio_name || '');
    setStudioSlug(currentStudio?.slug || '');
    setColorPrimary(currentStudio?.color_primary || '');
    setColorAccent(currentStudio?.color_accent || '');
  }, [currentStudio]);

  useEffect(() => {
    let active = true;

    if (!studioJwt) return;

    setWeddingsLoading(true);

    fetchWeddings(studioJwt)
      .then((response) => {
        if (!active) return;
        setWeddings(response.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load weddings right now.');
      })
      .finally(() => {
        if (!active) return;
        setWeddingsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [setError, studioJwt]);

  useEffect(() => {
    let active = true;

    if (!studioJwt || !selectedWeddingSlug) return;

    setSelectedWeddingLoading(true);

    fetchWedding(studioJwt, selectedWeddingSlug)
      .then((response) => {
        if (!active) return;
        setSelectedWedding(response.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load wedding details right now.');
      })
      .finally(() => {
        if (!active) return;
        setSelectedWeddingLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedWeddingSlug, setError, studioJwt]);

  useEffect(() => {
    let active = true;

    if (!studioJwt || !selectedWeddingSlug || !selectedCeremonySlug) {
      setSelectedCeremony(null);
      setPhotos([]);
      return;
    }

    setSelectedCeremonyLoading(true);
    setPhotosLoading(true);

    loadCeremonyContext(studioJwt, selectedWeddingSlug, selectedCeremonySlug)
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load chapter details right now.');
      })
      .finally(() => {
        if (!active) return;
        setSelectedCeremonyLoading(false);
        setPhotosLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCeremonySlug, selectedWeddingSlug, setError, studioJwt]);

  useEffect(() => {
    setEditCeremonyName(selectedCeremony?.name || '');
    setEditCeremonyDate(toDateTimeLocalValue(selectedCeremony?.scheduled_at));
    setEditCeremonyDescription(selectedCeremony?.description || '');
  }, [selectedCeremony]);

  useEffect(() => {
    let active = true;

    if (!studioJwt || !selectedWeddingSlug) {
      setCeremonies([]);
      return;
    }

    setCeremoniesLoading(true);

    fetchCeremonies(studioJwt, selectedWeddingSlug)
      .then((response) => {
        if (!active) return;
        setCeremonies(response.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load chapters right now.');
      })
      .finally(() => {
        if (!active) return;
        setCeremoniesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedWeddingSlug, setError, studioJwt]);

  useEffect(() => {
    setEditCoupleName(selectedWedding?.couple_name || '');
    setEditWeddingDate(selectedWedding?.wedding_date || '');
    setEditWeddingPassword('');
    setEditAllowDownload(selectedWedding?.allow_download || 'shortlist');
    setEditAllowComments(selectedWedding?.allow_comments ?? true);
  }, [selectedWedding]);

  async function handleStudioSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studioJwt) return;

    setLoading(true);
    setError(null);

    try {
      const response = await updateStudio(studioJwt, {
        studio_name: studioName,
        slug: studioSlug,
        color_primary: colorPrimary,
        color_accent: colorAccent,
      });

      setCurrentStudio(response.data.studio);
      showFeedback({
        title: 'Settings saved',
        message: 'Studio branding is now synced with the backend.',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save studio settings right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateWedding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studioJwt) return;

    setLoading(true);
    setError(null);

    try {
      const response = await createWedding(studioJwt, {
        couple_name: coupleName,
        wedding_date: weddingDate,
        password: weddingPassword,
        expires_at: new Date(`${weddingExpiryDate}T00:00:00.000Z`).toISOString(),
        allow_download: allowDownload,
        allow_comments: allowComments,
      });

      setWeddings((current) => [response.data, ...current]);
      setCoupleName('');
      setWeddingDate('');
      setWeddingExpiryDate('');
      setWeddingPassword('');
      setAllowDownload('shortlist');
      setAllowComments(true);

      showFeedback({
        title: 'Wedding created',
        message: `${response.data.couple_name} is now ready for chapters and uploads.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create the wedding right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateWedding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studioJwt || !selectedWedding) return;

    setLoading(true);
    setError(null);

    try {
      const response = await updateWedding(studioJwt, selectedWedding.slug, {
        couple_name: editCoupleName,
        wedding_date: editWeddingDate,
        password: editWeddingPassword || undefined,
        allow_download: editAllowDownload,
        allow_comments: editAllowComments,
      });

      setSelectedWedding(response.data);
      setSelectedWeddingSlug(response.data.slug);
      setWeddings((current) =>
        current.map((wedding) => (wedding.id === response.data.id ? response.data : wedding))
      );

      showFeedback({
        title: 'Wedding updated',
        message: `${response.data.couple_name} is synced with the backend.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update the wedding right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCeremony(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studioJwt || !selectedWeddingSlug) return;

    setLoading(true);
    setError(null);

    try {
      const response = await createCeremony(studioJwt, selectedWeddingSlug, {
        name: ceremonyName,
        scheduled_at: toApiDateTime(ceremonyDate),
        description: ceremonyDescription || undefined,
      });

      setCeremonies((current) => [...current, response.data]);
      setCeremonyName('');
      setCeremonyDate('');
      setCeremonyDescription('');

      showFeedback({
        title: 'Chapter created',
        message: `${response.data.name} is ready for photo uploads.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create the chapter right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateCeremony(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studioJwt || !selectedWeddingSlug || !selectedCeremony) return;

    setLoading(true);
    setError(null);

    try {
      const response = await updateCeremony(studioJwt, selectedWeddingSlug, selectedCeremony.slug, {
        name: editCeremonyName,
        scheduled_at: toApiDateTime(editCeremonyDate),
        description: editCeremonyDescription || undefined,
      });

      setSelectedCeremonySlug(response.data.slug);
      setCeremonies((current) =>
        current.map((ceremony) => (ceremony.id === response.data.id ? response.data : ceremony))
      );
      await loadCeremonyContext(studioJwt, selectedWeddingSlug, response.data.slug);

      showFeedback({
        title: 'Chapter updated',
        message: `${response.data.name} is synced with the backend.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update the chapter right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCeremony() {
    if (!studioJwt || !selectedWeddingSlug || !selectedCeremony || !selectedCeremonySlug) return;

    setLoading(true);
    setError(null);

    try {
      await deleteCeremony(studioJwt, selectedWeddingSlug, selectedCeremonySlug);
      const deletedId = selectedCeremony.id;

      setCeremonies((current) => current.filter((ceremony) => ceremony.id !== deletedId));
      setSelectedCeremony(null);
      setSelectedCeremonySlug(null);

      showFeedback({
        title: 'Chapter deleted',
        message: 'The chapter was removed from this wedding.',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete the chapter right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMoveCeremony(direction: 'up' | 'down') {
    if (!studioJwt || !selectedWeddingSlug || !selectedCeremony) return;

    const currentIndex = ceremonies.findIndex((ceremony) => ceremony.id === selectedCeremony.id);
    if (currentIndex < 0) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= ceremonies.length) return;

    const reordered = [...ceremonies];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setLoading(true);
    setError(null);

    try {
      const response = await reorderCeremonies(
        studioJwt,
        selectedWeddingSlug,
        reordered.map((ceremony) => ceremony.id)
      );

      setCeremonies(response.data.ceremonies || reordered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reorder chapters right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadCeremonyCover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studioJwt || !selectedWeddingSlug || !selectedCeremonySlug || !pendingCeremonyCover) return;

    setLoading(true);
    setError(null);

    try {
      await uploadCeremonyCover(studioJwt, selectedWeddingSlug, selectedCeremonySlug, pendingCeremonyCover);
      const refreshedCeremony = await fetchCeremony(studioJwt, selectedWeddingSlug, selectedCeremonySlug);

      setSelectedCeremony(refreshedCeremony.data);
      setCeremonies((current) =>
        current.map((ceremony) =>
          ceremony.id === refreshedCeremony.data.id ? refreshedCeremony.data : ceremony
        )
      );
      setPendingCeremonyCover(null);

      showFeedback({
        title: 'Cover uploaded',
        message: `${pendingCeremonyCover.name} uploaded successfully.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload the chapter cover right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadPhotos(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studioJwt || !selectedWeddingSlug || !selectedCeremonySlug || pendingFiles.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await presignPhotoUploads(
        studioJwt,
        selectedWeddingSlug,
        selectedCeremonySlug,
        pendingFiles.map((file) => ({
          filename: file.name,
          content_type: file.type || 'application/octet-stream',
          byte_size: file.size,
        }))
      );

      const confirmedPhotos: BackendAdminPhoto[] = [];

      for (let index = 0; index < response.data.length; index += 1) {
        const item = response.data[index];
        const file = pendingFiles[index];

        await fetch(item.presigned_url, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
          body: file,
        });

        const confirmed = await confirmPhotoUpload(studioJwt, item.photo_id);
        confirmedPhotos.push(confirmed.data);
      }

      setPhotos((current) => [...current, ...confirmedPhotos]);
      setPendingFiles([]);
      showFeedback({
        title: 'Photos uploaded',
        message: `${confirmedPhotos.length} photo${confirmedPhotos.length !== 1 ? 's' : ''} queued successfully.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload photos right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPhotoCover(photoId: string) {
    if (!studioJwt) return;

    setLoading(true);
    setError(null);

    try {
      const response = await setPhotoCover(studioJwt, photoId);

      setPhotos((current) =>
        current.map((photo) => ({
          ...photo,
          is_cover: photo.id === response.data.id,
        }))
      );

      showFeedback({
        title: 'Cover updated',
        message: `${response.data.original_filename} is now the chapter cover photo.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update the cover photo right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePhoto(photoId: string) {
    if (!studioJwt) return;

    setLoading(true);
    setError(null);

    try {
      await deletePhoto(studioJwt, photoId);
      setPhotos((current) => current.filter((photo) => photo.id !== photoId));
      showFeedback({
        title: 'Photo deleted',
        message: 'The photo was removed from this chapter.',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete the photo right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRetryPhotoImport(photoId: string) {
    if (!studioJwt) return;

    setLoading(true);
    setError(null);

    try {
      const response = await retryPhotoImport(studioJwt, photoId);
      setPhotos((current) => current.map((photo) => (photo.id === response.data.id ? response.data : photo)));
      showFeedback({
        title: 'Import retry queued',
        message: `${response.data.original_filename} is queued for import again.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to retry photo import right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRetryPhotoProcessing(photoId: string) {
    if (!studioJwt) return;

    setLoading(true);
    setError(null);

    try {
      const response = await retryPhotoProcessing(studioJwt, photoId);
      setPhotos((current) => current.map((photo) => (photo.id === response.data.id ? response.data : photo)));
      showFeedback({
        title: 'Processing retry queued',
        message: `${response.data.original_filename} is queued for processing again.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to retry photo processing right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMovePhoto(photoId: string, direction: 'up' | 'down') {
    if (!studioJwt || !selectedWeddingSlug || !selectedCeremonySlug) return;

    const currentIndex = photos.findIndex((photo) => photo.id === photoId);
    if (currentIndex < 0) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const reordered = [...photos];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setLoading(true);
    setError(null);

    try {
      const response = await reorderPhotos(
        studioJwt,
        selectedWeddingSlug,
        selectedCeremonySlug,
        reordered.map((photo) => photo.id)
      );

      setPhotos(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reorder photos right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label text-outline">Studio Admin</p>
            <h1 className="mt-3 font-headline text-[2.5rem] font-light md:text-5xl">
              {currentStudio?.studio_name || 'Studio Dashboard'}
            </h1>
            <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-foreground/72">
              The admin auth shell is wired. Next we will connect studio settings, weddings,
              chapters, and uploads into this protected space.
            </p>
          </div>

          <button
            className="rounded-full border border-foreground/10 bg-black/14 px-4 py-2 font-label text-xs uppercase tracking-[0.16rem] text-foreground/78"
            onClick={clearSession}
            type="button"
          >
            Log out
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="soft-panel rounded-[1.5rem] p-5">
            <p className="label text-rose-accent">Status</p>
            <p className="mt-3 font-body text-sm text-foreground/72">
              Admin session is active and ready for the next API integration slice.
            </p>
          </div>
          <div className="soft-panel rounded-[1.5rem] p-5">
            <p className="label text-rose-accent">Next</p>
            <p className="mt-3 font-body text-sm text-foreground/72">
              Studio settings, wedding list, and chapter management can now plug into this shell.
            </p>
          </div>
          <div className="soft-panel rounded-[1.5rem] p-5">
            <p className="label text-rose-accent">Slug</p>
            <p className="mt-3 font-body text-sm text-foreground/72">
              {currentStudio?.slug || 'Pending studio bootstrap'}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
          <section className="soft-panel rounded-[1.75rem] p-6 md:p-7">
            <p className="label text-outline">Studio Settings</p>
            <h2 className="mt-3 font-headline text-[2rem] font-light text-foreground md:text-[2.5rem]">
              Brand the admin shell with live backend data.
            </h2>
            <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-foreground/70">
              This is the first real admin write path. We are keeping it intentionally focused:
              studio name, slug, and brand colors first, then asset uploads next.
            </p>

            <form className="mt-7 grid gap-4 md:grid-cols-2" onSubmit={handleStudioSettingsSubmit}>
              <label className="block md:col-span-2">
                <span className="label text-foreground/60">Studio Name</span>
                <input
                  aria-label="Studio Name"
                  className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                  value={studioName}
                  onChange={(event) => setStudioName(event.target.value)}
                  placeholder="My Studio"
                  required
                />
              </label>

              <label className="block">
                <span className="label text-foreground/60">Studio Slug</span>
                <input
                  aria-label="Studio Slug"
                  className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                  value={studioSlug}
                  onChange={(event) => setStudioSlug(event.target.value)}
                  placeholder="my-studio"
                  required
                />
              </label>

              <label className="block">
                <span className="label text-foreground/60">Primary Color</span>
                <input
                  aria-label="Primary Color"
                  className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                  value={colorPrimary}
                  onChange={(event) => setColorPrimary(event.target.value)}
                  placeholder="#112233"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="label text-foreground/60">Accent Color</span>
                <input
                  aria-label="Accent Color"
                  className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                  value={colorAccent}
                  onChange={(event) => setColorAccent(event.target.value)}
                  placeholder="#c9a96e"
                />
              </label>

              {error && (
                <div className="rounded-[1rem] border border-rose-accent/25 bg-rose-accent/10 px-4 py-3 text-sm text-rose-100 md:col-span-2">
                  {error}
                </div>
              )}

              <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                <button
                  className="rounded-full border border-rose-accent/30 bg-rose-accent px-5 py-3 font-label text-xs uppercase tracking-[0.18rem] text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
                <span className="label text-foreground/48">Logo and watermark uploads are the next admin slice.</span>
              </div>
            </form>
          </section>

          <aside className="soft-panel rounded-[1.75rem] p-6">
            <p className="label text-rose-accent">Live Preview</p>
            <div className="mt-5 rounded-[1.5rem] border border-foreground/10 bg-black/16 p-5">
              <div
                className="h-28 rounded-[1.2rem]"
                style={{
                  background: `linear-gradient(135deg, ${colorPrimary || '#112233'}, ${colorAccent || '#c9a96e'})`,
                }}
              />
              <p className="mt-4 font-headline text-[1.6rem] font-light text-foreground">
                {studioName || 'Your Studio'}
              </p>
              <p className="mt-2 font-body text-sm text-foreground/66">
                Slug: {studioSlug || 'my-studio'}
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)]">
          <section className="soft-panel rounded-[1.75rem] p-6 md:p-7">
            <p className="label text-outline">Create Wedding</p>
            <h2 className="mt-3 font-headline text-[2rem] font-light text-foreground md:text-[2.5rem]">
              Open a new gallery from the admin shell.
            </h2>
            <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-foreground/70">
              This is the first real operational object after studio settings. Once a wedding
              exists, chapters, uploads, and guest access all have a place to land.
            </p>

            <form className="mt-7 grid gap-4" onSubmit={handleCreateWedding}>
              <label className="block">
                <span className="label text-foreground/60">Couple Names</span>
                <input
                  aria-label="Couple Names"
                  className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                  value={coupleName}
                  onChange={(event) => setCoupleName(event.target.value)}
                  placeholder="Priya & Arjun"
                  required
                />
              </label>

              <label className="block">
                <span className="label text-foreground/60">Wedding Date</span>
                <input
                  aria-label="Wedding Date"
                  className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                  type="date"
                  value={weddingDate}
                  onChange={(event) => setWeddingDate(event.target.value)}
                  required
                />
              </label>

              <label className="block">
                <span className="label text-foreground/60">Gallery Expiry Date</span>
                <input
                  aria-label="Gallery Expiry Date"
                  className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                  type="date"
                  value={weddingExpiryDate}
                  onChange={(event) => setWeddingExpiryDate(event.target.value)}
                  required
                />
              </label>

              <label className="block">
                <span className="label text-foreground/60">Gallery Password</span>
                <input
                  aria-label="Gallery Password"
                  className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                  type="text"
                  value={weddingPassword}
                  onChange={(event) => setWeddingPassword(event.target.value)}
                  placeholder="gallery123"
                  required
                />
              </label>

              <label className="block">
                <span className="label text-foreground/60">Download Policy</span>
                <select
                  aria-label="Download Policy"
                  className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                  value={allowDownload}
                  onChange={(event) => setAllowDownload(event.target.value)}
                >
                  <option value="none">None</option>
                  <option value="shortlist">Shortlist</option>
                  <option value="all">All</option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-[1.15rem] border border-foreground/10 bg-black/10 px-4 py-3">
                <input
                  checked={allowComments}
                  onChange={(event) => setAllowComments(event.target.checked)}
                  type="checkbox"
                />
                <span className="font-body text-sm text-foreground/76">Allow guest comments</span>
              </label>

              <button
                className="rounded-full border border-rose-accent/30 bg-rose-accent px-5 py-3 font-label text-xs uppercase tracking-[0.18rem] text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading ? 'Creating...' : 'Create Wedding'}
              </button>
            </form>
          </section>

          <section className="soft-panel rounded-[1.75rem] p-6 md:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="label text-outline">Weddings</p>
                <h2 className="mt-3 font-headline text-[2rem] font-light text-foreground md:text-[2.5rem]">
                  Current galleries
                </h2>
              </div>
              <span className="label text-foreground/48">
                {weddingsLoading ? 'Loading...' : `${weddings.length} total`}
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {weddings.map((wedding) => (
                <article
                  key={wedding.id}
                  className="rounded-[1.35rem] border border-foreground/10 bg-black/12 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-headline text-[1.5rem] font-light text-foreground">
                        {wedding.couple_name}
                      </h3>
                      <p className="mt-2 font-body text-sm text-foreground/60">
                        Slug: {wedding.slug}
                      </p>
                    </div>
                    <span className="label text-rose-accent">
                      {wedding.expired ? 'Expired' : wedding.allow_download || 'Configured'}
                    </span>
                  </div>
                  <p className="mt-3 font-body text-sm text-foreground/68">
                    Date: {wedding.wedding_date || 'Not set'}
                    {' · '}
                    Comments: {wedding.allow_comments ? 'On' : 'Off'}
                  </p>
                  <div className="mt-4">
                    <button
                      className="rounded-full border border-foreground/10 bg-black/16 px-4 py-2 font-label text-[10px] uppercase tracking-[0.16rem] text-foreground/72"
                      onClick={() => setSelectedWeddingSlug(wedding.slug)}
                      type="button"
                    >
                      Manage Wedding
                    </button>
                  </div>
                </article>
              ))}

              {!weddingsLoading && weddings.length === 0 && (
                <div className="rounded-[1.35rem] border border-dashed border-foreground/12 px-4 py-6 text-sm text-foreground/58">
                  No weddings yet. Create the first one from the panel on the left.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-8">
          <section className="soft-panel rounded-[1.75rem] p-6 md:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="label text-outline">Wedding Details</p>
                <h2 className="mt-3 font-headline text-[2rem] font-light text-foreground md:text-[2.5rem]">
                  {selectedWedding ? selectedWedding.couple_name : 'Select a wedding to manage'}
                </h2>
              </div>
              <span className="label text-foreground/48">
                {selectedWeddingLoading ? 'Loading...' : selectedWedding?.slug || 'No selection'}
              </span>
            </div>

            {!selectedWedding && !selectedWeddingLoading && (
              <div className="mt-6 rounded-[1.35rem] border border-dashed border-foreground/12 px-4 py-6 text-sm text-foreground/58">
                Pick any wedding from the list above to load its full backend detail and edit it.
              </div>
            )}

            {selectedWedding && (
              <form className="mt-7 grid gap-4 md:grid-cols-2" onSubmit={handleUpdateWedding}>
                <label className="block md:col-span-2">
                  <span className="label text-foreground/60">Edit Couple Names</span>
                  <input
                    aria-label="Edit Couple Names"
                    className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                    value={editCoupleName}
                    onChange={(event) => setEditCoupleName(event.target.value)}
                    required
                  />
                </label>

                <label className="block">
                  <span className="label text-foreground/60">Edit Wedding Date</span>
                  <input
                    aria-label="Edit Wedding Date"
                    className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                    type="date"
                    value={editWeddingDate}
                    onChange={(event) => setEditWeddingDate(event.target.value)}
                    required
                  />
                </label>

                <label className="block">
                  <span className="label text-foreground/60">Edit Download Policy</span>
                  <select
                    aria-label="Edit Download Policy"
                    className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                    value={editAllowDownload}
                    onChange={(event) => setEditAllowDownload(event.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="shortlist">Shortlist</option>
                    <option value="all">All</option>
                  </select>
                </label>

                <label className="block md:col-span-2">
                  <span className="label text-foreground/60">New Gallery Password</span>
                  <input
                    aria-label="New Gallery Password"
                    className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                    type="text"
                    value={editWeddingPassword}
                    onChange={(event) => setEditWeddingPassword(event.target.value)}
                    placeholder="Leave blank to keep the current password"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-[1.15rem] border border-foreground/10 bg-black/10 px-4 py-3 md:col-span-2">
                  <input
                    aria-label="Disable Guest Comments"
                    checked={!editAllowComments}
                    onChange={(event) => setEditAllowComments(!event.target.checked)}
                    type="checkbox"
                  />
                  <span className="font-body text-sm text-foreground/76">
                    Disable guest comments
                  </span>
                </label>

                <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                  <button
                    className="rounded-full border border-rose-accent/30 bg-rose-accent px-5 py-3 font-label text-xs uppercase tracking-[0.18rem] text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? 'Saving...' : 'Save Wedding Changes'}
                  </button>
                  <span className="label text-foreground/48">
                    Chapter management is the next step after this detail form.
                  </span>
                </div>
              </form>
            )}
          </section>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.1fr)]">
          <section className="soft-panel rounded-[1.75rem] p-6 md:p-7">
            <p className="label text-outline">Create Chapter</p>
            <h2 className="mt-3 font-headline text-[2rem] font-light text-foreground md:text-[2.5rem]">
              Add the first chapters to the wedding story.
            </h2>
            <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-foreground/70">
              In the backend these are ceremonies. In the UI they stay chapters so the product language remains calm and familiar.
            </p>

            <form className="mt-7 grid gap-4" onSubmit={handleCreateCeremony}>
              <label className="block">
                <span className="label text-foreground/60">Chapter Name</span>
                <input
                  aria-label="Chapter Name"
                  className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                  value={ceremonyName}
                  onChange={(event) => setCeremonyName(event.target.value)}
                  placeholder="Haldi"
                  required
                />
              </label>

              <label className="block">
                <span className="label text-foreground/60">Chapter Date</span>
                <input
                  aria-label="Chapter Date"
                  className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                  type="datetime-local"
                  value={ceremonyDate}
                  onChange={(event) => setCeremonyDate(event.target.value)}
                />
              </label>

              <label className="block">
                <span className="label text-foreground/60">Chapter Description</span>
                <textarea
                  aria-label="Chapter Description"
                  className="mt-2 min-h-28 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                  value={ceremonyDescription}
                  onChange={(event) => setCeremonyDescription(event.target.value)}
                  placeholder="Yellow ceremony"
                />
              </label>

              <button
                className="rounded-full border border-rose-accent/30 bg-rose-accent px-5 py-3 font-label text-xs uppercase tracking-[0.18rem] text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading || !selectedWeddingSlug}
                type="submit"
              >
                {loading ? 'Creating...' : 'Create Chapter'}
              </button>
            </form>
          </section>

          <section className="soft-panel rounded-[1.75rem] p-6 md:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="label text-outline">Chapters</p>
                <h2 className="mt-3 font-headline text-[2rem] font-light text-foreground md:text-[2.5rem]">
                  {selectedWedding ? `${selectedWedding.couple_name} chapters` : 'Select a wedding first'}
                </h2>
              </div>
              <span className="label text-foreground/48">
                {ceremoniesLoading ? 'Loading...' : `${ceremonies.length} total`}
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {ceremonies.map((ceremony) => (
                <article
                  key={ceremony.id}
                  className="rounded-[1.35rem] border border-foreground/10 bg-black/12 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-headline text-[1.5rem] font-light text-foreground">
                        {ceremony.name}
                      </h3>
                      <p className="mt-2 font-body text-sm text-foreground/60">
                        Slug: {ceremony.slug}
                      </p>
                    </div>
                    <span className="label text-rose-accent">
                      {ceremony.photo_count ?? 0} photos
                    </span>
                  </div>
                  <p className="mt-3 font-body text-sm text-foreground/68">
                    {ceremony.scheduled_at || 'Date not set'}
                    {ceremony.description ? ` · ${ceremony.description}` : ''}
                  </p>
                  <div className="mt-4">
                    <button
                      className="rounded-full border border-foreground/10 bg-black/16 px-4 py-2 font-label text-[10px] uppercase tracking-[0.16rem] text-foreground/72"
                      onClick={() => setSelectedCeremonySlug(ceremony.slug)}
                      type="button"
                    >
                      Manage Chapter
                    </button>
                  </div>
                </article>
              ))}

              {!selectedWeddingSlug && (
                <div className="rounded-[1.35rem] border border-dashed border-foreground/12 px-4 py-6 text-sm text-foreground/58">
                  Choose a wedding from above to load its chapters.
                </div>
              )}

              {selectedWeddingSlug && !ceremoniesLoading && ceremonies.length === 0 && (
                <div className="rounded-[1.35rem] border border-dashed border-foreground/12 px-4 py-6 text-sm text-foreground/58">
                  No chapters yet. Create the first one from the panel on the left.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-8">
          <section className="soft-panel rounded-[1.75rem] p-6 md:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="label text-outline">Chapter Details</p>
                <h2 className="mt-3 font-headline text-[2rem] font-light text-foreground md:text-[2.5rem]">
                  {selectedCeremony ? selectedCeremony.name : 'Select a chapter to manage'}
                </h2>
              </div>
              <span className="label text-foreground/48">
                {selectedCeremonyLoading ? 'Loading...' : selectedCeremony?.slug || 'No selection'}
              </span>
            </div>

            {!selectedCeremony && !selectedCeremonyLoading && (
              <div className="mt-6 rounded-[1.35rem] border border-dashed border-foreground/12 px-4 py-6 text-sm text-foreground/58">
                Pick a chapter from the list above to edit, reorder, or delete it.
              </div>
            )}

            {selectedCeremony && (
              <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleUpdateCeremony}>
                  <label className="block md:col-span-2">
                    <span className="label text-foreground/60">Edit Chapter Name</span>
                    <input
                      aria-label="Edit Chapter Name"
                      className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                      value={editCeremonyName}
                      onChange={(event) => setEditCeremonyName(event.target.value)}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="label text-foreground/60">Edit Chapter Date</span>
                    <input
                      aria-label="Edit Chapter Date"
                      className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                      type="datetime-local"
                      value={editCeremonyDate}
                      onChange={(event) => setEditCeremonyDate(event.target.value)}
                    />
                  </label>

                  <label className="block">
                    <span className="label text-foreground/60">Edit Chapter Description</span>
                    <textarea
                      aria-label="Edit Chapter Description"
                      className="mt-2 min-h-28 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                      value={editCeremonyDescription}
                      onChange={(event) => setEditCeremonyDescription(event.target.value)}
                    />
                  </label>

                  <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                    <button
                      className="rounded-full border border-rose-accent/30 bg-rose-accent px-5 py-3 font-label text-xs uppercase tracking-[0.18rem] text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={loading}
                      type="submit"
                    >
                      {loading ? 'Saving...' : 'Save Chapter Changes'}
                    </button>
                    <button
                      className="rounded-full border border-foreground/10 bg-black/16 px-4 py-3 font-label text-[10px] uppercase tracking-[0.16rem] text-foreground/72 disabled:opacity-50"
                      disabled={loading || ceremonies.findIndex((c) => c.id === selectedCeremony.id) <= 0}
                      onClick={() => handleMoveCeremony('up')}
                      type="button"
                    >
                      Move Chapter Up
                    </button>
                    <button
                      className="rounded-full border border-foreground/10 bg-black/16 px-4 py-3 font-label text-[10px] uppercase tracking-[0.16rem] text-foreground/72 disabled:opacity-50"
                      disabled={
                        loading ||
                        ceremonies.findIndex((c) => c.id === selectedCeremony.id) === ceremonies.length - 1
                      }
                      onClick={() => handleMoveCeremony('down')}
                      type="button"
                    >
                      Move Chapter Down
                    </button>
                    <button
                      className="rounded-full border border-rose-accent/30 bg-transparent px-4 py-3 font-label text-[10px] uppercase tracking-[0.16rem] text-rose-accent disabled:opacity-50"
                      disabled={loading}
                      onClick={handleDeleteCeremony}
                      type="button"
                    >
                      Delete Chapter
                    </button>
                  </div>
                </form>

                <aside className="rounded-[1.5rem] border border-foreground/10 bg-black/10 p-5">
                  <p className="label text-rose-accent">Chapter Cover</p>
                  {selectedCeremony.cover_image_url ? (
                    <img
                      alt={`${selectedCeremony.name} cover preview`}
                      className="mt-4 h-40 w-full rounded-[1.2rem] object-cover"
                      src={selectedCeremony.cover_image_url}
                    />
                  ) : (
                    <div className="mt-4 flex h-40 items-center justify-center rounded-[1.2rem] border border-dashed border-foreground/12 text-sm text-foreground/54">
                      No chapter cover yet
                    </div>
                  )}

                  <form className="mt-5 grid gap-3" onSubmit={handleUploadCeremonyCover}>
                    <label className="block">
                      <span className="label text-foreground/60">Upload Chapter Cover</span>
                      <input
                        aria-label="Upload Chapter Cover"
                        className="mt-2 block w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-sm text-foreground"
                        onChange={(event) => setPendingCeremonyCover(event.target.files?.[0] || null)}
                        type="file"
                        accept="image/*"
                      />
                    </label>

                    <button
                      className="rounded-full border border-foreground/10 bg-black/16 px-4 py-3 font-label text-[10px] uppercase tracking-[0.16rem] text-foreground/72 disabled:opacity-50"
                      disabled={loading || !pendingCeremonyCover}
                      type="submit"
                    >
                      Upload Chapter Cover
                    </button>
                  </form>
                </aside>
              </div>
            )}
          </section>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.1fr)]">
          <section className="soft-panel rounded-[1.75rem] p-6 md:p-7">
            <p className="label text-outline">Upload Photos</p>
            <h2 className="mt-3 font-headline text-[2rem] font-light text-foreground md:text-[2.5rem]">
              {selectedCeremony ? `${selectedCeremony.name} photo intake` : 'Select a chapter for uploads'}
            </h2>
            <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-foreground/70">
              This is the real direct-upload flow: presign with the backend, upload to storage, then confirm so processing can begin.
            </p>

            <form className="mt-7 grid gap-4" onSubmit={handleUploadPhotos}>
              <label className="block">
                <span className="label text-foreground/60">Upload Chapter Photos</span>
                <input
                  aria-label="Upload Chapter Photos"
                  className="mt-2 block w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-sm text-foreground"
                  multiple
                  onChange={(event) => setPendingFiles(Array.from(event.target.files || []))}
                  type="file"
                />
              </label>

              <div className="rounded-[1.15rem] border border-foreground/10 bg-black/10 px-4 py-4 text-sm text-foreground/70">
                {pendingFiles.length === 0
                  ? 'No files selected yet.'
                  : `${pendingFiles.length} file${pendingFiles.length !== 1 ? 's' : ''} ready to upload.`}
              </div>

              <button
                className="rounded-full border border-rose-accent/30 bg-rose-accent px-5 py-3 font-label text-xs uppercase tracking-[0.18rem] text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading || !selectedCeremonySlug || pendingFiles.length === 0}
                type="submit"
              >
                {loading ? 'Uploading...' : 'Upload Photos'}
              </button>
            </form>
          </section>

          <section className="soft-panel rounded-[1.75rem] p-6 md:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="label text-outline">Photos</p>
                <h2 className="mt-3 font-headline text-[2rem] font-light text-foreground md:text-[2.5rem]">
                  {selectedCeremony ? `${selectedCeremony.name} media` : 'Select a chapter first'}
                </h2>
              </div>
              <span className="label text-foreground/48">
                {photosLoading ? 'Loading...' : `${photos.length} total`}
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {photos.map((photo, index) => (
                <article
                  key={photo.id}
                  className="rounded-[1.35rem] border border-foreground/10 bg-black/12 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-body text-base text-foreground">{photo.original_filename}</h3>
                      <p className="mt-2 font-body text-sm text-foreground/60">
                        {photo.width && photo.height ? `${photo.width} x ${photo.height}` : 'Dimensions pending'}
                      </p>
                    </div>
                    <span className="label text-rose-accent">
                      {photo.is_cover ? 'Cover Photo' : photo.processing_status || photo.ingestion_status || 'pending'}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      aria-label={`Move photo ${photo.original_filename} up`}
                      className="rounded-full border border-foreground/10 bg-black/16 px-4 py-2 font-label text-[10px] uppercase tracking-[0.16rem] text-foreground/72 disabled:opacity-50"
                      disabled={loading || index === 0}
                      onClick={() => handleMovePhoto(photo.id, 'up')}
                      type="button"
                    >
                      Move Up
                    </button>
                    <button
                      aria-label={`Move photo ${photo.original_filename} down`}
                      className="rounded-full border border-foreground/10 bg-black/16 px-4 py-2 font-label text-[10px] uppercase tracking-[0.16rem] text-foreground/72 disabled:opacity-50"
                      disabled={loading || index === photos.length - 1}
                      onClick={() => handleMovePhoto(photo.id, 'down')}
                      type="button"
                    >
                      Move Down
                    </button>
                    {photo.ingestion_status === 'failed' && (
                      <button
                        aria-label={`Retry import for ${photo.original_filename}`}
                        className="rounded-full border border-foreground/10 bg-black/16 px-4 py-2 font-label text-[10px] uppercase tracking-[0.16rem] text-foreground/72 disabled:opacity-50"
                        disabled={loading}
                        onClick={() => handleRetryPhotoImport(photo.id)}
                        type="button"
                      >
                        Retry Import
                      </button>
                    )}
                    {photo.processing_status === 'failed' && (
                      <button
                        aria-label={`Retry processing for ${photo.original_filename}`}
                        className="rounded-full border border-foreground/10 bg-black/16 px-4 py-2 font-label text-[10px] uppercase tracking-[0.16rem] text-foreground/72 disabled:opacity-50"
                        disabled={loading}
                        onClick={() => handleRetryPhotoProcessing(photo.id)}
                        type="button"
                      >
                        Retry Processing
                      </button>
                    )}
                    <button
                      aria-label={`Set cover for ${photo.original_filename}`}
                      className="rounded-full border border-foreground/10 bg-black/16 px-4 py-2 font-label text-[10px] uppercase tracking-[0.16rem] text-foreground/72 disabled:opacity-50"
                      disabled={loading || !!photo.is_cover}
                      onClick={() => handleSetPhotoCover(photo.id)}
                      type="button"
                    >
                      {photo.is_cover ? 'Cover Photo' : 'Set Cover'}
                    </button>
                    <button
                      aria-label={`Delete photo ${photo.original_filename}`}
                      className="rounded-full border border-rose-accent/30 bg-transparent px-4 py-2 font-label text-[10px] uppercase tracking-[0.16rem] text-rose-accent disabled:opacity-50"
                      disabled={loading}
                      onClick={() => handleDeletePhoto(photo.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}

              {!selectedCeremonySlug && (
                <div className="rounded-[1.35rem] border border-dashed border-foreground/12 px-4 py-6 text-sm text-foreground/58">
                  Choose a chapter above to load and upload photos.
                </div>
              )}

              {selectedCeremonySlug && !photosLoading && photos.length === 0 && (
                <div className="rounded-[1.35rem] border border-dashed border-foreground/12 px-4 py-6 text-sm text-foreground/58">
                  No photos yet. Upload the first batch from the panel on the left.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
