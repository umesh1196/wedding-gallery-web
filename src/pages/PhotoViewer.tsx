import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import type { Photo } from '../lib/data';
import { useViewerStore } from '../store/viewerStore';
import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { AlbumPickerSheet } from '../components/AlbumPickerSheet';
import { buildPhotoFilename, downloadPhoto } from '../lib/download';
import { useAlbumPicker } from '../hooks/useAlbumPicker';
import { useFeedback } from '../components/FeedbackProvider';
import { ViewerHeader } from '../components/viewer/ViewerHeader';
import { ViewerActions } from '../components/viewer/ViewerActions';
import { ViewerComments } from '../components/viewer/ViewerComments';
import { ViewerDetails } from '../components/viewer/ViewerDetails';
import { readRouteState, toBackState } from '../lib/navigation';
import { fetchGalleryCeremonies, fetchGalleryPhotos } from '../lib/api/gallery';
import {
  createPhotoComment,
  deletePhotoComment,
  fetchPhotoComments,
  likePhoto,
  unlikePhoto,
} from '../lib/api/interactions';
import { mapCeremonyToEvent, mapGalleryPhotoToPhoto } from '../lib/api/adapters';
import { useSessionStore } from '../store/sessionStore';
import type { BackendComment, BackendGalleryPhoto } from '../lib/api/types';
import { fetchPhotoDownload } from '../lib/api/downloads';

function getEventIdFromBackTarget(backTo?: string) {
  if (!backTo?.startsWith('/event/')) return null;

  const segments = backTo.split('/').filter(Boolean);
  return segments[1] ?? null;
}

function getEventIdFromSearch(search: string) {
  const params = new URLSearchParams(search);
  return params.get('event');
}

