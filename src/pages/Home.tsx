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
  const ceremonyCover = EVENTS.find((e) => e.id === 'ceremony')?.coverUrl;
  const ceremonyCoverPhoto = ceremonyCover ? PHOTOS.find((p) => p.url === ceremonyCover) : undefined;
  const cer55 = PHOTOS.find((p) => p.id === 'cer-55');
  const eng40 = PHOTOS.find((p) => p.id === 'eng-40');
  const pinnedIds = new Set([cer55?.id, eng40?.id, ceremonyCoverPhoto?.id]);
  const otherHighlights = livePhotos.filter((p) => p.isHighlight && !pinnedIds.has(p.id));
  const highlights = [cer55, eng40, ceremonyCoverPhoto, ...otherHighlights].filter(Boolean) as typeof livePhotos;
  const receptionCover = EVENTS.find((e) => e.id === 'reception')?.coverUrl;
  const heroPhoto = (receptionCover && PHOTOS.find((p) => p.url === receptionCover)) ?? highlights[0] ?? livePhotos[0] ?? PHOTOS[0];
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
        dateLabel="Wedding · Dec 2025 – Feb 2026"
        heroPhoto={heroPhoto}
        studioName="MPPF Photography"
        freshnessLabel={latestPublishedEvent ? `Latest chapter: ${latestPublishedEvent.title}` : undefined}
      />

      <div className="section-stack py-10 md:py-16">
        {highlights.length > 0 && <HighlightStrip photos={highlights.slice(0, 3)} />}

        <section className="wrap">
          <div className="mb-5 md:mb-7">
            <p className="label text-outline">Your Collections</p>
            <h2 className="mt-2 font-headline text-[2.15rem] font-light text-foreground md:text-4xl">
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
                <p className="label text-foreground/60">Saving photos</p>
                <p className="mt-1 font-body text-sm text-foreground/70">Tap ♡ on any photo. Private to you.</p>
              </div>
            </div>
            <div className="soft-panel rounded-[1.45rem] p-4 md:p-5 flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-foreground/6">
                <Folder className="h-4 w-4 text-foreground/80" />
              </div>
              <div>
                <p className="label text-foreground/60">Albums for sharing</p>
                <p className="mt-1 font-body text-sm text-foreground/70">Select photos → album → one link.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="wrap">
          <Link
            to="/events"
            className="group flex items-center justify-between rounded-[1.7rem] border border-foreground/8 bg-foreground/[0.025] px-6 py-5 transition-colors hover:border-foreground/14 hover:bg-foreground/[0.04] md:px-8 md:py-6"
          >
            <div>
              <p className="label text-outline">5 chapters · Dec '25 – Feb '26</p>
              <h3 className="mt-1.5 font-headline text-[1.8rem] italic font-light text-foreground leading-none md:text-[2.2rem]">
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
