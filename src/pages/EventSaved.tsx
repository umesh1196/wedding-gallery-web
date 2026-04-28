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
import { EventPageTabs } from '../components/Navigation';

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
      className="min-h-screen bg-[#f5efe4] pt-20 pb-24 text-[#241d17] md:pt-24 md:pb-16"
    >
      <section className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-8 sm:px-6 md:pb-8 md:pt-10 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.32em] text-[#9a907f]">
              Saved moments
            </p>
            <h1 className="mt-2 font-headline text-[3.2rem] font-light leading-[0.92] tracking-[-0.04em] text-[#18130f] md:text-[4.8rem]">
              {event?.title || 'Chapter'}
            </h1>
            <p className="mt-3 max-w-2xl font-body text-lg leading-relaxed text-[#6f665b]">
              The frames you hearted from this chapter, gathered into one quieter collection for easy revisiting.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#d8cbb8] bg-[#f8f0e6] px-4 py-2 text-[#6b5646] shadow-[0_10px_30px_rgba(70,54,35,0.06)]">
            <Heart className="h-4 w-4 fill-current text-[#be3d2f]" />
            <span className="label">
              {eventSavedPhotos.length} saved photo{eventSavedPhotos.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        {id ? <EventPageTabs eventId={id} /> : null}
      </section>

      {eventSavedPhotos.length === 0 ? (
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-10">
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-[2rem] border border-[#decfbb] bg-white/45 px-6 py-16 text-center shadow-[0_20px_50px_rgba(70,54,35,0.06)]">
          <Heart className="mb-6 h-12 w-12 fill-current text-[#be3d2f]/20" />
          <h3 className="mb-2 font-headline text-2xl font-light tracking-[-0.03em] text-[#241d17] md:text-3xl">
            No saved moments yet
          </h3>
          <p className="mb-8 max-w-md font-body text-sm leading-relaxed text-[#6f665b] md:text-base">
            Open any photo and tap the heart to keep it here.
          </p>
          <Link
            to={`/event/${id}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#dacdb9] bg-[#f8f0e6] px-6 py-3 text-[11px] uppercase tracking-[0.24em] text-[#6b5646] transition-colors hover:border-[#cdbca5] hover:text-[#241d17]"
          >
            Browse Moments
          </Link>
          </div>
        </div>
      ) : (
        <section className="px-4 pb-8 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {eventSavedPhotos.map((photo) => (
            <Link
              key={photo.id}
              to={`/photo/${photo.id}?event=${encodeURIComponent(photo.event)}`}
              state={{ backTo: `/event/${id}/saved`, backLabel: 'Saved', eventId: photo.event }}
              className="group relative block aspect-[0.95] overflow-hidden rounded-[1.35rem] bg-[#eadfce] shadow-[0_14px_36px_rgba(70,54,35,0.08)]"
            >
              <img
                alt={photo.alt}
                className="h-full w-full object-cover photo-grade transition-transform duration-500 group-hover:scale-[1.04]"
                src={photo.url ?? photo.thumbnailUrl}
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#f5e9d6] bg-[#fff7eb]/92 text-[#be3d2f] shadow-[0_10px_24px_rgba(70,54,35,0.12)]">
                <Heart className="h-4 w-4 fill-current" />
              </div>
            </Link>
          ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
