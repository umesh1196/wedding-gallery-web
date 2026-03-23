import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { PHOTOS, EVENTS } from '../lib/data';
import { useViewerStore } from '../store/viewerStore';

export default function EventSaved() {
  const { id } = useParams<{ id: string }>();
  const { favouriteIds } = useViewerStore();

  const event = EVENTS.find((e) => e.id === id);
  const savedPhotos = PHOTOS.filter((p) => p.event === id && favouriteIds.includes(p.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-14 pb-16 md:pt-16 md:pb-16"
    >
      {/* Page header */}
      <section className="wrap page-header">
        <p className="label text-outline mb-1">{event?.title || 'Event'}</p>
        <h2 className="font-headline text-[2.5rem] md:text-5xl lg:text-6xl font-light text-white leading-tight">Saved</h2>
        <p className="label text-outline mt-1">{savedPhotos.length} saved photo{savedPhotos.length !== 1 ? 's' : ''}</p>
      </section>

      {savedPhotos.length === 0 ? (
        <div className="wrap flex flex-col items-center justify-center py-20 text-center">
          <Heart className="w-12 h-12 text-rose-accent/20 fill-current mb-6" />
          <h3 className="font-headline text-xl md:text-2xl italic font-light text-white mb-2">
            No saved moments yet
          </h3>
          <p className="font-body text-sm text-outline leading-relaxed max-w-[240px] mb-8">
            Open any photo and tap the heart to keep it here.
          </p>
          <Link
            to={`/event/${id}`}
            className="label flex min-h-11 items-center justify-center rounded-2xl border border-rose-accent/30 px-6 py-3 text-rose-accent hover:bg-rose-accent/10 transition-colors"
          >
            Browse Moments
          </Link>
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-[2px] pb-6 md:grid-cols-4 md:gap-1 md:pb-10 lg:grid-cols-6">
          {savedPhotos.map((photo) => (
            <Link
              key={photo.id}
              to={`/photo/${photo.id}`}
              state={{ backTo: `/event/${id}/saved`, backLabel: 'Saved' }}
              className="relative aspect-square overflow-hidden block"
            >
              <img
                alt={photo.alt}
                className="w-full h-full object-cover photo-grade hover:scale-105 transition-transform duration-500"
                src={photo.thumbnailUrl ?? photo.url}
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-1.5 right-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-accent fill-current drop-shadow-md" />
              </div>
            </Link>
          ))}
        </section>
      )}
    </motion.div>
  );
}
