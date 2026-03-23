import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Share2, Trash2, X } from 'lucide-react';
import { ALBUMS, PHOTOS } from '../lib/data';
import { useViewerStore } from '../store/viewerStore';
import { useState } from 'react';
import { Sheet } from '../components/Sheet';
import { cn } from '../lib/utils';
import { useFeedback } from '../components/FeedbackProvider';
import { readRouteState, toBackState } from '../lib/navigation';

export default function AlbumDetail() {
  const { id, albumId } = useParams<{ id: string; albumId: string }>();
  const location = useLocation();
  const { userAlbums, removePhotoFromAlbum } = useViewerStore();
  const [contextPhotoId, setContextPhotoId] = useState<string | null>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showFeedback } = useFeedback();

  const studioAlbum = ALBUMS.find((a) => a.id === albumId);
  const userAlbum = userAlbums.find((a) => a.id === albumId);
  const album = studioAlbum || userAlbum;
  const albumPhotos = PHOTOS.filter((p) => album?.photoIds.includes(p.id));
  const navigationState = readRouteState(location);
  const backTo = navigationState?.backTo ?? `/event/${id}/albums`;
  const backLabel = navigationState?.backLabel ?? 'Albums';
  const detailState = navigationState ? toBackState(backTo, backLabel) : undefined;

  const handleCopy = () => {
    const url = `${window.location.origin}/share?ids=${album?.photoIds.join(',')}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showFeedback({
        title: 'Album link copied',
        message: 'You can share this collection with family and friends.',
        variant: 'info',
      });
    });
  };

  if (!album) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-14 pb-16 md:pt-16 md:pb-16"
    >
      {/* Desktop header — title + share button in wrap */}
      <div className="wrap pt-6 md:pt-12 pb-6 md:pb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to={backTo}
            state={detailState}
            className="inline-flex items-center gap-1.5 label text-rose-accent hover:text-rose-accent/80 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </Link>
          <h2 className="font-headline text-[2.5rem] md:text-5xl lg:text-6xl font-light text-white">{album.title}</h2>
          <p className="label text-outline mt-2">{albumPhotos.length} photos</p>
          {userAlbum && (
            <p className="label text-outline/80 mt-2">Removing a photo here only takes it out of this collection.</p>
          )}
        </div>
        <button
          onClick={() => setShowShareSheet(true)}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-rose-accent px-5 py-3 text-white label font-bold hover:bg-rose-accent/90 transition-colors sm:w-auto"
        >
          Share album <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Photo grid — 3-col → 4-col → 6-col */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-[2px] md:gap-1">
        {albumPhotos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square overflow-hidden"
            onContextMenu={(e) => {
              e.preventDefault();
              if (userAlbum) setContextPhotoId(photo.id);
            }}
          >
            <img
              alt={photo.alt}
              className="w-full h-full object-cover photo-grade"
              src={photo.thumbnailUrl ?? photo.url}
              referrerPolicy="no-referrer"
            />
            {userAlbum && (
              <button
                onClick={() => {
                  if (albumId) {
                    removePhotoFromAlbum(albumId, photo.id);
                    showFeedback({
                      title: 'Removed from this album',
                      message: 'The photo still remains safely in the main gallery.',
                    });
                  }
                }}
                className="absolute right-2 top-2 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/60 px-3 py-2 text-rose-accent shadow-lg backdrop-blur-xl transition-colors hover:bg-black/72"
                aria-label={`Remove ${photo.alt} from album`}
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden label text-rose-accent sm:inline">Remove</span>
              </button>
            )}
            <AnimatePresence>
              {contextPhotoId === photo.id && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setContextPhotoId(null)}
                    className="fixed inset-0 z-[60]"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-2 right-2 z-[70] bg-surface/95 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-xl"
                  >
                    <button
                      onClick={() => {
                        if (albumId) {
                          removePhotoFromAlbum(albumId, photo.id);
                          showFeedback({
                            title: 'Removed from this album',
                            message: 'The photo still remains safely in the main gallery.',
                          });
                        }
                        setContextPhotoId(null);
                      }}
                      className="flex items-center gap-2 px-4 py-3 text-rose-accent label whitespace-nowrap"
                    >
                      <Trash2 className="w-4 h-4" /> Remove from album
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* Share Sheet — centered modal */}
      <Sheet open={showShareSheet} onClose={() => setShowShareSheet(false)}>
        <div className="overflow-y-auto px-6 pt-6 pb-4 md:px-8 md:pt-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-headline text-2xl md:text-3xl text-white font-light mb-1">{album.title}</h3>
              <p className="label text-outline">{albumPhotos.length} photos to share · Shruti &amp; Umesh</p>
            </div>
            <button
              onClick={() => setShowShareSheet(false)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/5"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-outline" />
            </button>
          </div>

          {/* Photo strip preview */}
          <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
            {albumPhotos.slice(0, 5).map((p) => (
              <img
                key={p.id}
                src={p.thumbnailUrl ?? p.url}
                className="w-12 h-12 md:w-14 md:h-14 object-cover flex-shrink-0 rounded"
                referrerPolicy="no-referrer"
                alt={p.alt}
              />
            ))}
            {albumPhotos.length > 5 && (
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 flex-shrink-0 flex items-center justify-center rounded">
                <span className="label text-outline">+{albumPhotos.length - 5}</span>
              </div>
            )}
          </div>

          {/* Link display */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 mb-4 rounded">
            <span className="flex-1 font-mono text-[11px] text-outline truncate">
              gallery.app/share?ids={album.photoIds.slice(0, 3).join(',')}...
            </span>
            <button onClick={handleCopy} className="label text-rose-accent whitespace-nowrap hover:text-rose-accent/80 transition-colors">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <button
            onClick={handleCopy}
            className={cn(
              'w-full h-[48px] flex items-center justify-center gap-2 label font-bold mb-3 rounded transition-colors',
              copied ? 'bg-green-700 text-white' : 'bg-rose-accent text-white hover:bg-rose-accent/90'
            )}
          >
            {copied ? '✓ Link Copied' : 'Copy Link'}
          </button>

          <button
            onClick={() => {
              window.open(
                `https://wa.me/?text=${encodeURIComponent(`${album.title} from Shruti & Umesh's wedding`)}`,
                '_blank'
              );
            }}
            className="w-full h-[48px] flex items-center justify-center gap-2 label font-bold bg-[#1a3020] text-[#25D366] border border-[#25D366]/20 mb-4 rounded hover:bg-[#1e3824] transition-colors"
          >
            Share on WhatsApp
          </button>

          <p className="text-center label text-outline/50 pb-4">
            Private gallery preview · anyone with the link can view this album
          </p>
        </div>
      </Sheet>
    </motion.div>
  );
}
