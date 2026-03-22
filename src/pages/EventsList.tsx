import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { EVENTS, PHOTOS } from '../lib/data';
import { Link } from 'react-router-dom';
import { getGalleryTimeline } from '../lib/galleryTimeline';

export default function EventsList() {
  const { publishedEvents, upcomingEvents, latestPublishedEvent } = getGalleryTimeline(EVENTS, PHOTOS);
  const isEarlyGallery = publishedEvents.length <= 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mobile-safe-top mobile-home-nav-spacer min-h-screen md:pb-16"
    >
      {/* Page header */}
      <section className="wrap page-header overflow-visible">
        <p className="label text-outline mb-1">The wedding story</p>
        <h2 className="font-headline pt-1 text-[36px] md:text-5xl lg:text-6xl font-light text-white leading-[1.12]">
          Events
        </h2>
        <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-white/62 md:text-base">
          {isEarlyGallery
            ? 'The gallery can grow chapter by chapter. Published events stay front and center while upcoming parts of the wedding remain softly in view.'
            : 'Move through the celebration chapter by chapter, with each event carrying its own atmosphere and set of moments.'}
        </p>
        <p className="label text-outline mt-3">
          {publishedEvents.length} live chapter{publishedEvents.length !== 1 ? 's' : ''}
          {upcomingEvents.length > 0 ? ` · ${upcomingEvents.length} coming soon` : ''}
        </p>
        {latestPublishedEvent && (
          <div className="mt-4 inline-flex rounded-full border border-rose-accent/18 bg-rose-accent/8 px-3 py-2">
            <span className="label text-rose-accent">Recently added: {latestPublishedEvent.title}</span>
          </div>
        )}
      </section>

      {/* Events grid */}
      <section className="wrap pb-6 md:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {publishedEvents.map((event) => (
            <Link
              key={event.id}
              to={`/event/${event.id}`}
              state={{ backTo: '/events', backLabel: 'Events' }}
              className="block relative w-full h-[180px] md:h-[240px] lg:h-[300px] overflow-hidden group"
            >
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={event.coverUrl}
                alt={event.title}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 to-transparent" />
              <div className="absolute bottom-4 left-4 md:bottom-5 md:left-5">
                {latestPublishedEvent?.id === event.id && (
                  <div className="mb-2 inline-flex rounded-full border border-rose-accent/20 bg-rose-accent/10 px-2.5 py-1">
                    <span className="label text-rose-accent">Recently Added</span>
                  </div>
                )}
                <h4 className="font-headline italic text-3xl md:text-4xl text-white leading-none">{event.title}</h4>
                <p className="label text-white/50 mt-1">{event.date}</p>
              </div>
              <div className="absolute bottom-4 right-4 md:bottom-5 md:right-5 flex items-center gap-3">
                <span className="label text-white/50">{event.livePhotoCount} photos</span>
                <div className="flex items-center gap-1 text-white/50">
                  <Heart className="w-3 h-3 fill-current" />
                  <span className="label">{event.likes}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {upcomingEvents.length > 0 && (
          <div className="mt-8 md:mt-10">
            <div className="mb-4 md:mb-5">
              <p className="label text-outline">Coming Soon</p>
              <h3 className="mt-2 font-headline text-[2rem] font-light text-white md:text-[2.35rem]">
                More chapters from the celebration
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="soft-panel relative h-[180px] overflow-hidden rounded-[1.7rem] border border-white/6 md:h-[240px] lg:h-[300px]"
                >
                  <img
                    className="h-full w-full object-cover grayscale-[0.18] opacity-70"
                    src={event.coverUrl}
                    alt={event.title}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 to-transparent" />
                  <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/22 px-3 py-2 backdrop-blur-sm">
                    <span className="label text-white/76">Coming Soon</span>
                  </div>
                  <div className="absolute bottom-4 left-4 md:bottom-5 md:left-5">
                    <h4 className="font-headline italic text-3xl md:text-4xl text-white leading-none">{event.title}</h4>
                    <p className="label text-white/50 mt-1">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </motion.div>
  );
}
