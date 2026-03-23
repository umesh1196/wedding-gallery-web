import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { FolderOpen, Plus, Sparkles, X } from 'lucide-react';
import { ALBUMS, EVENTS } from '../lib/data';
import { useViewerStore } from '../store/viewerStore';
import { useState } from 'react';
import { useFeedback } from '../components/FeedbackProvider';
import { isHomeLevelBackTarget, readRouteState, toBackState } from '../lib/navigation';

export default function EventAlbums() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { userAlbums, createAlbum } = useViewerStore();
  const [showInput, setShowInput] = useState(false);
  const [title, setTitle] = useState('');
  const { showFeedback } = useFeedback();

  const event = EVENTS.find((entry) => entry.id === id);
  const studioAlbums = ALBUMS.filter((album) => album.eventId === id);
  const personalAlbums = userAlbums.filter((album) => album.eventId === id);
  const allAlbums = [...studioAlbums, ...personalAlbums];
  const navigationState = readRouteState(location);
  const detailBackState =
    isHomeLevelBackTarget(navigationState?.backTo)
      ? toBackState(navigationState?.backTo ?? '/albums', navigationState?.backLabel ?? 'Albums')
      : toBackState(`/event/${id}/albums`, 'Albums');

  const handleCreate = () => {
    if (!title.trim() || !id) return;
    const nextTitle = title.trim();
    createAlbum(nextTitle, id);
    setTitle('');
    setShowInput(false);
    showFeedback({
      title: `Created "${nextTitle}"`,
      message: 'You can start adding photos to it now.',
    });
  };

  if (!event) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-14 pb-16 md:pt-16 md:pb-16"
    >
      <section className="wrap page-header">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] lg:items-end">
          <div>
            <p className="label mb-1 text-outline">{event.title}</p>
            <h1 className="font-headline text-[2.5rem] font-light leading-tight text-foreground md:text-5xl lg:text-6xl">
              Albums
            </h1>
            <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-foreground/62 md:text-base">
              Studio-curated keepsakes sit alongside any personal albums you create for the portraits, family moments, or candid frames you want grouped together.
            </p>
            <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-foreground/46 md:text-[15px]">
              If you are sharing this page with family, the easiest way to start is to open a studio album first. Personal albums are there if you want to make your own smaller collection.
            </p>
          </div>

          <div className="soft-panel rounded-[1.7rem] p-4 md:p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="label text-foreground/40">Collections in this chapter</p>
                <p className="mt-2 font-body text-sm leading-relaxed text-foreground/76">
                  {allAlbums.length} collection{allAlbums.length !== 1 ? 's' : ''} ready to revisit.
                </p>
              </div>
              <div className="rounded-full border border-foreground/8 bg-black/14 px-3 py-1.5 backdrop-blur-sm">
                <span className="label text-foreground/74">{event.photoCount} moments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap pb-6 md:pb-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="space-y-9 md:space-y-11">
            <section>
              <div className="mb-4 flex items-end justify-between gap-4 md:mb-5">
                <div>
                  <p className="label text-outline">Studio Collections</p>
                  <h2 className="mt-2 font-headline text-[2rem] font-light text-foreground md:text-[2.35rem]">
                    Curated by the studio
                  </h2>
                </div>
                <div className="rounded-full border border-foreground/8 bg-foreground/[0.02] px-3 py-2">
                  <span className="label text-foreground/62">{studioAlbums.length} album{studioAlbums.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {studioAlbums.length === 0 ? (
                <div className="soft-panel rounded-[1.6rem] px-5 py-6">
                  <p className="font-body text-sm leading-relaxed text-foreground/60">
                    Studio collections will appear here once the chapter is curated.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                  {studioAlbums.map((album) => (
                    <Link
                      key={album.id}
                      to={`/event/${id}/albums/${album.id}`}
                      state={detailBackState}
                      className="group relative block aspect-[0.9] overflow-hidden rounded-[1.7rem] border border-foreground/5"
                    >
                      <img
                        alt={album.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={album.coverUrl}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/84 via-transparent to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                        <p className="label text-foreground/46">Studio</p>
                        <p className="mt-2 font-headline text-lg leading-tight text-foreground md:text-xl">{album.title}</p>
                        <p className="mt-1 label text-foreground/62">{album.photoIds.length} photos</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between gap-4 md:mb-5">
                <div>
                  <p className="label text-outline">Personal Collections</p>
                  <h2 className="mt-2 font-headline text-[2rem] font-light text-foreground md:text-[2.35rem]">
                    Created by you
                  </h2>
                </div>
                <div className="rounded-full border border-foreground/8 bg-foreground/[0.02] px-3 py-2">
                  <span className="label text-foreground/62">{personalAlbums.length} album{personalAlbums.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {personalAlbums.length === 0 ? (
                <div className="soft-panel rounded-[1.6rem] px-5 py-6">
                  <p className="font-body text-sm leading-relaxed text-foreground/60">
                    Create your own keepsake for family favourites, portraits, or any set of moments you want to keep together.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                  {personalAlbums.map((album) => (
                    <Link
                      key={album.id}
                      to={`/event/${id}/albums/${album.id}`}
                      state={detailBackState}
                      className="group relative block aspect-[0.9] overflow-hidden rounded-[1.7rem] border border-foreground/5"
                    >
                      {album.coverUrl ? (
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
                      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                        <p className="label text-foreground/46">Yours</p>
                        <p className="mt-2 font-headline text-lg leading-tight text-foreground md:text-xl">{album.title}</p>
                        <p className="mt-1 label text-foreground/62">{album.photoIds.length} photos</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="soft-panel rounded-[1.8rem] p-5 md:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-accent/14 text-rose-accent">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="label text-foreground/42">Create a collection</p>
                <h2 className="mt-1 font-headline text-[1.9rem] italic leading-none text-foreground">
                  Gather your favourites
                </h2>
              </div>
            </div>

            <p className="mt-4 font-body text-sm leading-relaxed text-foreground/62">
              Build personal collections for portraits, family favourites, or any set of moments you want to keep in one place.
            </p>

            {showInput ? (
              <div className="mt-5 space-y-3">
                <input
                  autoFocus
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && handleCreate()}
                  placeholder="Name this collection..."
                  className="min-h-12 w-full rounded-2xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-foreground label outline-none placeholder:text-foreground/20 uppercase tracking-widest"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    className="label flex min-h-11 flex-1 items-center justify-center rounded-full bg-rose-accent text-white transition-colors hover:bg-rose-accent/90"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowInput(false);
                      setTitle('');
                    }}
                    className="flex min-h-11 w-11 items-center justify-center rounded-full border border-foreground/10 text-foreground/56 transition-colors hover:text-foreground"
                    aria-label="Cancel album creation"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowInput(true)}
                className="label mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-rose-accent/30 bg-rose-accent/8 text-rose-accent transition-colors hover:bg-rose-accent/12"
              >
                <Plus className="h-4 w-4" /> Start a Collection
              </button>
            )}
          </aside>
        </div>
      </section>
    </motion.div>
  );
}
