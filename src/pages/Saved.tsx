import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PHOTOS, EVENTS } from '../lib/data';
import { useViewerStore } from '../store/viewerStore';

export default function Saved() {
  const { favouriteIds } = useViewerStore();
  const savedPhotos = PHOTOS.filter((p) => favouriteIds.includes(p.id));

  const byEvent = EVENTS.map((event) => ({
    event,
    photos: savedPhotos.filter((p) => p.event === event.id),
  })).filter((group) => group.photos.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mobile-safe-top mobile-home-nav-spacer min-h-screen md:pb-16"
    >
      {/* Page header */}
      <section className="wrap page-header">
        <p className="label text-outline mb-1">Collected moments</p>
        <h2 className="font-headline text-[36px] md:text-5xl lg:text-6xl font-light text-white leading-tight">Saved</h2>
        <p className="mt-2 font-body text-sm text-white/60">
          Your personal collection — private to you.
        </p>
        {savedPhotos.length > 0 && (
          <p className="label text-outline mt-3">
            {savedPhotos.length} saved photo{savedPhotos.length !== 1 ? 's' : ''} across {byEvent.length} event{byEvent.length !== 1 ? 's' : ''}
          </p>
        )}
      </section>

      {byEvent.length === 0 ? (
        <div className="wrap flex flex-col items-center py-24 text-center">
          <Heart className="w-12 h-12 text-rose-accent/20 fill-current mb-6" />
          <h3 className="font-headline text-xl md:text-2xl italic font-light text-white mb-2">
            Your saved moments will appear here
          </h3>
          <p className="font-body text-sm text-outline leading-relaxed max-w-[240px]">
            Open any photo and tap ♡ to keep it close.
          </p>
        </div>
      ) : (
        <div className="wrap section-stack pb-6 md:pb-10">
          {byEvent.map(({ event, photos }) => (
            <section key={event.id}>
              {/* Event card cover */}
              <Link
                to={`/event/${event.id}/saved`}
                state={{ backTo: '/saved', backLabel: 'Saved' }}
                className="group relative mb-4 block h-[108px] w-full overflow-hidden rounded-[1.5rem] md:mb-5 md:h-[168px] lg:h-[208px]"
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={event.coverUrl}
                  alt={event.title}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex items-center justify-between px-5 md:px-8">
                  <div>
                    <h4 className="font-headline italic text-2xl md:text-3xl lg:text-4xl text-white">{event.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-accent">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span className="label">{photos.length}</span>
                  </div>
                </div>
              </Link>

              {/* Photo strip — 4-col → 6-col → 8-col */}
              <div className="grid grid-cols-4 gap-1 md:grid-cols-6 md:gap-1.5 lg:grid-cols-8">
                {photos.slice(0, 8).map((photo) => (
                  <Link
                    key={photo.id}
                    to={`/photo/${photo.id}`}
                    state={{ backTo: '/saved', backLabel: 'Saved' }}
                    className="aspect-square overflow-hidden block"
                  >
                    <img
                      alt={photo.alt}
                      className="w-full h-full object-cover photo-grade hover:scale-105 transition-transform duration-500"
                      src={photo.url}
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                ))}
              </div>

              {photos.length > 8 && (
                <Link
                  to={`/event/${event.id}/saved`}
                  state={{ backTo: '/saved', backLabel: 'Saved' }}
                  className="block mt-2 label text-outline text-right hover:text-white transition-colors"
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
