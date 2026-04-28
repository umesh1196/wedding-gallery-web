import { motion } from 'motion/react';
import { Camera, Folder, Heart, Lock, User, Users } from 'lucide-react';
import { Link, Navigate, NavLink } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import type { Event, Photo } from '../lib/data';
import { fetchLikedPhotos } from '../lib/api/interactions';
import { fetchGalleryCeremonies } from '../lib/api/gallery';
import { mapCeremonyToEvent, mapGalleryPhotoToPhoto } from '../lib/api/adapters';
import { useSessionStore } from '../store/sessionStore';
import { useViewerStore } from '../store/viewerStore';

export default function Saved() {
  const { mode, galleryToken, studioSlug, weddingSlug, currentWedding, currentStudio } = useSessionStore();
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
  const brandLabel = currentWedding?.couple_name || currentStudio?.studio_name || 'Private Gallery';
  const navItems = [
    { label: 'Chapters', path: '/events', enabled: true, icon: Camera },
    { label: 'Saved', path: '/saved', enabled: true, icon: Heart },
    { label: 'Print Albums', path: '/albums', enabled: true, icon: Folder },
    { label: 'People', path: '#', enabled: false, icon: Users },
  ];

  if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5efe4] px-4 py-24 text-[#241d17] sm:px-6 lg:px-10">
        <p className="font-body text-sm text-[#6f665b]">Loading saved moments…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5efe4] px-4 py-24 text-[#241d17] sm:px-6 lg:px-10">
        <p className="font-body text-sm text-[#964b40]">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#f5efe4] text-[#241d17]"
    >
      <header className="sticky top-0 z-40 border-b border-[#dacdb9]/45 bg-[#f5efe4]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <span className="font-headline text-[1.85rem] font-light tracking-[-0.04em] text-[#7d5f3f]">
            {brandLabel}
          </span>
          <div className="flex items-center gap-3">
            <button className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d8cbb8] bg-[#f8f0e6] px-4 text-[10px] font-medium uppercase tracking-[0.22em] text-[#6b5646]">
              <Lock className="h-3.5 w-3.5" />
              Private Gallery
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dacdb9] bg-white/50 text-[#7f7367]">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-10 sm:px-6 md:pt-14 lg:px-10">
        <p className="font-headline text-[4rem] font-light leading-[0.92] tracking-[-0.04em] text-[#18130f] md:text-[5.8rem]">
          Saved
        </p>
        <p className="mt-4 max-w-2xl font-body text-lg leading-relaxed text-[#6f665b]">
          Your private collection of favorite moments, gathered across every chapter.
        </p>
        {savedPhotos.length > 0 && (
          <p className="mt-5 text-[12px] uppercase tracking-[0.28em] text-[#9a907f]">
            {savedPhotos.length} saved photo{savedPhotos.length !== 1 ? 's' : ''} across{' '}
            {byEvent.length} chapter{byEvent.length !== 1 ? 's' : ''}
          </p>
        )}

        <nav className="mt-12 border-b border-[#dfd6c8]">
          <div className="flex flex-wrap gap-x-8 gap-y-3 pb-3">
            {navItems.map((item) =>
              item.enabled ? (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    [
                      'relative pb-4 text-[12px] uppercase tracking-[0.34em] transition-colors',
                      isActive ? 'text-[#be3d2f]' : 'text-[#9a907f] hover:text-[#241d17]',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <span className="absolute inset-x-0 bottom-[-4px] h-[3px] rounded-full bg-[#be3d2f]" />
                      )}
                    </>
                  )}
                </NavLink>
              ) : (
                <span
                  key={item.label}
                  className="pb-4 text-[12px] uppercase tracking-[0.34em] text-[#c2b7a6]"
                >
                  {item.label}
                </span>
              )
            )}
          </div>
        </nav>

        {error && (
          <div className="mt-6 inline-flex rounded-full border border-[#ddb6ac] bg-[#f8ddd7] px-4 py-2">
            <span className="text-sm text-[#964b40]">{error}</span>
          </div>
        )}
      </section>

      {byEvent.length === 0 ? (
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-10">
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-[2rem] border border-[#decfbb] bg-white/45 px-6 py-16 text-center shadow-[0_20px_50px_rgba(70,54,35,0.06)]">
            <Heart className="mb-6 h-12 w-12 fill-current text-[#be3d2f]/20" />
            <h3 className="mb-2 font-headline text-2xl font-light tracking-[-0.03em] text-[#241d17] md:text-3xl">
              Your saved moments will appear here
            </h3>
            <p className="max-w-md font-body text-sm leading-relaxed text-[#6f665b] md:text-base">
              Open any photo and tap the heart to keep it close. Everything you love will gather
              here automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-14 sm:px-6 md:pb-20 lg:px-10">
          <div className="space-y-10">
          {byEvent.map(({ event, photos }) => (
            <section key={event.id} className="rounded-[2rem] border border-[#decfbb] bg-white/42 p-4 shadow-[0_20px_50px_rgba(70,54,35,0.06)] md:p-6">
              <Link
                to={`/event/${event.id}/saved`}
                state={{ backTo: '/saved', backLabel: 'Saved' }}
                className="group relative mb-5 block h-[180px] w-full overflow-hidden rounded-[1.6rem] md:mb-6 md:h-[240px] lg:h-[280px]"
              >
                <img
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={event.coverUrl || photos[0]?.url || ''}
                  alt={event.title}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(245,239,228,0.9)] via-[rgba(245,239,228,0.32)] to-[rgba(245,239,228,0.06)]" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-5 md:px-7 md:pb-6">
                  <div className="text-[#241d17]">
                    {event.date ? (
                      <p className="mb-2 text-[11px] uppercase tracking-[0.34em] text-[#8a7562]">
                        {event.date}
                      </p>
                    ) : null}
                    <h4 className="font-headline text-[2.2rem] font-light tracking-[-0.04em] md:text-[3rem] lg:text-[3.4rem]">
                      {event.title}
                    </h4>
                    <p className="mt-2 text-sm text-[#6f665b]">
                      {photos.length} saved photo{photos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="hidden items-center gap-1.5 rounded-full border border-[#d9ccb8] bg-[#f8f0e6]/95 px-4 py-2 text-[#6b5646] shadow-[0_10px_24px_rgba(70,54,35,0.08)] backdrop-blur-sm md:flex">
                    <Heart className="h-4 w-4 fill-current" />
                    <span className="text-[11px] uppercase tracking-[0.22em]">
                      {photos.length} saved
                    </span>
                  </div>
                </div>
              </Link>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-4">
                {photos.slice(0, 8).map((photo) => (
                  <Link
                    key={photo.id}
                    to={`/photo/${photo.id}?event=${encodeURIComponent(photo.event)}`}
                    state={{ backTo: '/saved', backLabel: 'Saved', eventId: photo.event }}
                    className="group block aspect-[0.95] overflow-hidden rounded-[1.35rem] bg-[#eadfce]"
                  >
                    <img
                      alt={photo.alt}
                      className="h-full w-full object-cover photo-grade transition-transform duration-500 group-hover:scale-[1.04]"
                      src={photo.url ?? photo.thumbnailUrl}
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                ))}
              </div>

              {photos.length > 8 && (
                <Link
                  to={`/event/${event.id}/saved`}
                  state={{ backTo: '/saved', backLabel: 'Saved' }}
                  className="mt-4 inline-flex items-center rounded-full border border-[#dacdb9] bg-[#f8f0e6] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#6b5646] transition-colors hover:border-[#cdbca5] hover:text-[#241d17]"
                >
                  View the rest
                </Link>
              )}
            </section>
          ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
