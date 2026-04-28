import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, Share2 } from 'lucide-react';
import { useSessionStore } from '../store/sessionStore';
import { useFeedback } from '../components/FeedbackProvider';
import { downloadPhoto } from '../lib/download';
import {
  fetchGuestPrintSelectionBucket,
  fetchGuestPrintSelectionBucketPhotos,
  removePhotoFromGuestPrintSelectionBucket,
} from '../lib/api/printSelection';
import { mapGalleryPhotoToPhoto } from '../lib/api/adapters';
import type { Photo } from '../lib/data';
import type { BackendPrintSelectionBucket } from '../lib/api/types';

export default function AlbumDetail() {
  const { albumId, id } = useParams<{ albumId: string; id?: string }>();
  const { mode, galleryToken, studioSlug, weddingSlug } = useSessionStore();
  const { showFeedback } = useFeedback();
  const [bucket, setBucket] = useState<BackendPrintSelectionBucket | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backTo = '/albums';
  const backLabel = 'Print Albums';

  useEffect(() => {
    let active = true;

    async function load() {
      if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug || !albumId) {
        if (!active) return;
        setLoading(false);
        setError('Open this print album from the guest gallery.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [bucketResponse, photosResponse] = await Promise.all([
          fetchGuestPrintSelectionBucket(studioSlug, weddingSlug, albumId, galleryToken),
          fetchGuestPrintSelectionBucketPhotos(studioSlug, weddingSlug, albumId, galleryToken, 300),
        ]);

        if (!active) return;
        setBucket(bucketResponse.data);
        setPhotos(photosResponse.data.map(mapGalleryPhotoToPhoto));
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Print album details could not be loaded right now.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [albumId, galleryToken, mode, studioSlug, weddingSlug]);

  const groupedPhotos = useMemo(() => photos, [photos]);

  if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug) {
    return <Navigate to="/" replace />;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    showFeedback({
      title: 'Link copied',
      message: 'You can share this print selection page with family.',
    });
  };

  const handleRemove = async (photoId: string) => {
    if (!albumId || !bucket || bucket.locked) return;

    try {
      const response = await removePhotoFromGuestPrintSelectionBucket(
        studioSlug,
        weddingSlug,
        albumId,
        photoId,
        galleryToken
      );

      setBucket(response.data);
      setPhotos((current) => current.filter((photo) => photo.id !== photoId));
      showFeedback({
        title: 'Removed from print album',
        message: 'The photo remains available in the main gallery.',
      });
    } catch (removeError) {
      showFeedback({
        title: 'Could not remove photo',
        message: removeError instanceof Error ? removeError.message : 'Please try again in a moment.',
        variant: 'info',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5efe4] px-4 py-24 text-[#241d17] sm:px-6 lg:px-10">
        <p className="font-body text-sm text-[#6f665b]">Loading print album…</p>
      </div>
    );
  }

  if (error || !bucket) {
    return (
      <div className="min-h-screen bg-[#f5efe4] px-4 py-24 text-[#241d17] sm:px-6 lg:px-10">
        <Link to={backTo} className="inline-flex items-center gap-1.5 label text-[#be3d2f]">
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>
        <p className="mt-4 font-body text-sm text-[#964b40]">{error ?? 'Print album not found.'}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#f5efe4] px-4 pb-20 pt-24 text-[#241d17] sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1440px]">
        <Link to={backTo} className="inline-flex items-center gap-1.5 label text-[#be3d2f]">
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>

        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.32em] text-[#9a907f]">
              Wedding-wide selection
            </p>
            <h1 className="mt-2 font-headline text-[3rem] font-light leading-[0.92] tracking-[-0.04em] text-[#18130f] md:text-[4.4rem]">
              {bucket.name}
            </h1>
            <p className="mt-3 max-w-2xl font-body text-lg leading-relaxed text-[#6f665b]">
              {bucket.selected_count} selected out of {bucket.selection_limit}. This print album can gather moments from every chapter of the wedding.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d8cbb8] bg-[#f8f0e6] px-4 py-2 text-[#6b5646] shadow-[0_10px_30px_rgba(70,54,35,0.06)]">
              {bucket.locked ? <Lock className="h-4 w-4 text-[#be3d2f]" /> : null}
              <span className="label">
                {bucket.locked ? 'Locked by studio' : `${bucket.remaining_count} remaining`}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full border border-[#d8cbb8] bg-[#f8f0e6] px-4 py-2 text-[#6b5646] shadow-[0_10px_30px_rgba(70,54,35,0.06)]"
            >
              <Share2 className="h-4 w-4 text-[#be3d2f]" />
              <span className="label">Share</span>
            </button>
          </div>
        </div>

        {groupedPhotos.length === 0 ? (
          <div className="mt-10 rounded-[1.75rem] border border-dashed border-[#d8cbb8] bg-[#fbf6ee] px-6 py-8">
            <p className="font-body text-sm leading-relaxed text-[#6f665b]">
              No photos have been added to this print album yet.
            </p>
          </div>
        ) : (
          <section className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {groupedPhotos.map((photo) => (
              <div key={photo.id} className="group relative aspect-[0.92] overflow-hidden rounded-[1.2rem] bg-[#efe4d5]">
                <img
                  src={photo.url}
                  alt={photo.alt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,239,228,0.05),rgba(36,29,23,0.56))]" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="label text-white/70">{photo.event ? photo.event.replace(/-/g, ' ') : id || 'Wedding'}</p>
                </div>
                {!bucket.locked ? (
                  <button
                    onClick={() => void handleRemove(photo.id)}
                    aria-label={`Remove ${photo.alt} from print album`}
                    className="absolute right-3 top-3 rounded-full border border-white/18 bg-black/45 px-3 py-1.5 label text-white/90 backdrop-blur-md transition-colors hover:bg-black/60"
                  >
                    Remove
                  </button>
                ) : null}
                <button
                  onClick={() => downloadPhoto(photo.url, photo.alt)}
                  className="absolute left-3 top-3 rounded-full border border-white/18 bg-black/35 px-3 py-1.5 label text-white/90 backdrop-blur-md transition-colors hover:bg-black/50"
                >
                  View
                </button>
              </div>
            ))}
          </section>
        )}
      </div>
    </motion.div>
  );
}
