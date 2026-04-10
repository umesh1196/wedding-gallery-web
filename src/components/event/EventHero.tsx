import type { Event, Photo } from '../../lib/data';
import { getEventEditorial } from '../../lib/eventEditorial';

interface EventHeroProps {
  event: Event;
  heroPhoto: Photo;
}

export function EventHero({ event, heroPhoto }: EventHeroProps) {
  const editorial = getEventEditorial(event.id);

  return (
    <section className="relative min-h-[340px] overflow-hidden md:min-h-[520px]">
      <img
        alt={event.title}
        className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
        src={heroPhoto.url}
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,13,13,0.18),rgba(13,13,13,0.26)_24%,rgba(13,13,13,0.92)_92%)]" />
      <div className="relative z-10 flex min-h-[340px] items-end pb-8 pt-20 md:min-h-[520px] md:pb-10">
        <div className="wrap">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(14rem,0.5fr)] lg:items-end">
            <div className="max-w-3xl rounded-[1.8rem] bg-[linear-gradient(180deg,rgba(13,13,13,0.08),rgba(13,13,13,0.18)_28%,rgba(13,13,13,0.52)_100%)] px-4 py-5 backdrop-blur-[2px] md:px-6 md:py-6">
              <p className="label mb-2 text-white/62">{event.date}</p>
              <h1 className="font-headline text-[2.6rem] italic leading-[0.94] text-white md:text-5xl lg:text-6xl">
                {event.title}
              </h1>
              <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-white/82 md:text-base">
                {editorial.subtitle}
              </p>
              <div className="mt-4 inline-flex rounded-full border border-foreground/10 bg-black/18 px-3 py-2 backdrop-blur-sm">
                <span className="label text-white/74">{editorial.moodLabel}</span>
              </div>
            </div>

            <div className="flex lg:justify-end">
              <div className="label inline-flex min-h-11 w-full items-center justify-center rounded-full border border-foreground/10 bg-black/18 px-4 text-foreground/50 backdrop-blur-sm lg:w-auto lg:min-w-[14rem]">
                Hold any photo to select
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
