import { Link } from 'react-router-dom';
import type { Photo } from '../../lib/data';

interface HighlightStripProps {
  photos: Photo[];
}

export function HighlightStrip({ photos }: HighlightStripProps) {
  return (
    <section className="wrap">
      <div className="mb-5 flex items-end justify-between gap-4 md:mb-7">
        <div>
          <p className="label text-outline">Featured Moments</p>
          <h2 className="mt-2 font-headline text-[2.1rem] font-light text-foreground md:text-4xl">
            A few frames that set the tone
          </h2>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr] md:gap-4">
        {photos.slice(0, 1).map((photo) => (
          <Link
            key={photo.id}
            to={`/photo/${photo.id}`}
            state={{ backTo: '/', backLabel: 'Photos' }}
            className="group relative min-h-[20rem] overflow-hidden rounded-[1.9rem] md:min-h-[30rem]"
          >
            <img
              src={photo.url}
              alt={photo.alt}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/86 via-black/14 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <p className="label text-foreground/50">{photo.date}</p>
              <p className="mt-2 max-w-lg font-headline text-[1.7rem] italic leading-tight text-foreground md:text-[2.3rem]">
                {photo.alt}
              </p>
            </div>
          </Link>
        ))}

        <div className="grid gap-3 md:gap-4">
          {photos.slice(1, 3).map((photo) => (
            <Link
              key={photo.id}
              to={`/photo/${photo.id}`}
              state={{ backTo: '/', backLabel: 'Photos' }}
              className="group relative min-h-[13rem] overflow-hidden rounded-[1.6rem] md:min-h-[14.75rem]"
            >
              <img
                src={photo.url}
                alt={photo.alt}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                <p className="label text-foreground/46">{photo.date}</p>
                <p className="mt-2 font-body text-sm leading-relaxed text-foreground/88 md:text-[15px]">
                  {photo.alt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
