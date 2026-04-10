import { motion } from 'motion/react';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { mapGalleryShellToStudio, mapGalleryShellToWedding } from '../lib/api/adapters';
import { verifyGalleryAccess } from '../lib/api/gallery';
import { getDefaultGalleryStudioSlug, getDefaultGalleryWeddingSlug } from '../lib/api/config';
import { useSessionStore } from '../store/sessionStore';

function formatWeddingDate(dateValue?: string | null) {
  if (!dateValue) return 'Wedding gallery';

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return 'Wedding gallery';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

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
      navigate('/events');
    } catch (verifyError) {
      const message = verifyError instanceof Error ? verifyError.message : 'Unable to verify gallery.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isGuestReady = mode === 'guest' && Boolean(galleryToken) && Boolean(currentWedding);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mobile-safe-top mobile-home-nav-spacer overflow-x-hidden md:pb-16"
    >
      <section className="relative overflow-hidden border-b border-foreground/6 bg-[radial-gradient(circle_at_top,rgba(201,80,106,0.18),transparent_36%),linear-gradient(180deg,#0f0d0e,#141414)]">
        <div className="wrap py-18 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)] lg:items-center">
            <div>
              <p className="label text-white/48">
                {currentStudio?.studio_name ?? 'Wedding Gallery'}
              </p>
              <h1 className="mt-4 font-headline text-[3rem] font-light leading-[0.95] text-white md:text-6xl">
                {currentWedding?.couple_name ?? 'Enter the gallery'}
              </h1>
              <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-white/72 md:text-lg">
                {isGuestReady
                  ? `You are inside the live gallery for ${currentWedding?.couple_name}. Move through each chapter and open the latest moments as they land.`
                  : 'Use the wedding password to open the client gallery. Once verified, the chapters page and photo grids will pull from the real backend.'}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {isGuestReady ? (
                  <>
                    <Link
                      to="/events"
                      className="label inline-flex min-h-11 items-center gap-2 rounded-full bg-rose-accent px-5 text-white transition-colors hover:bg-rose-accent/90"
                    >
                      Open Chapters <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => clearSession()}
                      className="label inline-flex min-h-11 items-center rounded-full border border-white/12 px-5 text-white/80 transition-colors hover:text-white"
                    >
                      Switch Gallery
                    </button>
                  </>
                ) : (
                  <div className="inline-flex min-h-11 items-center rounded-full border border-white/12 bg-white/4 px-4 text-white/68">
                    <Sparkles className="mr-2 h-4 w-4 text-rose-accent" />
                    Live client access now uses the Rails backend
                  </div>
                )}
              </div>
            </div>

            <div className="soft-panel rounded-[2rem] border border-white/8 bg-white/6 p-6 backdrop-blur-xl md:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-accent/16 text-rose-accent">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="label text-white/48">Client Access</p>
                  <h2 className="mt-1 font-headline text-[2rem] italic leading-none text-white">
                    Gallery entry
                  </h2>
                </div>
              </div>

              {isGuestReady ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-[1.4rem] border border-white/8 bg-black/18 p-4">
                    <p className="label text-white/42">Active gallery</p>
                    <p className="mt-2 font-headline text-[1.8rem] text-white">
                      {currentWedding?.couple_name}
                    </p>
                    <p className="mt-2 font-body text-sm text-white/70">
                      {formatWeddingDate(currentWedding?.wedding_date)} · {storedStudioSlug || studioSlug}
                    </p>
                  </div>
                  <p className="font-body text-sm leading-relaxed text-white/62">
                    The guest session is active in this browser. You can head straight to the chapters view now.
                  </p>
                </div>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={handleVerify}>
                  <label className="block">
                    <span className="label text-white/44">Studio Slug</span>
                    <input
                      value={studioSlug}
                      onChange={(event) => setStudioSlug(event.target.value)}
                      className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/16 px-4 text-white outline-none placeholder:text-white/24"
                    />
                  </label>
                  <label className="block">
                    <span className="label text-white/44">Wedding Slug</span>
                    <input
                      value={weddingSlug}
                      onChange={(event) => setWeddingSlug(event.target.value)}
                      className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/16 px-4 text-white outline-none placeholder:text-white/24"
                    />
                  </label>
                  <label className="block">
                    <span className="label text-white/44">Visitor Name</span>
                    <input
                      value={visitorName}
                      onChange={(event) => setVisitorName(event.target.value)}
                      placeholder="Asha"
                      className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/16 px-4 text-white outline-none placeholder:text-white/24"
                    />
                  </label>
                  <label className="block">
                    <span className="label text-white/44">Gallery Password</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/16 px-4 text-white outline-none placeholder:text-white/24"
                    />
                  </label>

                  {error && (
                    <div className="rounded-2xl border border-rose-accent/24 bg-rose-accent/10 px-4 py-3">
                      <p className="font-body text-sm text-white/82">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="label flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-rose-accent text-white transition-colors hover:bg-rose-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? 'Checking access…' : 'Enter Gallery'}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
