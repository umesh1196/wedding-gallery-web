import { motion } from 'motion/react';
import { Heart, Folder } from 'lucide-react';
import { ALBUMS, EVENTS, PHOTOS } from '../lib/data';
import { useViewerStore } from '../store/viewerStore';
import { HomeHero } from '../components/home/HomeHero';
import { HighlightStrip } from '../components/home/HighlightStrip';
import { CollectionEntryCard } from '../components/home/CollectionEntryCard';
import { EventChapters } from '../components/home/EventChapters';
import { Link } from 'react-router-dom';
import { getGalleryTimeline } from '../lib/galleryTimeline';

export default function Home() {
  const { publishedEvents, upcomingEvents, latestPublishedEvent } = getGalleryTimeline(EVENTS, PHOTOS);
  const liveEventIds = new Set(publishedEvents.map((event) => event.id));
  const livePhotos = PHOTOS.filter((photo) => liveEventIds.has(photo.event));
  const highlights = livePhotos.filter((p) => p.isHighlight);
  const heroPhoto = highlights[0] ?? livePhotos[0] ?? PHOTOS[0];
  const featuredEvent = publishedEvents.find((event) => event.id === heroPhoto?.event) ?? publishedEvents[0] ?? EVENTS[0];
  const { favouriteIds, userAlbums } = useViewerStore();
  const savedPhotosCount = favouriteIds.length;
  const albumCount = ALBUMS.length + userAlbums.length;
  const isEarlyGallery = publishedEvents.length <= 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mobile-safe-top mobile-home-nav-spacer overflow-x-hidden md:pb-16"
    >
      <HomeHero
        coupleNames="Shruti & Umesh"
        dateLabel="Wedding weekend · Dec 10-12, 2025"
        heroPhoto={heroPhoto}
        featuredEvent={featuredEvent}
        isEarlyGallery={isEarlyGallery}
        publishedEventCount={publishedEvents.length}
        studioName="MPPF Photography"
        supportLine="A private gallery to wander slowly, revisit what matters, and return as each part of the wedding story is added."
        freshnessLabel={latestPublishedEvent ? `Latest chapter: ${latestPublishedEvent.title}` : undefined}
        welcomeNote={
          isEarlyGallery
            ? 'Thank you for being here early. This gallery will continue to grow as each part of the celebration is photographed, curated, and added with care.'
            : 'Welcome to a carefully curated record of the celebration. Take your time, save the moments you love, and return whenever you want to relive the day.'
        }
      />

      <div className="section-stack py-10 md:py-16">
        {highlights.length > 0 && <HighlightStrip photos={highlights.slice(0, 3)} />}

        <section className="wrap">
          <div className="mb-5 md:mb-7">
            <p className="label text-outline">Your Collections</p>
            <h2 className="mt-2 font-headline text-[2.15rem] font-light text-white md:text-4xl">
              {isEarlyGallery ? 'Your collection starts here' : 'Keep the moments you want close'}
            </h2>
            <p className="mt-3 max-w-lg font-body text-sm leading-relaxed text-white/58 md:text-[15px]">
              Save favourites as you browse, then gather them into albums that feel personal to your side of the story.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            <CollectionEntryCard
              title="Saved"
              description={
                savedPhotosCount === 0
                  ? 'Tap ♡ on any photo as you browse. Your personal collection stays private to you.'
                  : 'A personal place for the glances, embraces, and little moments you know you will come back to.'
              }
              countLabel={savedPhotosCount === 0 ? 'No saved moments yet' : `${savedPhotosCount} kept moment${savedPhotosCount !== 1 ? 's' : ''}`}
              href={savedPhotosCount === 0 ? '/events' : '/saved'}
              ctaLabel={savedPhotosCount === 0 ? 'Browse photos →' : 'Open collection →'}
              icon="saved"
            />
            <CollectionEntryCard
              title="Albums"
              description="Studio albums are curated and ready to share now. Select your own photos from any event to build a personal album and send one link to anyone."
              countLabel={`${ALBUMS.length} studio · ${userAlbums.length} personal`}
              href="/albums"
              ctaLabel="Browse albums →"
              icon="albums"
            />
          </div>

          {/* Two-track explainer */}
          <div className="mt-5 grid gap-3 md:grid-cols-2 md:gap-4">
            <div className="soft-panel rounded-[1.45rem] p-5 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-accent/12">
                  <Heart className="h-4 w-4 fill-current text-rose-accent" />
                </div>
                <p className="label text-white/60">Saving photos</p>
              </div>
              <p className="font-body text-sm leading-relaxed text-white/72 md:text-[15px]">
                Tap the heart on any photo as you browse. Your saved moments are private to you — a personal edit that lives in your Saved collection.
              </p>
            </div>
            <div className="soft-panel rounded-[1.45rem] p-5 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/6">
                  <Folder className="h-4 w-4 text-white/80" />
                </div>
                <p className="label text-white/60">Albums for sharing</p>
              </div>
              <p className="font-body text-sm leading-relaxed text-white/72 md:text-[15px]">
                Studio albums are ready to share now. Select photos from any event to build your own album, then send one link — instead of forwarding 40 photos on WhatsApp.
              </p>
            </div>
          </div>
        </section>

        <EventChapters
          events={publishedEvents}
          upcomingEvents={upcomingEvents}
          latestPublishedEventId={latestPublishedEvent?.id}
        />

        <section className="wrap">
          <div className="soft-panel rounded-[1.9rem] p-5 md:p-7">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div>
                <p className="label text-white/42">
                  {upcomingEvents.length > 0 ? 'Freshness and flow' : 'A quieter way to browse'}
                </p>
                <h2 className="mt-2 font-headline text-[2rem] font-light text-white md:text-[2.5rem]">
                  {isEarlyGallery
                    ? 'Start with the first published chapter, then come back as the rest of the story unfolds.'
                    : 'Start with the full story, then wander wherever the moments pull you.'}
                </h2>
                {latestPublishedEvent && (
                  <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-white/56 md:text-[15px]">
                    Most recently added: {latestPublishedEvent.title}. {upcomingEvents.length > 0
                      ? 'More chapters from the celebration are still to come.'
                      : 'The full set of published chapters is ready to explore.'}
                  </p>
                )}
              </div>
              <Link
                to="/events"
                className="label inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-5 text-white/82 transition-colors hover:border-white/18 hover:text-white"
              >
                {upcomingEvents.length > 0 ? 'See the timeline' : 'See every chapter'}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
