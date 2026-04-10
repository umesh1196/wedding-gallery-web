import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { FolderOpen, Plus, Sparkles, X } from 'lucide-react';
import { createGalleryAlbum, fetchGalleryAlbums } from '../lib/api/albums';
import { fetchGalleryCeremonies } from '../lib/api/gallery';
import { mapCeremonyToEvent } from '../lib/api/adapters';
import { useSessionStore } from '../store/sessionStore';
import { useViewerStore } from '../store/viewerStore';
import { useFeedback } from '../components/FeedbackProvider';
import { isHomeLevelBackTarget, readRouteState, toBackState } from '../lib/navigation';

interface BackendBackedAlbumCard {
  id: string;
  slug: string;
  title: string;
  photoCount: number;
  coverUrl?: string;
}

export default function EventAlbums() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { showFeedback } = useFeedback();
  const { galleryToken, mode, studioSlug, weddingSlug } = useSessionStore();
  const { userAlbums, upsertUserAlbum } = useViewerStore();
  const [showInput, setShowInput] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventPhotoCount, setEventPhotoCount] = useState(0);
  const [personalAlbums, setPersonalAlbums] = useState<BackendBackedAlbumCard[]>([]);

  const navigationState = readRouteState(location);
  const detailBackState =
    isHomeLevelBackTarget(navigationState?.backTo)
      ? toBackState(navigationState?.backTo ?? '/albums', navigationState?.backLabel ?? 'Albums')
      : toBackState(`/event/${id}/albums`, 'Albums');

  const getAlbumPhotoCount = (album: { photoCount?: number }) => album.photoCount ?? 0;
  const studioAlbums: BackendBackedAlbumCard[] = [];

  useEffect(() => {
    let active = true;

    async function load() {
      if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug || !id) {
        if (!active) return;
        setLoading(false);
        setError('Open this page from the guest gallery to load albums.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [ceremoniesResponse, albumsResponse] = await Promise.all([
          fetchGalleryCeremonies(studioSlug, weddingSlug, galleryToken),
          fetchGalleryAlbums(studioSlug, weddingSlug, id, galleryToken),
        ]);

        if (!active) return;

        const ceremony = ceremoniesResponse.data.find((entry) => entry.slug === id);
        if (!ceremony) {
          setError('This chapter could not be found.');
          setLoading(false);
          return;
        }

        const mappedEvent = mapCeremonyToEvent(ceremony);
        setEventTitle(mappedEvent.title);
        setEventDate(mappedEvent.date);
        setEventPhotoCount(mappedEvent.photoCount);

        const mappedAlbums = albumsResponse.data.map((album) => ({
          id: album.id,
          slug: album.slug,
          title: album.name,
          photoCount: album.photos_count ?? 0,
          coverUrl: undefined,
        }));

        setPersonalAlbums(mappedAlbums);
        mappedAlbums.forEach((album) => {
          upsertUserAlbum({
            id: album.id,
            slug: album.slug,
            title: album.title,
            eventId: id,
            photoIds: [],
            photoCount: album.photoCount,
            createdAt: new Date().toISOString(),
          });
        });
      } catch {
        if (!active) return;
        setError('Albums could not be loaded right now.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [galleryToken, id, mode, studioSlug, upsertUserAlbum, weddingSlug]);

  const mergedPersonalAlbums = useMemo(() => {
    const cardsById = new Map(personalAlbums.map((album) => [album.id, album]));

    userAlbums
      .filter((album) => album.eventId === id)
      .forEach((album) => {
        const existing = cardsById.get(album.id);
        cardsById.set(album.id, {
          id: album.id,
          slug: album.slug ?? existing?.slug ?? album.id,
          title: album.title,
          photoCount: album.photoCount ?? album.photoIds?.length ?? existing?.photoCount ?? 0,
          coverUrl: album.coverUrl ?? existing?.coverUrl,
        });
      });

    return Array.from(cardsById.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [id, personalAlbums, userAlbums]);

  const handleCreate = async () => {
    if (
      !title.trim() ||
      !id ||
      mode !== 'guest' ||
      !galleryToken ||
      !studioSlug ||
      !weddingSlug
    ) {
      return;
    }

    const nextTitle = title.trim();

    try {
      const response = await createGalleryAlbum(studioSlug, weddingSlug, id, galleryToken, {
        name: nextTitle,
        album_type: 'user_created',
      });

      const nextAlbum = {
        id: response.data.id,
        slug: response.data.slug,
        title: response.data.name,
        photoCount: response.data.photos_count ?? 0,
        coverUrl: undefined,
      };

      setPersonalAlbums((current) =>
        [...current.filter((album) => album.id !== nextAlbum.id), nextAlbum].sort((a, b) =>
          a.title.localeCompare(b.title)
        )
      );

      upsertUserAlbum({
        id: nextAlbum.id,
        slug: nextAlbum.slug,
        title: nextAlbum.title,
        eventId: id,
        photoIds: [],
        photoCount: nextAlbum.photoCount,
        createdAt: new Date().toISOString(),
      });

      setTitle('');
      setShowInput(false);
      showFeedback({
        title: `Created "${nextTitle}"`,
        message: 'You can start adding photos to it now.',
      });
    } catch {
      showFeedback({
        title: 'Could not create album',
        message: 'Please try again in a moment.',
        variant: 'info',
      });
    }
  };

  if (!id) return null;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen pt-14 pb-16 md:pt-16 md:pb-16"
      >
        <section className="wrap page-header">
          <div className="soft-panel rounded-[1.8rem] p-6">
            <p className="font-body text-sm text-foreground/62">Loading albums...</p>
          </div>
        </section>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen pt-14 pb-16 md:pt-16 md:pb-16"
      >
        <section className="wrap page-header">
          <div className="soft-panel rounded-[1.8rem] p-6">
            <p className="font-body text-sm text-foreground/62">{error}</p>
          </div>
        </section>
      </motion.div>
    );
  }

  const allAlbums = [...studioAlbums, ...mergedPersonalAlbums];

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
            <p className="label mb-1 text-outline">{eventTitle}</p>
            <h1 className="font-headline text-[2.5rem] font-light leading-tight text-foreground md:text-5xl lg:text-6xl">
              Albums
            </h1>
            <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-foreground/62 md:text-base">
              Studio-curated keepsakes sit alongside any personal albums you create for the portraits, family moments, or candid frames you want grouped together.
            </p>
            <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-foreground/46 md:text-[15px]">
              Personal albums are tied to your guest session right now, so the albums you create here should appear immediately for this visit.
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
                <span className="label text-foreground/74">{eventPhotoCount} moments</span>
              </div>
            </div>
            {eventDate ? (
              <p className="mt-4 font-body text-sm leading-relaxed text-foreground/52">{eventDate}</p>
            ) : null}
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

              <div className="soft-panel rounded-[1.6rem] px-5 py-6">
                <p className="font-body text-sm leading-relaxed text-foreground/60">
                  Studio collections will appear here once the public albums endpoint is exposed from the backend. Your personal albums below are already live.
                </p>
              </div>
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
                  <span className="label text-foreground/62">{mergedPersonalAlbums.length} album{mergedPersonalAlbums.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {mergedPersonalAlbums.length === 0 ? (
                <div className="soft-panel rounded-[1.6rem] px-5 py-6">
                  <p className="font-body text-sm leading-relaxed text-foreground/60">
                    Create your own keepsake for family favourites, portraits, or any set of moments you want to keep together.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                  {mergedPersonalAlbums.map((album) => (
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
                        <p className="mt-1 label text-foreground/62">{getAlbumPhotoCount(album)} photos</p>
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
                  onKeyDown={(event) => event.key === 'Enter' && void handleCreate()}
                  placeholder="Name this collection..."
                  className="min-h-12 w-full rounded-2xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-foreground label outline-none placeholder:text-foreground/20 uppercase tracking-widest"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => void handleCreate()}
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
