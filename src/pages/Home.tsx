import { motion } from 'motion/react';
import { ArrowRight, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { mapGalleryShellToStudio, mapGalleryShellToWedding } from '../lib/api/adapters';
import { verifyGalleryAccess } from '../lib/api/gallery';
import { getDefaultGalleryStudioSlug, getDefaultGalleryWeddingSlug } from '../lib/api/config';
import { Sheet } from '../components/Sheet';
import { useSessionStore } from '../store/sessionStore';

function formatWeddingDate(dateValue?: string | null) {
  if (!dateValue) return 'A private wedding archive';

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return 'A private wedding archive';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

const fallbackMoments = {
  hero: '/photos/prewedding/MPPF-136.jpg',
  archivePrimary: '/photos/ceremony/MPPF-2.jpg',
  archiveSecondary: '/photos/engagement/MPPF-146.jpg',
  highlightLead: '/photos/ceremony/MPPF-103.jpg',
  highlightTop: '/photos/ceremony/MPPF-24.jpg',
  highlightBottomLeft: '/photos/ceremony/MPPF-220.jpg',
  highlightBottomRight: '/photos/ceremony/MPPF-265.jpg',
};

export default function Home() {
  const navigate = useNavigate();
  const {
    mode,
    galleryToken,
    guestIdentityToken,
    studioSlug: storedStudioSlug,
    weddingSlug: storedWeddingSlug,
    currentStudio,
    currentWedding,
    loading,
    error,
    setGallerySession,
    setCurrentStudio,
    setCurrentWedding,
    setLoading,
    setError,
    clearSession,
  } = useSessionStore();
  const defaultStudioSlug = useMemo(
    () => storedStudioSlug || getDefaultGalleryStudioSlug(),
    [storedStudioSlug]
  );
  const defaultWeddingSlug = useMemo(
    () => storedWeddingSlug || getDefaultGalleryWeddingSlug(),
    [storedWeddingSlug]
  );
  const [studioSlug, setStudioSlug] = useState(defaultStudioSlug);
  const [weddingSlug, setWeddingSlug] = useState(defaultWeddingSlug);
  const [password, setPassword] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [showAccessSheet, setShowAccessSheet] = useState(false);

  const isGuestReady = mode === 'guest' && Boolean(galleryToken) && Boolean(currentWedding);
  const brandName = currentStudio?.studio_name ?? 'Ethereal Union';
  const coupleName = currentWedding?.couple_name ?? 'Shruti & Umesh';
  const weddingDateLabel = formatWeddingDate(currentWedding?.wedding_date);
  const heroImage = currentWedding?.hero_image_url || fallbackMoments.hero;

  const featureCards = [
    {
      eyebrow: 'Volume I',
      title: 'Photos',
      description: 'View the full collection',
      image: currentWedding?.hero_image_url || fallbackMoments.archivePrimary,
      to: isGuestReady ? '/events' : '#',
    },
    {
      eyebrow: 'Volume II',
      title: 'Videos',
      description: 'Watch your cinematic film',
      image: fallbackMoments.archiveSecondary,
      to: isGuestReady ? '/events' : '#',
    },
  ];

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studioSlug.trim() || !weddingSlug.trim() || !password.trim()) {
      setError('Studio slug, wedding slug, and gallery password are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await verifyGalleryAccess(
        studioSlug.trim(),
        weddingSlug.trim(),
        password.trim(),
        visitorName.trim() || undefined,
        guestIdentityToken || undefined
      );

      setGallerySession({
        galleryToken: response.data.session_token,
        guestIdentityToken: response.data.guest_identity_token ?? guestIdentityToken ?? null,
        studioSlug: studioSlug.trim(),
        weddingSlug: weddingSlug.trim(),
      });
      setCurrentStudio(mapGalleryShellToStudio(response.data.gallery));
      setCurrentWedding(mapGalleryShellToWedding(response.data.gallery, weddingSlug.trim()));
      setPassword('');
      setShowAccessSheet(false);
      navigate('/events');
    } catch (verifyError) {
      const message = verifyError instanceof Error ? verifyError.message : 'Unable to verify gallery.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrimaryAccess = () => {
    if (isGuestReady) {
      navigate('/events');
      return;
    }

    setShowAccessSheet(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-[#f5efe4] text-[#241d17]"
      >
        <header className="sticky top-0 z-40 border-b border-[#cdbba4]/35 bg-[#f5efe4]/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
            <span className="font-label text-[11px] uppercase tracking-[0.28em] text-[#9f4a39]">
              {brandName}
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrimaryAccess}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#b9a992] bg-[#f7f0e6] px-4 text-[10px] font-medium uppercase tracking-[0.22em] text-[#3f342a] transition-colors hover:bg-[#f1e6d7]"
              >
                <Lock className="h-3.5 w-3.5" />
                {isGuestReady ? 'Open Gallery' : 'Private Gallery'}
              </button>
              <div className="hidden items-center gap-2 rounded-full border border-[#d9ccb8] bg-white/45 px-3 py-2 md:flex">
                <span className="font-body text-xs text-[#7f7367]">
                  {visitorName.trim() || 'Guest'}
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ede2d4] text-[#6d5e51]">
                  <User className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>
        </header>

        <main>
          <section className="relative overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={heroImage}
                alt={coupleName}
                className="h-full w-full object-cover object-[76%_42%] sm:object-[74%_40%] md:object-[72%_38%] lg:object-[70%_36%]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,239,228,0.08),rgba(245,239,228,0.06)_22%,rgba(34,26,21,0.14)_55%,rgba(245,239,228,0.52)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(252,237,207,0.58),transparent_34%)]" />
            </div>

            <div className="relative mx-auto flex min-h-[68vh] w-full max-w-[1440px] items-end px-4 pb-16 pt-16 sm:px-6 md:min-h-[74vh] md:pb-24 lg:px-10">
              <div className="max-w-[1080px]">
                <p className="font-label text-[9px] uppercase tracking-[0.42em] text-white/66 md:text-[10px]">
                  Recorded on {weddingDateLabel}
                </p>
                <h1 className="mt-4 font-headline text-[3.6rem] font-light uppercase leading-[0.88] tracking-[0.16em] text-white sm:text-[4.75rem] md:text-[6.5rem] lg:text-[7.9rem]">
                  {coupleName}
                </h1>
                <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-white/82 md:text-xl">
                  Welcome home to your private collection. Your forever story, preserved exactly as it happened.
                </p>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-[-3rem] w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="grid gap-5 md:grid-cols-2">
              {featureCards.map((card) => {
                const cardBody = (
                  <div className="group relative block min-h-[21rem] overflow-hidden rounded-[1.5rem] border border-[#d8ccb7]/55 shadow-[0_22px_60px_rgba(70,54,35,0.12)] md:min-h-[23rem]">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,24,18,0.06),rgba(32,24,18,0.12)_42%,rgba(32,24,18,0.82)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                      <p className="font-label text-[9px] uppercase tracking-[0.38em] text-white/72">
                        {card.eyebrow}
                      </p>
                      <h2 className="mt-2 font-body text-[2rem] font-semibold uppercase leading-none text-white md:text-[2.2rem]">
                        {card.title}
                      </h2>
                      <p className="mt-2 font-body text-sm text-white/72">{card.description}</p>
                    </div>
                  </div>
                );

                return (
                  <button
                    key={card.title}
                    onClick={() => {
                      if (isGuestReady) {
                        navigate(card.to);
                        return;
                      }

                      setShowAccessSheet(true);
                    }}
                    className="text-left"
                  >
                    {cardBody}
                  </button>
                );
              })}
            </div>
          </section>

          <section
            id="curated-highlights"
            className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-16 sm:px-6 md:pb-24 md:pt-24 lg:px-10"
          >
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <h2 className="font-body text-[2rem] font-semibold uppercase tracking-[-0.03em] text-[#19130f] md:text-[2.4rem]">
                  Curated Highlights
                </h2>
                <p className="mt-2 font-label text-[9px] uppercase tracking-[0.34em] text-[#9c8470]">
                  Hand-selected moments from your wedding day
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.82fr)]">
              <div className="overflow-hidden rounded-[1.4rem] border border-[#decfb8]/65 bg-white/40 shadow-[0_18px_46px_rgba(71,54,35,0.08)]">
                <img
                  src={fallbackMoments.highlightLead}
                  alt="Lead highlight"
                  className="h-full min-h-[26rem] w-full object-cover"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <div className="overflow-hidden rounded-[1.2rem] border border-[#decfb8]/65 shadow-[0_18px_46px_rgba(71,54,35,0.08)] md:col-span-2">
                  <img
                    src={fallbackMoments.highlightTop}
                    alt="Highlight arrangement"
                    className="h-full min-h-[12rem] w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-[1.2rem] border border-[#decfb8]/65 shadow-[0_18px_46px_rgba(71,54,35,0.08)]">
                  <img
                    src={fallbackMoments.highlightBottomLeft}
                    alt="Highlight detail"
                    className="h-full min-h-[14rem] w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-[1.2rem] border border-[#decfb8]/65 shadow-[0_18px_46px_rgba(71,54,35,0.08)]">
                  <img
                    src={fallbackMoments.highlightBottomRight}
                    alt="Highlight portrait"
                    className="h-full min-h-[14rem] w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 pb-20 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-4xl rounded-[2.25rem] border border-[#eadcc7]/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.56),rgba(248,241,231,0.88))] px-8 py-12 text-center shadow-[0_25px_80px_rgba(84,64,39,0.06)] md:px-14 md:py-16">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#f0dfd0] text-[#b36f60]">
                <Lock className="h-3.5 w-3.5" />
              </div>
              <p className="mx-auto mt-5 max-w-2xl font-body text-lg leading-relaxed text-[#b36f60] md:text-[1.35rem]">
                “This is the first chapter of our legacy. Let these memories remind us of the love that started it all.”
              </p>
              <p className="mt-6 font-label text-[9px] uppercase tracking-[0.34em] text-[#a69484]">
                Encrypted private archive · Exclusively yours
              </p>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#deccb3]/55 px-4 py-10 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1180px] text-center">
            <p className="font-label text-[10px] uppercase tracking-[0.28em] text-[#c16a56]">
              {brandName}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-label text-[9px] uppercase tracking-[0.24em] text-[#9f8f7e]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-[#241d17]"
              >
                Instagram
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-[#241d17]"
              >
                YouTube
              </a>
            </div>
            <p className="mt-4 text-[11px] text-[#a39282]">
              © 2026 {brandName}. Premium memory preservation, reimagined for private stories.
            </p>
          </div>
        </footer>
      </motion.div>

      <Sheet open={showAccessSheet} onClose={() => setShowAccessSheet(false)}>
        <div className="bg-[#f8f2e9] px-6 pb-7 pt-6 text-[#241d17] md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-label text-[9px] uppercase tracking-[0.34em] text-[#b06958]">
                Private Gallery
              </p>
              <h2 className="mt-2 font-headline text-[2.2rem] font-light leading-none text-[#241d17]">
                Enter the archive
              </h2>
              <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-[#7f7367]">
                Use the wedding credentials to unlock the full collection and continue into the live gallery.
              </p>
            </div>
            {isGuestReady && (
              <button
                onClick={() => {
                  setShowAccessSheet(false);
                  navigate('/events');
                }}
                className="rounded-full border border-[#d8c4ac] px-4 py-2 font-label text-[9px] uppercase tracking-[0.24em] text-[#4d4035]"
              >
                Open Gallery
              </button>
            )}
          </div>

          {!isGuestReady && (
            <form className="mt-6 space-y-4" onSubmit={handleVerify}>
              <label className="block">
                <span className="font-label text-[9px] uppercase tracking-[0.3em] text-[#a08e7b]">Studio Slug</span>
                <input
                  aria-label="Studio Slug"
                  value={studioSlug}
                  onChange={(event) => setStudioSlug(event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-[1.15rem] border border-[#ddceb7] bg-white/70 px-4 text-[#241d17] outline-none placeholder:text-[#b6a696]"
                />
              </label>

              <label className="block">
                <span className="font-label text-[9px] uppercase tracking-[0.3em] text-[#a08e7b]">Wedding Slug</span>
                <input
                  aria-label="Wedding Slug"
                  value={weddingSlug}
                  onChange={(event) => setWeddingSlug(event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-[1.15rem] border border-[#ddceb7] bg-white/70 px-4 text-[#241d17] outline-none placeholder:text-[#b6a696]"
                />
              </label>

              <label className="block">
                <span className="font-label text-[9px] uppercase tracking-[0.3em] text-[#a08e7b]">Visitor Name</span>
                <input
                  aria-label="Visitor Name"
                  value={visitorName}
                  onChange={(event) => setVisitorName(event.target.value)}
                  placeholder="Asha"
                  className="mt-2 min-h-12 w-full rounded-[1.15rem] border border-[#ddceb7] bg-white/70 px-4 text-[#241d17] outline-none placeholder:text-[#b6a696]"
                />
              </label>

              <label className="block">
                <span className="font-label text-[9px] uppercase tracking-[0.3em] text-[#a08e7b]">Gallery Password</span>
                <input
                  aria-label="Gallery Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-[1.15rem] border border-[#ddceb7] bg-white/70 px-4 text-[#241d17] outline-none placeholder:text-[#b6a696]"
                />
              </label>

              {error && (
                <div className="rounded-[1.15rem] border border-[#ddb7ae] bg-[#f9dfd9]/72 px-4 py-3">
                  <p className="font-body text-sm text-[#8d4f44]">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2b231c] px-5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#f7efe4] transition-colors hover:bg-[#1f1914] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Checking access…' : 'Enter Gallery'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          {isGuestReady && (
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.3rem] border border-[#ddceb7] bg-white/60 p-4">
                <p className="font-label text-[9px] uppercase tracking-[0.32em] text-[#a38f79]">Current gallery</p>
                <p className="mt-2 font-headline text-[1.9rem] text-[#241d17]">{coupleName}</p>
                <p className="mt-2 font-body text-sm text-[#7f7367]">
                  {weddingDateLabel} · {storedStudioSlug || studioSlug}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setShowAccessSheet(false);
                    navigate('/events');
                  }}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#2b231c] px-5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#f7efe4]"
                >
                  Open Chapters <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    clearSession();
                    setPassword('');
                  }}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d8c4ac] px-5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#4d4035]"
                >
                  Switch Gallery
                </button>
              </div>
            </div>
          )}
        </div>
      </Sheet>
    </>
  );
}
