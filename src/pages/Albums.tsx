import { motion } from 'motion/react';
import { Folder, FolderOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ALBUMS, EVENTS } from '../lib/data';
import { useViewerStore } from '../store/viewerStore';

export default function Albums() {
  const { userAlbums } = useViewerStore();

  const byEvent = EVENTS.map((event) => {
    const studioAlbums = ALBUMS.filter((album) => album.eventId === event.id);
    const personalAlbums = userAlbums.filter((album) => album.eventId === event.id);
    const albums = [...studioAlbums, ...personalAlbums];

    return { event, albums, studioAlbums, personalAlbums };
  }).filter((group) => group.albums.length > 0);

  const totalAlbums = byEvent.reduce((count, group) => count + group.albums.length, 0);
  const totalStudioAlbums = byEvent.reduce((count, group) => count + group.studioAlbums.length, 0);
  const totalPersonalAlbums = byEvent.reduce((count, group) => count + group.personalAlbums.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mobile-safe-top mobile-home-nav-spacer min-h-screen md:pb-16"
    >
      <section className="wrap page-header">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] lg:items-end">
          <div>
            <p className="label mb-1 text-outline">Curated collections</p>
            <h2 className="font-headline text-[36px] font-light leading-tight text-foreground md:text-5xl lg:text-6xl">
              Albums
            </h2>
            <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-foreground/62 md:text-base">
              Revisit the wedding as a set of thoughtful keepsakes, from studio-curated collections to the albums you build around your own favourite moments.
            </p>
            <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-foreground/46 md:text-[15px]">
              Studio albums are prepared for everyone to enjoy. Personal albums are only for the moments you decide to gather yourself.
            </p>
          </div>

          <div className="soft-panel rounded-[1.7rem] p-4 md:p-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <p className="label text-foreground/40">All Collections</p>
                <p className="mt-2 font-headline text-[1.75rem] leading-none text-foreground md:text-[2rem]">
                  {totalAlbums}
                </p>
              </div>
              <div>
                <p className="label text-foreground/40">Studio</p>
                <p className="mt-2 font-body text-lg text-foreground/82">{totalStudioAlbums}</p>
              </div>
              <div>
                <p className="label text-foreground/40">Yours</p>
                <p className="mt-2 font-body text-lg text-foreground/82">{totalPersonalAlbums}</p>
              </div>
            </div>
            {totalAlbums > 0 && (
              <p className="mt-4 font-body text-sm leading-relaxed text-foreground/58">
                Spread across {byEvent.length} wedding chapter{byEvent.length !== 1 ? 's' : ''}.
              </p>
            )}
          </div>
        </div>
      </section>

      {byEvent.length === 0 ? (
        <div className="wrap flex flex-col items-center py-24 text-center">
          <Folder className="mb-6 h-12 w-12 text-rose-accent/20" />
          <h3 className="mb-2 font-headline text-xl italic font-light text-foreground md:text-2xl">
            No albums yet
          </h3>
          <p className="max-w-[260px] font-body text-sm leading-relaxed text-outline">
            Create your own collections from any chapter and they will gather here.
          </p>
          <p className="mt-3 max-w-[280px] font-body text-sm leading-relaxed text-foreground/46">
            This is a simple way to keep family portraits, favourite candid moments, or any small set of photos together in one place.
          </p>
        </div>
      ) : (
        <div className="wrap section-stack pb-6 md:pb-10">
          {byEvent.map(({ event, albums, studioAlbums, personalAlbums }) => (
            <section
              key={event.id}
              className="soft-panel overflow-hidden rounded-[1.9rem] border border-foreground/6"
            >
              <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <Link
                  to={`/event/${event.id}/albums`}
                  state={{ backTo: '/albums', backLabel: 'Albums' }}
                  className="group relative block min-h-[220px] overflow-hidden border-b border-foreground/6 lg:min-h-[360px] lg:border-r lg:border-b-0"
                >
                  <img
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={event.coverUrl}
                    alt={event.title}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.7))]" />
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                    <p className="label text-white/52">{event.date}</p>
                    <h4 className="mt-2 font-headline text-[2.1rem] italic leading-none text-white md:text-[2.7rem]">
                      {event.title}
                    </h4>
                    <p className="mt-3 max-w-sm font-body text-sm leading-relaxed text-white/68">
                      A mix of studio-kept favourites and personal albums gathered around this part of the celebration.
                    </p>
                  </div>
                </Link>

                <div className="flex flex-col p-4 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-foreground/6 pb-4 md:pb-5">
                    <div>
                      <p className="label text-outline">This Chapter</p>
                      <p className="mt-2 font-body text-sm leading-relaxed text-foreground/70">
                        {albums.length} collection{albums.length !== 1 ? 's' : ''} ready to revisit.
                      </p>
                      <p className="mt-2 max-w-sm font-body text-xs leading-relaxed text-foreground/46 md:text-sm">
                        Open the chapter to browse the studio's curated collections or any personal albums you have created for your family.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-foreground/8 bg-foreground/[0.02] px-3 py-2">
                        <Sparkles className="h-3.5 w-3.5 text-rose-accent" />
                        <span className="label text-foreground/62">{studioAlbums.length} studio</span>
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-foreground/8 bg-foreground/[0.02] px-3 py-2">
                        <FolderOpen className="h-3.5 w-3.5 text-foreground/70" />
                        <span className="label text-foreground/62">{personalAlbums.length} personal</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 md:mt-5 md:grid-cols-3">
                    {albums.slice(0, 3).map((album) => (
                      <Link
                        key={album.id}
                        to={`/event/${event.id}/albums/${album.id}`}
                        state={{ backTo: '/albums', backLabel: 'Albums' }}
                        className="group relative block aspect-[0.9] overflow-hidden rounded-[1.5rem] border border-foreground/5"
                      >
                        {'coverUrl' in album && album.coverUrl ? (
                          <img
                            alt={album.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            src={album.coverUrl}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(201,80,106,0.16),transparent_42%),linear-gradient(180deg,#1a1718,#141414)]">
                            <FolderOpen className="h-8 w-8 text-rose-accent/70" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/84 via-transparent to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <p className="label text-foreground/46">
                            {'createdAt' in album ? 'Yours' : 'Studio'}
                          </p>
                          <p className="mt-2 font-headline text-lg leading-tight text-foreground md:text-xl">
                            {album.title}
                          </p>
                          <p className="mt-1 label text-foreground/62">{album.photoIds.length} photos</p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <Link
                    to={`/event/${event.id}/albums`}
                    state={{ backTo: '/albums', backLabel: 'Albums' }}
                    className="mt-5 inline-flex items-center gap-2 self-start rounded-full border border-rose-accent/24 bg-rose-accent/8 px-4 py-2.5 label text-rose-accent transition-colors hover:bg-rose-accent/12"
                  >
                    Browse this chapter
                  </Link>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </motion.div>
  );
}
