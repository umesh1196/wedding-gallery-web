import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { TimelineEvent } from '../../lib/galleryTimeline';

interface EventChaptersProps {
  events: TimelineEvent[];
  upcomingEvents?: TimelineEvent[];
  latestPublishedEventId?: string;
}

export function EventChapters({
  events,
  upcomingEvents = [],
  latestPublishedEventId,
}: EventChaptersProps) {
  const isEarlyGallery = events.length <= 1;

  return (
    <section className="wrap">
      <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label text-outline">Wedding Chapters</p>
          <h2 className="mt-2 font-headline text-[2.2rem] font-light text-foreground md:text-4xl lg:text-5xl">
            {isEarlyGallery ? 'The story begins here' : 'Move through the celebration'}
          </h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
        {events.map((event, index) => {
          const isWide = index === 0 || index === 3;
          const isRecentlyAdded = latestPublishedEventId === event.id;

          return (
            <Link
              key={event.id}
              to={`/event/${event.id}`}
              state={{ backTo: '/', backLabel: 'Photos' }}
              className={[
                'group relative block overflow-hidden rounded-[1.85rem]',
                isWide ? 'lg:col-span-7' : 'lg:col-span-5',
              ].join(' ')}
            >
              <div className={isWide ? 'aspect-[1.12]' : 'aspect-[0.92] md:aspect-[1.08]'}>
                <img
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={event.coverUrl}
                  alt={event.title}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/14 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="label text-foreground/46">{event.date}</p>
                    {isRecentlyAdded && (
                      <div className="mt-2 inline-flex rounded-full border border-rose-accent/20 bg-rose-accent/10 px-2.5 py-1">
                        <span className="label text-rose-accent">Recently Added</span>
                      </div>
                    )}
                    <h3 className="mt-2 font-headline text-[2.35rem] italic leading-none text-foreground md:text-[2.9rem]">
                      {event.title}
                    </h3>
                  </div>
                  <div className="rounded-full border border-foreground/10 bg-black/20 px-3 py-2 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <span className="label text-foreground/70">{event.photoCount} photos</span>
                      <span className="flex items-center gap-1 text-foreground/62">
                        <Heart className="h-3 w-3 fill-current" />
                        <span className="label">{event.likes}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {upcomingEvents.length > 0 && (
        <div className="mt-8 md:mt-10">
          <div className="mb-4 md:mb-5">
            <p className="label text-outline">Still To Come</p>
            <h3 className="mt-2 font-headline text-[1.9rem] font-light text-foreground md:text-[2.35rem]">
              More to come
            </h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="soft-panel overflow-hidden rounded-[1.65rem] border border-foreground/6"
              >
                <div className="relative aspect-[1.1] overflow-hidden">
                  <img
                    className="h-full w-full object-cover grayscale-[0.2] opacity-70"
                    src={event.coverUrl}
                    alt={event.title}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/86 via-black/35 to-black/10" />
                  <div className="absolute right-4 top-4 rounded-full border border-foreground/10 bg-black/24 px-3 py-2 backdrop-blur-sm">
                    <span className="label text-foreground/74">Coming Soon</span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    <p className="label text-foreground/46">{event.date}</p>
                    <p className="mt-2 font-headline text-[2rem] italic leading-none text-foreground">
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
  );
}
