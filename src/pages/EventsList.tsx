import { motion } from 'motion/react';
import { EVENTS, PHOTOS } from '../lib/data';
import { Link } from 'react-router-dom';
import { getGalleryTimeline } from '../lib/galleryTimeline';

export default function EventsList() {
  const { publishedEvents, upcomingEvents, latestPublishedEvent } = getGalleryTimeline(EVENTS, PHOTOS);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mobile-safe-top mobile-home-nav-spacer min-h-screen md:pb-16"
    >
      {/* Page header */}
      <section className="wrap page-header overflow-visible">
        <p className="label text-outline mb-1">Shruti & Umesh</p>
        <h2 className="font-headline pt-1 text-[36px] md:text-5xl lg:text-6xl font-light text-white leading-[1.12]">
          Events
        </h2>
        <p className="label text-outline mt-3">
          {publishedEvents.length} live{publishedEvents.length !== 1 ? '' : ''}
          {upcomingEvents.length > 0 ? ` · ${upcomingEvents.length} coming soon` : ''}
        </p>
        {latestPublishedEvent && (
          <div className="mt-3 inline-flex rounded-full border border-rose-accent/18 bg-rose-accent/8 px-3 py-2">
            <span className="label text-rose-accent">Recently added: {latestPublishedEvent.title}</span>
          </div>
        )}
      </section>

      {/* Published events — full-width stacked cards */}
      <section className="wrap flex flex-col gap-4 pb-6 md:gap-5 md:pb-10">
        {publishedEvents.map((event) => (
          <Link
            key={event.id}
            to={`/event/${event.id}`}
            state={{ backTo: '/events', backLabel: 'Events' }}
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
                <span className="label text-white/70">{event.livePhotoCount} photos</span>
              </div>
            </div>
          </Link>
        ))}

        {/* Coming Soon */}
        {upcomingEvents.length > 0 && (
          <div className="mt-8 md:mt-10">
            <div className="mb-4 md:mb-5">
              <p className="label text-outline">Still To Come</p>
              <h3 className="mt-2 font-headline text-[1.9rem] font-light text-white md:text-[2.35rem]">
                More to come
              </h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="soft-panel overflow-hidden rounded-[1.65rem] border border-white/6"
                >
                  <div className="relative aspect-[1.1] overflow-hidden">
                    <img
                      className="h-full w-full object-cover grayscale-[0.2] opacity-70"
                      src={event.coverUrl}
                      alt={event.title}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/86 via-black/35 to-black/10" />
                    <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/24 px-3 py-2 backdrop-blur-sm">
                      <span className="label text-white/74">Coming Soon</span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                      <p className="label text-white/46">{event.date}</p>
                      <p className="mt-2 font-headline text-[2rem] italic leading-none text-white">
                        {event.title}
                      </p>
                    </div>
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
