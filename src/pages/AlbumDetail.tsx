import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Share2, Trash2, X } from 'lucide-react';
import { useViewerStore } from '../store/viewerStore';
import { useSessionStore } from '../store/sessionStore';
import { Sheet } from '../components/Sheet';
import { cn } from '../lib/utils';
import { useFeedback } from '../components/FeedbackProvider';
import { readRouteState, toBackState } from '../lib/navigation';
import {
  fetchGalleryAlbum,
  fetchGalleryAlbumPhotos,
  removePhotoFromGalleryAlbum,
} from '../lib/api/albums';
import { mapGalleryPhotoToPhoto } from '../lib/api/adapters';
import type { Photo } from '../lib/data';

export default function AlbumDetail() {
  const { id, albumId } = useParams<{ id: string; albumId: string }>();
  const location = useLocation();
  const { userAlbums, removePhotoFromAlbum } = useViewerStore();
  const { galleryToken, mode, studioSlug, weddingSlug } = useSessionStore();
  const [contextPhotoId, setContextPhotoId] = useState<string | null>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumSlug, setAlbumSlug] = useState('');
  const [albumPhotoCount, setAlbumPhotoCount] = useState(0);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const { showFeedback } = useFeedback();

  const userAlbum = userAlbums.find((a) => a.id === albumId);
  const navigationState = readRouteState(location);
  const backTo = navigationState?.backTo ?? `/event/${id}/albums`;
  const backLabel = navigationState?.backLabel ?? 'Albums';
  const detailState = navigationState ? toBackState(backTo, backLabel) : undefined;

  useEffect(() => {
    let active = true;

    async function load() {
      if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug || !id || !albumId) {
        if (!active) return;
        setError('Open this album from the guest gallery.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [albumResponse, photosResponse] = await Promise.all([
          fetchGalleryAlbum(studioSlug, weddingSlug, id, albumId, galleryToken),
          fetchGalleryAlbumPhotos(studioSlug, weddingSlug, id, albumId, galleryToken, 100),
        ]);

        if (!active) return;

        setEventTitle(id.replace(/-/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase()));
        setAlbumTitle(albumResponse.data.name);
        setAlbumSlug(albumResponse.data.slug);
        setAlbumPhotoCount(albumResponse.data.photos_count ?? photosResponse.data.length);
        setPhotos(photosResponse.data.map(mapGalleryPhotoToPhoto));
      } catch {
        if (!active) return;
        setError('Album details could not be loaded right now.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [albumId, galleryToken, id, mode, studioSlug, weddingSlug]);

  const albumPhotos = useMemo(() => photos, [photos]);

  const handleCopy = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showFeedback({
        title: 'Album link copied',
        message: 'You can share this collection with family and friends.',
        variant: 'info',
      });
    });
  };

  const handleRemove = async (photoId: string) => {
    if (!galleryToken || !studioSlug || !weddingSlug || !id || !albumSlug || !userAlbum) return;

    try {
      await removePhotoFromGalleryAlbum(studioSlug, weddingSlug, id, albumSlug, photoId, galleryToken);
      removePhotoFromAlbum(userAlbum.id, photoId);
      setPhotos((current) => current.filter((photo) => photo.id !== photoId));
      setAlbumPhotoCount((count) => Math.max(0, count - 1));
      showFeedback({
        title: 'Removed from this album',
        message: 'The photo still remains safely in the main gallery.',
      });
    } catch {
      showFeedback({
        title: 'Could not remove photo',
        message: 'Please try again in a moment.',
        variant: 'info',
      });
    }
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-14 pb-16 md:pt-16 md:pb-16">
        <div className="wrap pt-6 md:pt-12">
          <div className="soft-panel rounded-[1.8rem] p-6">
            <p className="font-body text-sm text-foreground/62">Loading album...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-14 pb-16 md:pt-16 md:pb-16">
        <div className="wrap pt-6 md:pt-12">
          <div className="soft-panel rounded-[1.8rem] p-6">
            <Link
              to={backTo}
              state={detailState}
              className="inline-flex items-center gap-1.5 label text-rose-accent hover:text-rose-accent/80 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> {backLabel}
            </Link>
            <p className="font-body text-sm text-foreground/62">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-14 pb-16 md:pt-16 md:pb-16"
    >
      <div className="wrap pt-6 md:pt-12 pb-6 md:pb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to={backTo}
            state={detailState}
            className="inline-flex items-center gap-1.5 label text-rose-accent hover:text-rose-accent/80 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </Link>
          <h2 className="font-headline text-[2.5rem] md:text-5xl lg:text-6xl font-light text-foreground">{albumTitle || userAlbum?.title || 'Album'}</h2>
          <p className="label text-outline mt-2">{albumPhotoCount} photos · {eventTitle}</p>
          {userAlbum ? (
            <p className="label text-outline/80 mt-2">Removing a photo here only takes it out of this collection.</p>
          ) : null}
        </div>
        <button
          onClick={() => setShowShareSheet(true)}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-rose-accent px-5 py-3 text-white label font-bold hover:bg-rose-accent/90 transition-colors sm:w-auto"
        >
          Share album <Share2 className="w-4 h-4" />
        </button>
      </div>

      {albumPhotos.length === 0 ? (
        <section className="wrap">
          <div className="soft-panel rounded-[1.8rem] p-6">
            <p className="font-body text-sm leading-relaxed text-foreground/62">
              This album is ready, but no album photos are available in the current page state yet. Add photos from the chapter view and reopen the album in the same session.
            </p>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-[2px] md:gap-1">
          {albumPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden"
              onContextMenu={(e) => {
                e.preventDefault();
                setContextPhotoId(photo.id);
              }}
            >
              <img
                alt={photo.alt}
                className="w-full h-full object-cover photo-grade"
                src={photo.url}
                referrerPolicy="no-referrer"
              />
              {userAlbum ? (
                <button
                  onClick={() => void handleRemove(photo.id)}
                  className="absolute right-2 top-2 z-20 inline-flex items-center gap-1.5 rounded-full border border-foreground/12 bg-black/60 px-3 py-2 text-rose-accent shadow-lg backdrop-blur-xl transition-colors hover:bg-black/72"
                  aria-label={`Remove ${photo.alt} from album`}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden label text-rose-accent sm:inline">Remove</span>
                </button>
              ) : null}
              <AnimatePresence>
                {contextPhotoId === photo.id && userAlbum && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setContextPhotoId(null)}
                      className="fixed inset-0 z-[60]"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute top-2 right-2 z-[70] bg-surface/95 backdrop-blur-xl border border-foreground/10 rounded-lg overflow-hidden shadow-xl"
                    >
                      <button
                        onClick={() => {
                          void handleRemove(photo.id);
                          setContextPhotoId(null);
                        }}
                        className="flex items-center gap-2 px-4 py-3 text-rose-accent label whitespace-nowrap"
                      >
                        <Trash2 className="w-4 h-4" /> Remove from album
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ))}
        </section>
      )}

      <Sheet open={showShareSheet} onClose={() => setShowShareSheet(false)}>
        <div className="overflow-y-auto px-6 pt-6 pb-4 md:px-8 md:pt-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-headline text-2xl md:text-3xl text-foreground font-light mb-1">{albumTitle || userAlbum?.title || 'Album'}</h3>
              <p className="label text-outline">{albumPhotos.length} photos to share</p>
            </div>
            <button
              onClick={() => setShowShareSheet(false)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-foreground/5"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-outline" />
            </button>
          </div>

          <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
            {albumPhotos.slice(0, 5).map((p) => (
              <img
                key={p.id}
                src={p.thumbnailUrl ?? p.url}
                className="w-12 h-12 md:w-14 md:h-14 object-cover flex-shrink-0 rounded"
                referrerPolicy="no-referrer"
                alt={p.alt}
              />
            ))}
            {albumPhotos.length > 5 && (
              <div className="w-12 h-12 md:w-14 md:h-14 bg-foreground/5 flex-shrink-0 flex items-center justify-center rounded">
                <span className="label text-outline">+{albumPhotos.length - 5}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 bg-foreground/5 border border-foreground/10 px-4 py-3 mb-4 rounded">
            <span className="flex-1 font-mono text-[11px] text-outline truncate">{window.location.origin}/event/{id}/albums/{albumId}</span>
            <button onClick={handleCopy} className="label text-rose-accent whitespace-nowrap hover:text-rose-accent/80 transition-colors">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <button
            onClick={handleCopy}
            className={cn(
              'w-full h-[48px] flex items-center justify-center gap-2 label font-bold mb-3 rounded transition-colors',
              copied ? 'bg-green-700 text-white' : 'bg-rose-accent text-white hover:bg-rose-accent/90'
            )}
          >
            {copied ? '✓ Link Copied' : 'Copy Link'}
          </button>
        </div>
      </Sheet>
    </motion.div>
  );
}
