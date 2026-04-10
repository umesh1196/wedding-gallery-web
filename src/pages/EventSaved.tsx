import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Event, Photo } from '../lib/data';
import { fetchLikedPhotos } from '../lib/api/interactions';
import { fetchGalleryCeremonies } from '../lib/api/gallery';
import { mapCeremonyToEvent, mapGalleryPhotoToPhoto } from '../lib/api/adapters';
import { useSessionStore } from '../store/sessionStore';
import { useViewerStore } from '../store/viewerStore';

export default function EventSaved() {
  const { id } = useParams<{ id: string }>();
  const { mode, galleryToken, studioSlug, weddingSlug } = useSessionStore();
  const { replaceFavourites } = useViewerStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [savedPhotos, setSavedPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      fetchGalleryCeremonies(studioSlug, weddingSlug, galleryToken),
      fetchLikedPhotos(studioSlug, weddingSlug, galleryToken),
    ])
      .then(([ceremoniesResponse, likesResponse]) => {
        if (!active) return;

        const nextEvents = ceremoniesResponse.data.map(mapCeremonyToEvent);
        const nextSavedPhotos = likesResponse.data.map(mapGalleryPhotoToPhoto);

        setEvents(nextEvents);
        setSavedPhotos(nextSavedPhotos);
        replaceFavourites(nextSavedPhotos.map((photo) => photo.id));
      })
      .catch((loadError: Error) => {
        if (!active) return;
        setError(loadError.message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [galleryToken, mode, replaceFavourites, studioSlug, weddingSlug]);

  const event = useMemo(() => events.find((entry) => entry.id === id) ?? null, [events, id]);
  const eventSavedPhotos = useMemo(
    () => savedPhotos.filter((photo) => photo.event === id),
    [id, savedPhotos]
  );

  if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="wrap min-h-screen py-24">
        <p className="font-body text-sm text-foreground/62">Loading saved moments…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrap min-h-screen py-24">
        <p className="font-body text-sm text-foreground/62">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-14 pb-16 md:pt-16 md:pb-16"
    >
      <section className="wrap page-header">
        <p className="label mb-1 text-outline">{event?.title || 'Chapter'}</p>
        <h2 className="font-headline text-[2.5rem] font-light leading-tight text-foreground md:text-5xl lg:text-6xl">
          Saved
        </h2>
        <p className="label mt-1 text-outline">
          {eventSavedPhotos.length} saved photo{eventSavedPhotos.length !== 1 ? 's' : ''}
        </p>
      </section>

      {eventSavedPhotos.length === 0 ? (
        <div className="wrap flex flex-col items-center justify-center py-20 text-center">
          <Heart className="mb-6 h-12 w-12 fill-current text-rose-accent/20" />
          <h3 className="mb-2 font-headline text-xl italic font-light text-foreground md:text-2xl">
            No saved moments yet
          </h3>
          <p className="mb-8 max-w-[240px] font-body text-sm leading-relaxed text-outline">
            Open any photo and tap the heart to keep it here.
          </p>
          <Link
            to={`/event/${id}`}
            className="label flex min-h-11 items-center justify-center rounded-2xl border border-rose-accent/30 px-6 py-3 text-rose-accent transition-colors hover:bg-rose-accent/10"
          >
            Browse Moments
          </Link>
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-[2px] pb-6 md:grid-cols-4 md:gap-1 md:pb-10 lg:grid-cols-6">
          {eventSavedPhotos.map((photo) => (
            <Link
              key={photo.id}
              to={`/photo/${photo.id}?event=${encodeURIComponent(photo.event)}`}
              state={{ backTo: `/event/${id}/saved`, backLabel: 'Saved', eventId: photo.event }}
              className="relative block aspect-square overflow-hidden"
            >
              <img
                alt={photo.alt}
                className="h-full w-full object-cover photo-grade transition-transform duration-500 hover:scale-105"
                src={photo.thumbnailUrl ?? photo.url}
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-1.5 right-1.5">
                <Heart className="h-3.5 w-3.5 fill-current text-rose-accent drop-shadow-md" />
              </div>
            </Link>
          ))}
        </section>
      )}
    </motion.div>
  );
}