export default function PhotoViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, galleryToken, studioSlug, weddingSlug, currentWedding } = useSessionStore();
  const { isFavourite, favouriteIds, syncPhotoLikeStates } = useViewerStore();
  const [showChrome, setShowChrome] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventPhotos, setEventPhotos] = useState<Photo[]>([]);
  const [rawPhotos, setRawPhotos] = useState<BackendGalleryPhoto[]>([]);
  const [comments, setComments] = useState<BackendComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const chromeTimeoutRef = useRef<number | null>(null);
  const { showFeedback } = useFeedback();
  const navigationState = readRouteState(location);
  const eventId =
    navigationState?.eventId ||
    getEventIdFromBackTarget(navigationState?.backTo) ||
    getEventIdFromSearch(location.search);
  const photo = eventPhotos.find((entry) => entry.id === id);
  const currentPhotoPayload = rawPhotos.find((entry) => entry.id === id);
  const currentIndex = eventPhotos.findIndex((entry) => entry.id === id);
  const prevPhoto = currentIndex > 0 ? eventPhotos[currentIndex - 1] : undefined;
  const nextPhoto = currentIndex >= 0 ? eventPhotos[currentIndex + 1] : undefined;
  const backTo = navigationState?.backTo ?? (photo ? `/event/${photo.event}` : '/events');
  const backLabel = navigationState?.backLabel ?? 'Photos';
  const photoState = navigationState ? toBackState(backTo, backLabel) : undefined;
  const albumPicker = useAlbumPicker(photo?.event ?? eventId ?? undefined);

  useEffect(() => {
    let active = true;

    if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug || !id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchGalleryCeremonies(studioSlug, weddingSlug, galleryToken)
      .then(async (ceremoniesResponse) => {
        if (!active) return;

        const mappedEvents = ceremoniesResponse.data.map(mapCeremonyToEvent);
        const preferredCeremonies = eventId
          ? [
              ...ceremoniesResponse.data.filter((ceremony) => ceremony.slug === eventId),
              ...ceremoniesResponse.data.filter((ceremony) => ceremony.slug !== eventId),
            ]
          : ceremoniesResponse.data;

        for (const ceremony of preferredCeremonies) {
          const photosResponse = await fetchGalleryPhotos(
            studioSlug,
            weddingSlug,
            ceremony.slug,
            galleryToken,
            200
          );
          const matchingPhoto = photosResponse.data.find((entry) => entry.id === id);

          if (!matchingPhoto) continue;

          const event = mappedEvents.find((entry) => entry.id === ceremony.slug);
          const nextRawPhotos = photosResponse.data;

          setEventName(event?.title ?? ceremony.name ?? 'Chapter');
          setEventDate(event?.date ?? '');
          setRawPhotos(nextRawPhotos);
          setEventPhotos(nextRawPhotos.map(mapGalleryPhotoToPhoto));
          syncPhotoLikeStates(
            nextRawPhotos.map((photo) => ({
              id: photo.id,
              liked: Boolean(photo.is_liked),
            }))
          );
          return;
        }

        throw new Error('This photo could not be found in the current gallery.');
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
  }, [eventId, galleryToken, id, mode, studioSlug, syncPhotoLikeStates, weddingSlug]);

  useEffect(() => {
    let active = true;

    if (
      mode !== 'guest' ||
      !galleryToken ||
      !studioSlug ||
      !weddingSlug ||
      !id ||
      !currentWedding?.allow_comments
    ) {
      setComments([]);
      setCommentsLoading(false);
      return;
    }

    setCommentsLoading(true);

    fetchPhotoComments(studioSlug, weddingSlug, id, galleryToken)
      .then((response) => {
        if (!active) return;
        setComments(response.data);
      })
      .catch(() => {
        if (!active) return;
        setComments([]);
      })
      .finally(() => {
        if (!active) return;
        setCommentsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentWedding?.allow_comments, galleryToken, id, mode, studioSlug, weddingSlug]);

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

  const revealChrome = () => {
    setShowChrome(true);
  };

  const handleShare = async () => {
    if (!photo) return;

    const shareUrl = window.location.href;
    const shareData = {
      title: `${eventName} photo`,
      text: `${photo.alt} · ${eventName}`,
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

  const handleSave = async () => {
    if (!photo || !galleryToken || !studioSlug || !weddingSlug) return;

    try {
      const response = await fetchPhotoDownload(studioSlug, weddingSlug, photo.id, galleryToken);
      downloadPhoto(
        response.data.download_url,
        response.data.filename || buildPhotoFilename(photo.alt, photo.id)
      );
      setShowChrome(true);
      showFeedback({
        title: 'Download starting',
        message: 'You are downloading the original photo file.',
        variant: 'info',
      });
    } catch (downloadError) {
      showFeedback({
        title: 'Could not start download',
        message:
          downloadError instanceof Error ? downloadError.message : 'Please try again in a moment.',
        variant: 'info',
      });
    }
  };

  const handleToggleLike = async () => {
    if (!photo || !galleryToken || !studioSlug || !weddingSlug) return;

    const alreadySaved = liked;
    const isFirstSave = !alreadySaved && favouriteIds.length === 0;

    revealChrome();
    syncPhotoLikeStates([{ id: photo.id, liked: !alreadySaved }]);

    try {
      const response = alreadySaved
        ? await unlikePhoto(studioSlug, weddingSlug, photo.id, galleryToken)
        : await likePhoto(studioSlug, weddingSlug, photo.id, galleryToken);

      syncPhotoLikeStates([{ id: response.data.id, liked: response.data.liked }]);
      showFeedback({
        title: alreadySaved ? 'Removed from saved' : 'Saved to your moments',
        message: alreadySaved
          ? 'This photo has been removed from your saved collection.'
          : isFirstSave
            ? 'Your first saved moment is waiting in the Saved tab.'
            : 'You can revisit this anytime from Saved.',
      });
    } catch (likeError) {
      syncPhotoLikeStates([{ id: photo.id, liked: alreadySaved }]);
      showFeedback({
        title: 'Could not update saved photos',
        message:
          likeError instanceof Error
            ? likeError.message
            : 'Please try again in a moment.',
        variant: 'info',
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!id || !galleryToken || !studioSlug || !weddingSlug || !commentDraft.trim()) return;

    setSubmittingComment(true);

    try {
      const response = await createPhotoComment(
        studioSlug,
        weddingSlug,
        id,
        galleryToken,
        commentDraft.trim()
      );
      setComments((current) => [response.data, ...current]);
      setCommentDraft('');
      showFeedback({
        title: 'Comment added',
        message: 'Your note is now part of this photo conversation.',
      });
    } catch (commentError) {
      showFeedback({
        title: 'Could not add comment',
        message:
          commentError instanceof Error ? commentError.message : 'Please try again in a moment.',
        variant: 'info',
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!galleryToken || !studioSlug || !weddingSlug) return;

    const previous = comments;
    setComments((current) => current.filter((comment) => comment.id !== commentId));

    try {
      await deletePhotoComment(studioSlug, weddingSlug, commentId, galleryToken);
      showFeedback({
        title: 'Comment removed',
        message: 'Your comment has been deleted from this photo.',
      });
    } catch (commentError) {
      setComments(previous);
      showFeedback({
        title: 'Could not remove comment',
        message:
          commentError instanceof Error ? commentError.message : 'Please try again in a moment.',
        variant: 'info',
      });
    }
  };

  const toggleChrome = () => {
    setShowChrome((value) => {
      const nextValue = !value;
      if (!nextValue) setShowDetails(false);
      return nextValue;
    });
  };

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black">
        <p className="font-body text-sm text-white/70">Loading photo…</p>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black px-6 text-center">
        <p className="font-body text-sm text-white/70">
          {error ?? 'This photo is not available right now.'}
        </p>
      </div>
    );
  }

  const liked = isFavourite(photo.id);
  const photoLabel = photo.alt || currentPhotoPayload?.original_filename || 'Wedding photo';
  const caption = photoLabel.length > 54 ? `${photoLabel.slice(0, 54)}...` : photoLabel;
  const commentsEnabled = currentWedding?.allow_comments !== false;

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
          alt={photoLabel}
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
                className="absolute left-4 top-1/2 z-20 hidden h-16 w-10 -translate-y-1/2 items-center justify-center text-foreground/28 transition-colors hover:text-foreground md:flex"
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
                className="absolute right-4 top-1/2 z-20 hidden h-16 w-10 -translate-y-1/2 items-center justify-center text-foreground/28 transition-colors hover:text-foreground md:flex"
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
                <div className="rounded-[1.25rem] border border-foreground/6 bg-gradient-to-t from-black/58 via-black/22 to-transparent px-4 pt-8 pb-2 backdrop-blur-[10px] md:px-5 md:pt-10">
                  <div className="pointer-events-auto flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="label text-foreground/50">{currentIndex + 1} of {eventPhotos.length}</p>
                      <p className="mt-0.5 truncate font-body text-sm text-foreground/82 md:text-[15px]">
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
                      onToggleFavourite={handleToggleLike}
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
                          className="flex flex-shrink-0 items-center gap-2 rounded-full bg-foreground/9 px-2.5 py-1 backdrop-blur-sm"
                        >
                          <div className="h-[22px] w-[22px] overflow-hidden rounded-full">
                            <img
                              src={`https://picsum.photos/seed/${person}/100/100`}
                              alt={person}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="font-body text-[11px] text-foreground/84">{person}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <ViewerDetails
                    showDetails={showDetails}
                    eventName={eventName}
                    date={photo.date || eventDate}
                    people={photo.people}
                  />

                  <ViewerComments
                    open={showDetails}
                    commentsEnabled={commentsEnabled}
                    comments={comments}
                    loading={commentsLoading}
                    submitting={submittingComment}
                    draft={commentDraft}
                    canSubmit={commentDraft.trim().length > 0}
                    onDraftChange={setCommentDraft}
                    onSubmit={handleSubmitComment}
                    onDelete={handleDeleteComment}
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
        loading={albumPicker.loadingAlbums}
        selectedAlbumIds={albumPicker.selectedAlbumIds}
        showNewAlbumInput={albumPicker.showNewAlbumInput}
        newAlbumTitle={albumPicker.newAlbumTitle}
        emptyMessage="Create a new album to save this photo. Studio albums are view-only."
        onToggleAlbum={albumPicker.toggleAlbum}
        onShowNewAlbumInput={() => albumPicker.setShowNewAlbumInput(true)}
        onNewAlbumTitleChange={albumPicker.setNewAlbumTitle}
        onCreateAlbum={async () => {
          const createdAlbum = await albumPicker.createNewAlbum();
          if (createdAlbum) {
            showFeedback({
              title: `Created "${createdAlbum.title}"`,
              message: 'This photo can be added right away.',
            });
          }
        }}
        onSubmit={async () => {
          const result = await albumPicker.submitSelection();
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
