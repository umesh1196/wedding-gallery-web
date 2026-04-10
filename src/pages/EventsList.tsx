import { motion } from 'motion/react';
import { Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchGalleryCeremonies } from '../lib/api/gallery';
import { mapCeremonyToEvent } from '../lib/api/adapters';
import type { Event } from '../lib/data';
import { useSessionStore } from '../store/sessionStore';

export default function EventsList() {
  const { mode, galleryToken, studioSlug, weddingSlug, currentWedding } = useSessionStore();
  const [events, setEvents] = useState<Event[]>([]);
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

    fetchGalleryCeremonies(studioSlug, weddingSlug, galleryToken)
      .then((response) => {
        if (!active) return;
        setEvents(response.data.map(mapCeremonyToEvent));
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
  }, [galleryToken, mode, studioSlug, weddingSlug]);

  if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug) {
    return <Navigate to="/" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mobile-safe-top mobile-home-nav-spacer min-h-screen md:pb-16"
    >
      <section className="wrap page-header overflow-visible">
        <p className="label text-outline mb-1">{currentWedding?.couple_name ?? 'Wedding Gallery'}</p>
        <h2 className="font-headline pt-1 text-[36px] md:text-5xl lg:text-6xl font-light text-foreground leading-[1.12]">
          Chapters
        </h2>
        <p className="label text-outline mt-3">
          {loading
            ? 'Loading chapters…'
            : `${events.length} chapter${events.length !== 1 ? 's' : ''} ready to browse`}
        </p>
        {error && (
          <div className="mt-3 inline-flex rounded-full border border-rose-accent/18 bg-rose-accent/8 px-3 py-2">
            <span className="label text-rose-accent">{error}</span>
          </div>
        )}
      </section>

      <section className="wrap flex flex-col gap-4 pb-6 md:gap-5 md:pb-10">
        {!loading && events.length === 0 && (
          <div className="soft-panel rounded-[1.8rem] p-6 md:p-7">
            <p className="font-body text-sm leading-relaxed text-foreground/62 md:text-base">
              This gallery does not have any published chapters yet. Once the studio uploads and processes photos,
              they will appear here automatically.
            </p>
          </div>
        )}

        {events.map((event) => (
          <Link
            key={event.id}
            to={`/event/${event.id}`}
            state={{ backTo: '/events', backLabel: 'Chapters' }}
            className="group relative block overflow-hidden rounded-[1.75rem]"
          >
            <div className="aspect-[2/1] md:aspect-[3/1]">
              <img
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={event.listCoverUrl ?? event.coverUrl}
                alt={event.title}
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Gradient + name overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7">
              <div>
                <p className="label text-white/50 mb-1">{event.date}</p>
                <h3 className="font-headline text-[2rem] italic font-light leading-none text-white md:text-[2.6rem]">
                  {event.title}
                </h3>
              </div>
              <div className="flex-shrink-0 rounded-full border border-white/12 bg-black/30 px-3 py-1.5 backdrop-blur-sm">
                <span className="label text-white/70">{event.photoCount} photos</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </motion.div>
  );
}
