import type { Event, Photo } from '../../lib/data';
import { getEventEditorial } from '../../lib/eventEditorial';

interface EventHeroProps {
  event: Event;
  heroPhoto: Photo;
}

export function EventHero({ event, heroPhoto }: EventHeroProps) {
  const editorial = getEventEditorial(event.id);

  return (
    <section className="wrap pt-6 md:pt-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#decfbb] bg-[#f1e7d8] shadow-[0_28px_60px_rgba(70,54,35,0.12)]">
        <div className="absolute inset-0">
          <img
            alt={event.title}
            className="h-full w-full object-cover object-[center_36%]"
            src={heroPhoto.url}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,12,9,0.10),rgba(16,12,9,0.14)_24%,rgba(16,12,9,0.66)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(252,241,224,0.28),transparent_34%)]" />
        </div>
        <div className="relative z-10 flex min-h-[360px] items-end pb-8 pt-20 md:min-h-[520px] md:pb-10">
          <div className="w-full px-5 md:px-8 lg:px-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.55fr)] lg:items-end">
              <div className="max-w-3xl">
                <p className="font-label text-[10px] uppercase tracking-[0.34em] text-white/64">
                  {event.date}
                </p>
                <h1 className="mt-3 font-headline text-[3rem] font-light uppercase leading-[0.9] tracking-[0.08em] text-white md:text-[4.4rem] lg:text-[5.6rem]">
                  {event.title}
                </h1>
                <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-white/82 md:text-base">
                  {editorial.subtitle}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                  <span className="label text-white/78">{editorial.moodLabel}</span>
                </div>
              </div>

              <div className="flex lg:justify-end">
                <div className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/18 bg-black/16 px-5 text-center backdrop-blur-md lg:w-auto lg:min-w-[16rem]">
                  <span className="label text-white/72">Hold any photo to select</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
