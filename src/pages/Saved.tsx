import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import type { Event, Photo } from '../lib/data';
import { fetchLikedPhotos } from '../lib/api/interactions';
import { fetchGalleryCeremonies } from '../lib/api/gallery';
import { mapCeremonyToEvent, mapGalleryPhotoToPhoto } from '../lib/api/adapters';
import { useSessionStore } from '../store/sessionStore';
import { useViewerStore } from '../store/viewerStore';

export default function Saved() {
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

  const byEvent = useMemo(
    () =>
      events
        .map((event) => ({
          event,
          photos: savedPhotos.filter((photo) => photo.event === event.id),
        }))
        .filter((group) => group.photos.length > 0),
    [events, savedPhotos]
  );

  if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="mobile-safe-top mobile-home-nav-spacer wrap min-h-screen py-24">
        <p className="font-body text-sm text-foreground/62">Loading saved moments…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-safe-top mobile-home-nav-spacer wrap min-h-screen py-24">
        <p className="font-body text-sm text-foreground/62">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mobile-safe-top mobile-home-nav-spacer min-h-screen md:pb-16"
    >
      <section className="wrap page-header">
        <p className="label mb-1 text-outline">Collected moments</p>
        <h2 className="font-headline text-[36px] font-light leading-tight text-foreground md:text-5xl lg:text-6xl">
          Saved
        </h2>
        <p className="mt-2 font-body text-sm text-foreground/60">
          Your personal collection — private to you.
        </p>
        {savedPhotos.length > 0 && (
          <p className="label mt-3 text-outline">
            {savedPhotos.length} saved photo{savedPhotos.length !== 1 ? 's' : ''} across{' '}
            {byEvent.length} chapter{byEvent.length !== 1 ? 's' : ''}
          </p>
        )}
      </section>

      {byEvent.length === 0 ? (
        <div className="wrap flex flex-col items-center py-24 text-center">
          <Heart className="mb-6 h-12 w-12 fill-current text-rose-accent/20" />
          <h3 className="mb-2 font-headline text-xl italic font-light text-foreground md:text-2xl">
            Your saved moments will appear here
          </h3>
          <p className="max-w-[240px] font-body text-sm leading-relaxed text-outline">
            Open any photo and tap the heart to keep it close.
          </p>
        </div>
      ) : (
        <div className="wrap section-stack pb-6 md:pb-10">
          {byEvent.map(({ event, photos }) => (
            <section key={event.id}>
              <Link
                to={`/event/${event.id}/saved`}
                state={{ backTo: '/saved', backLabel: 'Saved' }}
                className="group relative mb-4 block h-[108px] w-full overflow-hidden rounded-[1.5rem] md:mb-5 md:h-[168px] lg:h-[208px]"
              >
                <img
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={event.coverUrl || photos[0]?.url || ''}
                  alt={event.title}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex items-center justify-between px-5 md:px-8">
                  <div>
                    <h4 className="font-headline text-2xl italic text-foreground md:text-3xl lg:text-4xl">
                      {event.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-accent">
                    <Heart className="h-3.5 w-3.5 fill-current" />
                    <span className="label">{photos.length}</span>
                  </div>
                </div>
              </Link>

              <div className="grid grid-cols-4 gap-1 md:grid-cols-6 md:gap-1.5 lg:grid-cols-8">
                {photos.slice(0, 8).map((photo) => (
                  <Link
                    key={photo.id}
                    to={`/photo/${photo.id}?event=${encodeURIComponent(photo.event)}`}
                    state={{ backTo: '/saved', backLabel: 'Saved', eventId: photo.event }}
                    className="block aspect-square overflow-hidden"
                  >
                    <img
                      alt={photo.alt}
                      className="h-full w-full object-cover photo-grade transition-transform duration-500 hover:scale-105"
                      src={photo.thumbnailUrl ?? photo.url}
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                ))}
              </div>

              {photos.length > 8 && (
                <Link
                  to={`/event/${event.id}/saved`}
                  state={{ backTo: '/saved', backLabel: 'Saved' }}
                  className="label mt-2 block text-right text-outline transition-colors hover:text-foreground"
                >
                  View the rest →
                </Link>
              )}
            </section>
          ))}
        </div>
      )}
    </motion.div>
  );
}
