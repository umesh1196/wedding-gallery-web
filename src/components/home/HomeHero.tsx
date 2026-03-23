import type { Photo } from '../../lib/data';

interface HomeHeroProps {
  coupleNames: string;
  dateLabel: string;
  heroPhoto: Photo;
  studioName?: string;
  freshnessLabel?: string;
}

export function HomeHero({
  coupleNames,
  dateLabel,
  heroPhoto,
  studioName = 'MPPF Photography',
  freshnessLabel,
}: HomeHeroProps) {
  return (
    <section className="relative min-h-[55svh] overflow-hidden md:min-h-[52svh]">
      <div className="absolute inset-0">
        <img
          className="h-full w-full object-cover"
          src={heroPhoto.url}
          alt={heroPhoto.alt}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_36%),linear-gradient(180deg,rgba(13,13,13,0.1),rgba(13,13,13,0.3)_35%,rgba(13,13,13,0.94)_90%)]" />
      </div>

      <div className="relative z-10 flex min-h-[55svh] items-end pb-8 pt-20 md:min-h-[52svh] md:pb-10 md:pt-24">
        <div className="wrap">
          <p className="label mb-3 text-foreground/58">A wedding gallery by {studioName}</p>
          <h1
            className="max-w-4xl font-headline italic leading-[0.92] text-foreground"
            style={{ fontSize: 'clamp(3rem, 7vw, 5.8rem)' }}
          >
            {coupleNames}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <div className="rounded-full border border-foreground/12 bg-black/18 px-3 py-2 backdrop-blur-sm">
              <span className="label text-foreground/80">{dateLabel}</span>
            </div>
            {freshnessLabel && (
              <div className="rounded-full border border-rose-accent/20 bg-rose-accent/10 px-3 py-2 backdrop-blur-sm">
                <span className="label text-rose-accent">{freshnessLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
