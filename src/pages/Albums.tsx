import { motion } from 'motion/react';
import { Folder, Lock, User, Camera, Heart, Users } from 'lucide-react';
import { Link, Navigate, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { fetchGuestPrintSelectionBuckets } from '../lib/api/printSelection';
import type { BackendPrintSelectionBucket } from '../lib/api/types';

export default function Albums() {
  const { mode, galleryToken, studioSlug, weddingSlug, currentWedding, currentStudio } = useSessionStore();
  const [buckets, setBuckets] = useState<BackendPrintSelectionBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchGuestPrintSelectionBuckets(studioSlug, weddingSlug, galleryToken)
      .then((response) => {
        if (!active) return;
        setBuckets(response.data);
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

      <section className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-8 sm:px-6 lg:px-10">
        <p className="font-label text-[10px] uppercase tracking-[0.32em] text-[#9a907f]">Print selection</p>
        <h1 className="mt-2 font-headline text-[3.2rem] font-light leading-[0.92] tracking-[-0.04em] text-[#18130f] md:text-[4.8rem]">
          Print Albums
        </h1>
        <p className="mt-3 max-w-2xl font-body text-lg leading-relaxed text-[#6f665b]">
          These are the final curation buckets the studio prepared for your printed album choices. Each one can collect moments from every chapter, with a clear hard limit.
        </p>

        <nav className="mt-10 border-b border-[#dfd6c8]">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pb-3">
            {navItems.map((item) =>
              item.enabled ? (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `relative pb-4 text-[12px] uppercase tracking-[0.34em] transition-colors ${
                      isActive ? 'text-[#be3d2f]' : 'text-[#9a907f] hover:text-[#241d17]'
                    }`
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
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-10">
        {loading ? (
          <p className="font-body text-sm text-[#6f665b]">Loading print albums…</p>
        ) : error ? (
          <p className="font-body text-sm text-[#964b40]">{error}</p>
        ) : buckets.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-[#d8cbb8] bg-[#fbf6ee] px-6 py-8">
            <p className="font-body text-sm leading-relaxed text-[#6f665b]">
              No print albums are available yet. The studio can create them from the admin dashboard once they’re ready for selections.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {buckets.map((bucket) => (
              <Link
                key={bucket.id}
                to={`/albums/${bucket.slug}`}
                className="group overflow-hidden rounded-[1.8rem] border border-[#ded4c7] bg-[#fbf6ee] shadow-[0_20px_50px_rgba(70,54,35,0.06)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[1.06] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(190,61,47,0.12),transparent_38%),linear-gradient(180deg,#f7f0e6,#efe4d5)]">
                  {bucket.cover_photo_url ? (
                    <img
                      src={bucket.cover_photo_url}
                      alt={bucket.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,239,228,0.08),rgba(36,29,23,0.62))]" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="label text-white/70">
                      {bucket.selected_count} selected · {bucket.selection_limit} max
                    </p>
                    <h2 className="mt-2 font-headline text-[2.3rem] font-light leading-none text-white">
                      {bucket.name}
                    </h2>
                    <p className="mt-3 font-body text-sm text-white/78">
                      {bucket.locked
                        ? 'Locked by studio'
                        : bucket.remaining_count <= 0
                          ? 'Selection complete'
                          : `${bucket.remaining_count} picks remaining`}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
