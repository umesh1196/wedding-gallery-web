import { motion } from 'motion/react';
import { Camera, Download, Folder, Heart, Lock, Share2, User, Users } from 'lucide-react';
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchGalleryCeremonies } from '../lib/api/gallery';
import { mapCeremonyToEvent } from '../lib/api/adapters';
import type { Event } from '../lib/data';
import { useSessionStore } from '../store/sessionStore';
import { useFeedback } from '../components/FeedbackProvider';
import { createDownloadRequest, fetchDownloadRequest } from '../lib/api/downloads';
import { downloadPhoto } from '../lib/download';

export default function EventsList() {
  const navigate = useNavigate();
  const { showFeedback } = useFeedback();
  const { mode, galleryToken, studioSlug, weddingSlug, currentWedding, currentStudio } = useSessionStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDownloadId, setActiveDownloadId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchGalleryCeremonies(studioSlug, weddingSlug, galleryToken)
      .then((response) => {
        if (!active) return;
        setEvents(response.data.map(mapCeremonyToEvent));
      })
      .catch((loadError: Error) => {
        if (!active) return;
        setError(loadError.message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [galleryToken, mode, studioSlug, weddingSlug]);

  if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug) {
    return <Navigate to="/" replace />;
  }

  const brandLabel = currentWedding?.couple_name || currentStudio?.studio_name || 'Private Gallery';
  const navItems = [
    { label: 'Chapters', path: '/events', enabled: true, icon: Camera },
    { label: 'Saved', path: '/saved', enabled: true, icon: Heart },
    { label: 'Print Albums', path: '/albums', enabled: true, icon: Folder },
    { label: 'People', path: '#', enabled: false, icon: Users },
  ];

  const handleDownloadAll = async (event: Event) => {
    if (!galleryToken || !studioSlug || !weddingSlug) return;

    try {
      setActiveDownloadId(event.id);

      const response = await createDownloadRequest(studioSlug, weddingSlug, galleryToken, {
        type: 'ceremony',
        ceremony_slug: event.id,
      });

      showFeedback({
        title: `Preparing ${event.title}`,
        message: 'Building an original-photo ZIP for this chapter.',
        variant: 'info',
      });

      const requestId = response.data.id;
      let attempts = 0;

      while (attempts < 14) {
        attempts += 1;
        await new Promise((resolve) => window.setTimeout(resolve, 500));

        const statusResponse = await fetchDownloadRequest(
          studioSlug,
          weddingSlug,
          requestId,
          galleryToken
        );

        if (statusResponse.data.status === 'ready' && statusResponse.data.download_url) {
          downloadPhoto(statusResponse.data.download_url, statusResponse.data.filename);
          showFeedback({
            title: 'Download ready',
            message: `Downloading original photos from ${event.title}.`,
          });
          return;
        }

        if (statusResponse.data.status === 'failed') {
          throw new Error(statusResponse.data.error_message || 'The chapter ZIP could not be created.');
        }
      }

      showFeedback({
        title: 'Still preparing',
        message: 'The ZIP is taking a little longer. Please try again shortly.',
        variant: 'info',
      });
    } catch (downloadError) {
      showFeedback({
        title: 'Could not prepare download',
        message:
          downloadError instanceof Error ? downloadError.message : 'Please try again in a moment.',
        variant: 'info',
      });
    } finally {
      setActiveDownloadId(null);
    }
  };

  const handleShareAll = async (event: Event) => {
    const shareUrl = `${window.location.origin}/event/${event.id}`;
    const shareData = {
      title: `${brandLabel} · ${event.title}`,
      text: `${event.title} from ${currentWedding?.couple_name || 'this wedding gallery'}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showFeedback({
          title: 'Chapter link copied',
          message: `Share ${event.title} with friends and family.`,
        });
      }
    } catch {
      showFeedback({
        title: 'Could not share chapter',
        message: 'Please try again in a moment.',
        variant: 'info',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#f5efe4] text-[#241d17]"
    >
      <header className="sticky top-0 z-40 border-b border-[#dacdb9]/45 bg-[#f5efe4]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <span className="font-headline text-[1.85rem] font-light tracking-[-0.04em] text-[#7d5f3f]">
            {brandLabel}
          </span>
          <div className="flex items-center gap-3">
            <button className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d8cbb8] bg-[#f8f0e6] px-4 text-[10px] font-medium uppercase tracking-[0.22em] text-[#6b5646]">
              <Lock className="h-3.5 w-3.5" />
              Private Gallery
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dacdb9] bg-white/50 text-[#7f7367]">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-10 sm:px-6 md:pt-14 lg:px-10">
        <p className="font-headline text-[4rem] font-light leading-[0.92] tracking-[-0.04em] text-[#18130f] md:text-[5.8rem]">
          Photos
        </p>
        <p className="mt-4 max-w-2xl font-body text-lg leading-relaxed text-[#6f665b]">
          A curated collection of your most intimate moments.
        </p>

        <nav className="mt-12 border-b border-[#dfd6c8]">
          <div className="flex flex-wrap gap-x-8 gap-y-3 pb-3">
            {navItems.map((item) =>
              item.enabled ? (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    [
                      'relative pb-4 text-[12px] uppercase tracking-[0.34em] transition-colors',
                      isActive ? 'text-[#be3d2f]' : 'text-[#9a907f] hover:text-[#241d17]',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <span className="absolute inset-x-0 bottom-[-4px] h-[3px] rounded-full bg-[#be3d2f]" />
                      )}
                    </>
                  )}
                </NavLink>
              ) : (
                <span
                  key={item.label}
                  className="pb-4 text-[12px] uppercase tracking-[0.34em] text-[#c2b7a6]"
                >
                  {item.label}
                </span>
              )
            )}
          </div>
        </nav>

        {error && (
          <div className="mt-6 inline-flex rounded-full border border-[#ddb6ac] bg-[#f8ddd7] px-4 py-2">
            <span className="text-sm text-[#964b40]">{error}</span>
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 pb-14 sm:px-6 md:pb-20 lg:px-10">
        {!loading && events.length === 0 ? (
          <div className="rounded-[1.8rem] border border-[#decfbb] bg-white/40 p-6 shadow-[0_20px_50px_rgba(70,54,35,0.06)] md:p-7">
            <p className="font-body text-base leading-relaxed text-[#6f665b]">
              This gallery does not have any published chapters yet. Once the studio uploads and processes photos,
              they will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="group relative overflow-hidden rounded-[1.65rem] border border-[#d9ceb9]/65 bg-black shadow-[0_28px_55px_rgba(50,39,24,0.12)]"
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/event/${event.id}`, {
                      state: { backTo: '/events', backLabel: 'Chapters' },
                    })
                  }
                  className="absolute inset-0 z-10"
                  aria-label={`Open ${event.title}`}
                />
                <div className="aspect-[0.82] overflow-hidden">
                  <img
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                    src={event.listCoverUrl ?? event.coverUrl}
                    alt={event.title}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,6,4,0.05),rgba(8,6,4,0.12)_38%,rgba(8,6,4,0.84)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 z-20 p-6 md:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <p className="label mb-3 text-white/62">{event.date || 'Private chapter'}</p>
                    <p className="mb-3 font-body text-sm text-white/82">
                      {event.photoCount.toLocaleString()} Photos
                    </p>
                  </div>
                  <h3 className="font-headline text-[3rem] font-light uppercase leading-[0.9] tracking-[0.08em] text-white md:text-[3.3rem]">
                    {event.title}
                  </h3>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        void handleDownloadAll(event);
                      }}
                      disabled={activeDownloadId === event.id}
                      className="inline-flex items-center gap-2 rounded-full border border-white/28 bg-white/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white backdrop-blur-md transition hover:bg-white/18 disabled:cursor-wait disabled:opacity-70"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {activeDownloadId === event.id ? 'Preparing...' : 'Download All'}
                    </button>
                    <button
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        void handleShareAll(event);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/24 bg-black/18 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/90 backdrop-blur-md transition hover:bg-black/28"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Share All
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
