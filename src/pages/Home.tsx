import { motion } from 'motion/react';
import { Heart, Folder } from 'lucide-react';
import { ALBUMS, EVENTS, PHOTOS } from '../lib/data';
import { useViewerStore } from '../store/viewerStore';
import { HomeHero } from '../components/home/HomeHero';
import { HighlightStrip } from '../components/home/HighlightStrip';
import { CollectionEntryCard } from '../components/home/CollectionEntryCard';
import { Link } from 'react-router-dom';
import { getGalleryTimeline } from '../lib/galleryTimeline';

export default function Home() {
  const { publishedEvents, latestPublishedEvent } = getGalleryTimeline(EVENTS, PHOTOS);
  const liveEventIds = new Set(publishedEvents.map((event) => event.id));
  const livePhotos = PHOTOS.filter((photo) => liveEventIds.has(photo.event));
  const highlights = livePhotos.filter((p) => p.isHighlight);
  const heroPhoto = highlights[0] ?? livePhotos[0] ?? PHOTOS[0];
  const { favouriteIds, userAlbums } = useViewerStore();
  const savedPhotosCount = favouriteIds.length;
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
        studioName="MPPF Photography"
        freshnessLabel={latestPublishedEvent ? `Latest chapter: ${latestPublishedEvent.title}` : undefined}
      />

      <div className="section-stack py-10 md:py-16">
        {highlights.length > 0 && <HighlightStrip photos={highlights.slice(0, 3)} />}

        <section className="wrap">
          <div className="mb-5 md:mb-7">
            <p className="label text-outline">Your Collections</p>
            <h2 className="mt-2 font-headline text-[2.15rem] font-light text-white md:text-4xl">
              {isEarlyGallery ? 'Your collection starts here' : 'Keep the moments you want close'}
            </h2>
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
            <div className="soft-panel rounded-[1.45rem] p-4 md:p-5 flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-rose-accent/12">
                <Heart className="h-4 w-4 fill-current text-rose-accent" />
              </div>
              <div>
                <p className="label text-white/60">Saving photos</p>
                <p className="mt-1 font-body text-sm text-white/70">Tap ♡ on any photo. Private to you.</p>
              </div>
            </div>
            <div className="soft-panel rounded-[1.45rem] p-4 md:p-5 flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/6">
                <Folder className="h-4 w-4 text-white/80" />
              </div>
              <div>
                <p className="label text-white/60">Albums for sharing</p>
                <p className="mt-1 font-body text-sm text-white/70">Select photos → album → one link.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="wrap">
          <Link
            to="/events"
            className="group flex items-center justify-between rounded-[1.7rem] border border-white/8 bg-white/[0.025] px-6 py-5 transition-colors hover:border-white/14 hover:bg-white/[0.04] md:px-8 md:py-6"
          >
            <div>
              <p className="label text-outline">5 wedding chapters · Dec 10–12</p>
              <h3 className="mt-1.5 font-headline text-[1.8rem] italic font-light text-white leading-none md:text-[2.2rem]">
                The Haldi. The vows. The dance floor at midnight.
              </h3>
            </div>
            <span className="label text-rose-accent transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </section>
      </div>
    </motion.div>
  );
}
