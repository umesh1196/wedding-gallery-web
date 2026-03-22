import { Link } from 'react-router-dom';
import type { Event, Photo } from '../../lib/data';

interface HomeHeroProps {
  coupleNames: string;
  dateLabel: string;
  heroPhoto: Photo;
  featuredEvent: Event;
  isEarlyGallery?: boolean;
  publishedEventCount?: number;
  welcomeNote?: string;
  studioName?: string;
  supportLine?: string;
  freshnessLabel?: string;
}

export function HomeHero({
  coupleNames,
  dateLabel,
  heroPhoto,
  featuredEvent,
  isEarlyGallery = false,
  publishedEventCount = 0,
  welcomeNote,
  studioName = 'MPPF Photography',
  supportLine = 'A private space to revisit the celebration, keep favourites close, and return as new chapters arrive.',
  freshnessLabel,
}: HomeHeroProps) {
  return (
    <section className="relative min-h-[78svh] overflow-hidden md:min-h-[72svh]">
      <div className="absolute inset-0">
        <img
          className="h-full w-full object-cover"
          src={heroPhoto.url}
          alt={heroPhoto.alt}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_36%),linear-gradient(180deg,rgba(13,13,13,0.1),rgba(13,13,13,0.3)_35%,rgba(13,13,13,0.94)_90%)]" />
      </div>

      <div className="relative z-10 flex min-h-[78svh] items-end pb-8 pt-24 md:min-h-[72svh] md:pb-12 md:pt-24">
        <div className="wrap">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.7fr)] lg:items-end">
            <div className="max-w-3xl">
              <p className="label mb-3 text-white/58">A wedding gallery by {studioName}</p>
              <h1
                className="max-w-4xl font-headline italic leading-[0.92] text-white"
                style={{ fontSize: 'clamp(3.35rem, 8vw, 6.8rem)' }}
              >
                {coupleNames}
              </h1>
              <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-white/72 md:text-base">
                {isEarlyGallery
                  ? 'The gallery is just beginning to unfold, starting with the first chapter that has already been photographed and curated.'
                  : 'A quietly curated collection of portraits, rituals, family embraces, and all the in-between moments that made the celebration feel like theirs.'}
              </p>
              <p className="mt-3 max-w-lg font-body text-sm leading-relaxed text-white/58 md:text-[15px]">
                {supportLine}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-white/12 bg-black/18 px-3 py-2 backdrop-blur-sm">
                  <span className="label text-white/80">{dateLabel}</span>
                </div>
                {freshnessLabel && (
                  <div className="rounded-full border border-rose-accent/20 bg-rose-accent/10 px-3 py-2 backdrop-blur-sm">
                    <span className="label text-rose-accent">{freshnessLabel}</span>
                  </div>
                )}
                <Link
                  to={`/event/${featuredEvent.id}`}
                  state={{ backTo: '/', backLabel: 'Photos' }}
                  className="label inline-flex min-h-11 items-center justify-center rounded-full bg-rose-accent px-5 text-white transition-colors hover:bg-rose-accent/90"
                >
                  {isEarlyGallery ? `Start with ${featuredEvent.title}` : `Begin with ${featuredEvent.title}`}
                </Link>
              </div>

              {welcomeNote && (
                <div className="mt-6 max-w-2xl rounded-[1.45rem] border border-white/8 bg-black/18 px-4 py-4 backdrop-blur-sm md:px-5">
                  <p className="label text-white/44">A Note From The Studio</p>
                  <p className="mt-3 font-body text-sm leading-relaxed text-white/76 md:text-[15px]">
                    {welcomeNote}
                  </p>
                </div>
              )}
            </div>

            <div className="soft-panel rounded-[1.8rem] p-4 md:p-5">
              <p className="label text-white/44">Featured Chapter</p>
              <div className="mt-3 overflow-hidden rounded-[1.35rem]">
                <img
                  src={featuredEvent.coverUrl}
                  alt={featuredEvent.title}
                  className="h-44 w-full object-cover md:h-52"
                  referrerPolicy="no-referrer"
                />
              </div>
              {freshnessLabel && (
                <div className="mt-4 inline-flex rounded-full border border-rose-accent/20 bg-rose-accent/8 px-3 py-2">
                  <span className="label text-rose-accent">{freshnessLabel}</span>
                </div>
              )}
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-headline text-[2rem] italic leading-none text-white">{featuredEvent.title}</h2>
                  <p className="mt-2 label text-white/52">{featuredEvent.date}</p>
                </div>
                <div className="text-right">
                  <p className="label text-white/40">{isEarlyGallery ? 'Live Now' : 'Moments'}</p>
                  <p className="mt-1 font-body text-sm text-white/84">
                    {isEarlyGallery ? `${publishedEventCount} chapter live` : `${featuredEvent.photoCount} photos`}
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t border-white/8 pt-4">
                <p className="label text-white/38">Presented By</p>
                <p className="mt-2 font-body text-sm text-white/74">{studioName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
