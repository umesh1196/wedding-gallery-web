import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { PHOTOS } from '../lib/data';
import { useViewerStore } from '../store/viewerStore';
import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { AlbumPickerSheet } from '../components/AlbumPickerSheet';
import { buildPhotoFilename, downloadPhoto } from '../lib/download';
import { useAlbumPicker } from '../hooks/useAlbumPicker';
import { useFeedback } from '../components/FeedbackProvider';
import { ViewerHeader } from '../components/viewer/ViewerHeader';
import { ViewerActions } from '../components/viewer/ViewerActions';
import { ViewerDetails } from '../components/viewer/ViewerDetails';
import { readRouteState, toBackState } from '../lib/navigation';

export default function PhotoViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleFavourite, isFavourite, favouriteIds } = useViewerStore();
  const [showChrome, setShowChrome] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const chromeTimeoutRef = useRef<number | null>(null);
  const { showFeedback } = useFeedback();

  const photo = PHOTOS.find((p) => p.id === id);
  const eventPhotos = PHOTOS.filter((p) => p.event === photo?.event);
  const currentIndex = eventPhotos.findIndex((p) => p.id === id);
  const prevPhoto = currentIndex > 0 ? eventPhotos[currentIndex - 1] : undefined;
  const nextPhoto = currentIndex >= 0 ? eventPhotos[currentIndex + 1] : undefined;
  const navigationState = readRouteState(location);
  const backTo = navigationState?.backTo ?? (photo ? `/event/${photo.event}` : '/events');
  const backLabel = navigationState?.backLabel ?? 'Photos';
  const photoState = navigationState ? toBackState(backTo, backLabel) : undefined;
  const albumPicker = useAlbumPicker(photo?.event);

  const goToPrevPhoto = () => {
    if (prevPhoto) navigate(`/photo/${prevPhoto.id}`, { state: photoState });
  };

  const goToNextPhoto = () => {
    if (nextPhoto) navigate(`/photo/${nextPhoto.id}`, { state: photoState });
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goToPrevPhoto();
      if (event.key === 'ArrowRight') goToNextPhoto();
      if (event.key === 'Escape') navigate(-1);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate, prevPhoto, nextPhoto]);

  useEffect(() => {
    setShowDetails(false);
    setShowChrome(true);
    albumPicker.closePicker();
  }, [photo?.id]);

  useEffect(() => {
    if (!showChrome) {
      if (chromeTimeoutRef.current) {
        window.clearTimeout(chromeTimeoutRef.current);
        chromeTimeoutRef.current = null;
      }
      return;
    }

    chromeTimeoutRef.current = window.setTimeout(() => {
      setShowChrome(false);
      setShowDetails(false);
    }, 3200);

    return () => {
      if (chromeTimeoutRef.current) {
        window.clearTimeout(chromeTimeoutRef.current);
        chromeTimeoutRef.current = null;
      }
    };
  }, [showChrome, photo?.id]);

  if (!photo) return null;

  const liked = isFavourite(photo.id);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    const startX = touchStartX.current;
    const startY = touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (startX === null || startY === null) return;

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (Math.abs(deltaX) < 56 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;

    if (deltaX > 0) {
      goToPrevPhoto();
      return;
    }

    goToNextPhoto();
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${photo.event} photo`,
      text: `${photo.alt} · Shruti & Umesh wedding gallery`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      showFeedback({
        title: 'Link copied for sharing',
        message: 'You can paste it anywhere you want to send this photo.',
        variant: 'info',
      });
    } catch {
      // Ignore cancellations or unavailable browser features.
    }
  };

  const handleSave = () => {
    downloadPhoto(photo.url, buildPhotoFilename(photo.alt, photo.id));
    setShowChrome(true);
    showFeedback({
      title: 'Download starting',
      message: 'Your browser will save this photo for you.',
      variant: 'info',
    });
  };

  const revealChrome = () => {
    setShowChrome(true);
  };

  const toggleChrome = () => {
    setShowChrome((value) => {
      const nextValue = !value;
      if (!nextValue) setShowDetails(false);
      return nextValue;
    });
  };

  const caption = photo.alt.length > 54 ? `${photo.alt.slice(0, 54)}...` : photo.alt;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-black"
    >
      <div
        className="absolute inset-0 z-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={toggleChrome}
      >
        <img
          src={photo.url}
          alt={photo.alt}
          className="h-full w-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="absolute inset-y-0 left-0 z-10 w-1/5 md:hidden">
        {prevPhoto && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              revealChrome();
              goToPrevPhoto();
            }}
            className="h-full w-full"
            aria-label="Previous photo"
          />
        )}
      </div>

      <div className="absolute inset-y-0 right-0 z-10 w-1/5 md:hidden">
        {nextPhoto && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              revealChrome();
              goToNextPhoto();
            }}
            className="h-full w-full"
            aria-label="Next photo"
          />
        )}
      </div>

      <AnimatePresence>
        {showChrome && (
          <>
            <motion.header
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mobile-safe-top fixed inset-x-0 top-0 z-50 px-3 pb-2 md:px-8 md:pt-5 md:pb-7"
            >
              <ViewerHeader
                backTo={backTo}
                backLabel={backLabel}
                photoState={photoState}
                currentIndex={currentIndex + 1}
                totalPhotos={eventPhotos.length}
                onShare={() => {
                  revealChrome();
                  handleShare();
                }}
              />
            </motion.header>

            {prevPhoto && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(event) => {
                  event.stopPropagation();
                  revealChrome();
                  goToPrevPhoto();
                }}
                title="Previous (←)"
                className="absolute left-4 top-1/2 z-20 hidden h-16 w-10 -translate-y-1/2 items-center justify-center text-white/28 transition-colors hover:text-white md:flex"
              >
                <span className="select-none text-5xl leading-none">‹</span>
              </motion.button>
            )}

            {nextPhoto && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(event) => {
                  event.stopPropagation();
                  revealChrome();
                  goToNextPhoto();
                }}
                title="Next (→)"
                className="absolute right-4 top-1/2 z-20 hidden h-16 w-10 -translate-y-1/2 items-center justify-center text-white/28 transition-colors hover:text-white md:flex"
              >
                <span className="select-none text-5xl leading-none">›</span>
              </motion.button>
            )}

            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="mobile-safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-2 md:px-8 md:pb-5"
            >
              <div className="mx-auto max-w-3xl">
                <div className="rounded-[1.25rem] border border-white/6 bg-gradient-to-t from-black/58 via-black/22 to-transparent px-4 pt-8 pb-2 backdrop-blur-[10px] md:px-5 md:pt-10">
                  <div className="pointer-events-auto flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="label text-white/50">{currentIndex + 1} of {eventPhotos.length}</p>
                      <p className="mt-0.5 truncate font-body text-sm text-white/82 md:text-[15px]">
                        {caption}
                      </p>
                    </div>

                    <ViewerActions
                      liked={liked}
                      showDetails={showDetails}
                      onDownload={() => {
                        revealChrome();
                        handleSave();
                      }}
                      onShare={() => {
                        revealChrome();
                        handleShare();
                      }}
                      onToggleFavourite={() => {
                        revealChrome();
                        const alreadySaved = liked;
                        const isFirstSave = !alreadySaved && favouriteIds.length === 0;
                        toggleFavourite(photo.id);
                        showFeedback({
                          title: alreadySaved ? 'Removed from saved' : 'Saved to your moments',
                          message: alreadySaved
                            ? 'This only changes your personal saved collection.'
                            : isFirstSave
                              ? 'Keep saving as you browse. Your collection stays private to you.'
                              : 'This photo is now part of your personal saved collection.',
                        });
                      }}
                      onAddToAlbum={() => {
                        revealChrome();
                        albumPicker.openPicker([photo.id]);
                      }}
                      onToggleDetails={() => {
                        revealChrome();
                        setShowDetails((value) => !value);
                      }}
                    />
                  </div>

                  {photo.people && photo.people.length > 0 && (
                    <div className="pointer-events-auto mt-2.5 no-scrollbar flex gap-2 overflow-x-auto pb-1">
                      {photo.people.map((person) => (
                        <div
                          key={person}
                          className="flex flex-shrink-0 items-center gap-2 rounded-full bg-white/9 px-2.5 py-1 backdrop-blur-sm"
                        >
                          <div className="h-[22px] w-[22px] overflow-hidden rounded-full">
                            <img
                              src={`https://picsum.photos/seed/${person}/100/100`}
                              alt={person}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="font-body text-[11px] text-white/84">{person}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <ViewerDetails
                    showDetails={showDetails}
                    eventName={photo.event}
                    date={photo.date}
                    people={photo.people}
                  />
                </div>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      <AlbumPickerSheet
        open={albumPicker.isOpen}
        onClose={albumPicker.closePicker}
        photoCount={albumPicker.photoIds.length}
        albums={albumPicker.editableAlbums}
        selectedAlbumIds={albumPicker.selectedAlbumIds}
        showNewAlbumInput={albumPicker.showNewAlbumInput}
        newAlbumTitle={albumPicker.newAlbumTitle}
        emptyMessage="Create a new album to save this photo. Studio albums are view-only."
        onToggleAlbum={albumPicker.toggleAlbum}
        onShowNewAlbumInput={() => albumPicker.setShowNewAlbumInput(true)}
        onNewAlbumTitleChange={albumPicker.setNewAlbumTitle}
        onCreateAlbum={() => {
          const createdAlbum = albumPicker.createNewAlbum();
          if (createdAlbum) {
            showFeedback({
              title: `Created "${createdAlbum.title}"`,
              message: 'This photo can be added right away.',
            });
          }
        }}
        onSubmit={() => {
          const result = albumPicker.submitSelection();
          if (result) {
            showFeedback({
              title: 'Added to album',
              message: `Saved to ${result.albumCount} album${result.albumCount !== 1 ? 's' : ''}.`,
            });
            revealChrome();
          }
        }}
      />
    </motion.div>
  );
}
