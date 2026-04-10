import { motion } from 'motion/react';
import { Link2 } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { AlbumPickerSheet } from '../components/AlbumPickerSheet';
import { EventGrid } from '../components/event/EventGrid';
import { EventHero } from '../components/event/EventHero';
import { SelectionBar } from '../components/event/SelectionBar';
import type { Event, Photo } from '../lib/data';
import { useViewerStore } from '../store/viewerStore';
import { downloadPhoto } from '../lib/download';
import { useAlbumPicker } from '../hooks/useAlbumPicker';
import { useFeedback } from '../components/FeedbackProvider';
import { getEventEditorial } from '../lib/eventEditorial';
import { fetchGalleryCeremonies, fetchGalleryPhotos } from '../lib/api/gallery';
import { mapCeremonyToEvent, mapGalleryPhotoToPhoto } from '../lib/api/adapters';
import { likePhoto } from '../lib/api/interactions';
import { useSessionStore } from '../store/sessionStore';
import { createDownloadRequest, fetchDownloadRequest } from '../lib/api/downloads';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const albumPicker = useAlbumPicker(id);
  const { showFeedback } = useFeedback();
  const { mode, galleryToken, studioSlug, weddingSlug } = useSessionStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [eventPhotos, setEventPhotos] = useState<Photo[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isFavourite, syncPhotoLikeStates } = useViewerStore();

  useEffect(() => {
    let active = true;

    if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug || !id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      fetchGalleryCeremonies(studioSlug, weddingSlug, galleryToken),
      fetchGalleryPhotos(studioSlug, weddingSlug, id, galleryToken),
    ])
      .then(([ceremoniesResponse, photosResponse]) => {
        if (!active) return;

        const nextEvent =
          ceremoniesResponse.data.map(mapCeremonyToEvent).find((entry) => entry.id === id) ?? null;
        const nextPhotos = photosResponse.data.map(mapGalleryPhotoToPhoto);
        const nextPageCursor =
          typeof photosResponse.meta?.next_cursor === 'string' ? photosResponse.meta.next_cursor : null;

        setEvent(nextEvent);
        setEventPhotos(nextPhotos);
        setNextCursor(nextPageCursor);
        syncPhotoLikeStates(
          photosResponse.data.map((photo) => ({
            id: photo.id,
            liked: Boolean(photo.is_liked),
          }))
        );
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
  }, [galleryToken, id, mode, studioSlug, syncPhotoLikeStates, weddingSlug]);

  const loadMorePhotos = async () => {
    if (!id || !galleryToken || !studioSlug || !weddingSlug || !nextCursor || loadingMore) return;

    setLoadingMore(true);

    try {
      const photosResponse = await fetchGalleryPhotos(
        studioSlug,
        weddingSlug,
        id,
        galleryToken,
        20,
        nextCursor
      );
      const appendedPhotos = photosResponse.data.map(mapGalleryPhotoToPhoto);
      const nextPageCursor =
        typeof photosResponse.meta?.next_cursor === 'string' ? photosResponse.meta.next_cursor : null;

      setEventPhotos((current) => {
        const seen = new Set(current.map((photo) => photo.id));
        const deduped = appendedPhotos.filter((photo) => !seen.has(photo.id));
        return [...current, ...deduped];
      });
      setNextCursor(nextPageCursor);
      syncPhotoLikeStates(
        photosResponse.data.map((photo) => ({
          id: photo.id,
          liked: Boolean(photo.is_liked),
        }))
      );
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Unable to load more photos right now.';
      showFeedback({
        title: 'Could not load more photos',
        message,
        variant: 'info',
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const heroPhoto = useMemo(() => {
    if (!eventPhotos.length) return null;

    return (
      eventPhotos.find(
        (photo) => photo.url === event?.coverUrl || photo.thumbnailUrl === event?.coverUrl
      ) ?? eventPhotos[0]
    );
  }, [event?.coverUrl, eventPhotos]);

  const editorial = event ? getEventEditorial(event.id) : null;
  const gridPhotos = isSelecting
    ? eventPhotos
    : eventPhotos.length <= 1
      ? eventPhotos
      : eventPhotos.filter((photo) => photo.id !== heroPhoto?.id);

  if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="wrap mobile-safe-top mobile-home-nav-spacer py-16">
        <p className="font-body text-sm text-foreground/62">Loading chapter…</p>
      </div>
    );
  }

  if (error || !event || !heroPhoto) {
    return (
      <div className="wrap mobile-safe-top mobile-home-nav-spacer py-16">
        <p className="font-body text-sm text-foreground/62">
          {error ?? 'This chapter is not available right now.'}
        </p>
      </div>
    );
  }
  const toggleSelect = (photoId: string) =>
    setSelectedPhotos((prev) =>
      prev.includes(photoId) ? prev.filter((pid) => pid !== photoId) : [...prev, photoId]
    );

  const clearSelection = () => {
    setSelectedPhotos([]);
  };

  const exitSelectionMode = () => {
    setIsSelecting(false);
    setSelectedPhotos([]);
  };

  const selectAllPhotos = () => {
    setSelectedPhotos(eventPhotos.map((photo) => photo.id));
  };

  const handleLikeSelected = async () => {
    if (!galleryToken || !studioSlug || !weddingSlug || selectedPhotos.length === 0) return;

    const pendingIds = selectedPhotos.filter((photoId) => !isFavourite(photoId));

    if (pendingIds.length === 0) {
      showFeedback({
        title: 'Already liked',
        message: 'All selected photos are already in your saved moments.',
        variant: 'info',
      });
      exitSelectionMode();
      return;
    }

    syncPhotoLikeStates(pendingIds.map((id) => ({ id, liked: true })));

    try {
      const responses = await Promise.all(
        pendingIds.map((photoId) => likePhoto(studioSlug, weddingSlug, photoId, galleryToken))
      );

      syncPhotoLikeStates(
        responses.map((response) => ({
          id: response.data.id,
          liked: response.data.liked,
        }))
      );

      showFeedback({
        title: `${pendingIds.length} photo${pendingIds.length !== 1 ? 's' : ''} liked`,
        message: 'Your selected moments are now saved to your personal collection.',
      });
      exitSelectionMode();
    } catch (likeError) {
      syncPhotoLikeStates(pendingIds.map((id) => ({ id, liked: false })));
      showFeedback({
        title: 'Could not like selected photos',
        message:
          likeError instanceof Error ? likeError.message : 'Please try again in a moment.',
        variant: 'info',
      });
    }
  };

  const handleDownloadSelected = async () => {
    if (!galleryToken || !studioSlug || !weddingSlug || selectedPhotos.length === 0) return;

    try {
      const response = await createDownloadRequest(studioSlug, weddingSlug, galleryToken, {
        type: 'selected_photos',
        photo_ids: selectedPhotos,
      });

      showFeedback({
        title: `Preparing ${selectedPhotos.length} photo${selectedPhotos.length !== 1 ? 's' : ''}`,
        message: 'Building your original-photo ZIP now.',
        variant: 'info',
      });

      const requestId = response.data.id;
      let attempts = 0;

      while (attempts < 12) {
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
            title: 'ZIP download ready',
            message: 'Downloading the original selected photos now.',
          });
          exitSelectionMode();
          return;
        }

        if (statusResponse.data.status === 'failed') {
          throw new Error(statusResponse.data.error_message || 'The download archive could not be created.');
        }
      }

      showFeedback({
        title: 'ZIP is still preparing',
        message: 'Give it another moment and try again shortly.',
        variant: 'info',
      });
    } catch (downloadError) {
      showFeedback({
        title: 'Could not prepare download',
        message:
          downloadError instanceof Error ? downloadError.message : 'Please try again in a moment.',
        variant: 'info',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-14 pb-24 md:pt-16 md:pb-16"
    >
      {!isSelecting && (
        <>
          {eventPhotos.length === 1 ? (
            <Link
              to={`/photo/${heroPhoto.id}?event=${encodeURIComponent(event.id)}`}
              state={{ backTo: `/event/${event.id}`, backLabel: 'Photos', eventId: event.id }}
              className="block"
            >
              <EventHero
                event={event}
                heroPhoto={heroPhoto}
              />
            </Link>
          ) : (
            <EventHero
              event={event}
              heroPhoto={heroPhoto}
            />
          )}

          <div className="wrap pt-4 pb-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground/8 bg-black/12 px-3 py-2 text-foreground/72 backdrop-blur-sm">
              <Link2 className="h-4 w-4 text-rose-accent" />
              <span className="label">{eventPhotos.length} moments · {editorial?.moodLabel ?? 'Quietly curated'}</span>
            </div>
          </div>
        </>
      )}

      <SelectionBar
        open={isSelecting}
        selectedCount={selectedPhotos.length}
        allSelected={selectedPhotos.length === eventPhotos.length}
        onExit={exitSelectionMode}
        onToggleSelectAll={selectedPhotos.length === eventPhotos.length ? clearSelection : selectAllPhotos}
        onDownload={handleDownloadSelected}
        onLike={handleLikeSelected}
        onAddToAlbum={() => albumPicker.openPicker(selectedPhotos)}
      />

      <EventGrid
        photos={gridPhotos}
        isSelecting={isSelecting}
        selectedPhotoIds={selectedPhotos}
        eventId={id ?? ''}
        isFavourite={isFavourite}
        onToggleSelect={toggleSelect}
        onLongPress={(photoId) => {
          setIsSelecting(true);
          toggleSelect(photoId);
        }}
      />

      {nextCursor ? (
        <div className="wrap mt-6 flex justify-center pb-4">
          <button
            type="button"
            onClick={loadMorePhotos}
            disabled={loadingMore}
            className="label rounded-full border border-rose-accent/20 bg-white px-5 py-3 text-foreground transition hover:border-rose-accent/40 hover:bg-rose-accent/6 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? 'Loading more...' : 'Load more'}
          </button>
        </div>
      ) : null}

      <AlbumPickerSheet
        open={albumPicker.isOpen}
        onClose={albumPicker.closePicker}
        photoCount={albumPicker.photoIds.length}
        albums={albumPicker.editableAlbums}
        loading={albumPicker.loadingAlbums}
        selectedAlbumIds={albumPicker.selectedAlbumIds}
        showNewAlbumInput={albumPicker.showNewAlbumInput}
        newAlbumTitle={albumPicker.newAlbumTitle}
        emptyMessage="Create a new album to save selected photos. Studio albums are view-only."
        onToggleAlbum={albumPicker.toggleAlbum}
        onShowNewAlbumInput={() => albumPicker.setShowNewAlbumInput(true)}
        onNewAlbumTitleChange={albumPicker.setNewAlbumTitle}
        onCreateAlbum={async () => {
          const result = await albumPicker.createAlbumAndSubmit();
          if (result) {
            showFeedback({
              title: `Added ${result.photoCount} photo${result.photoCount !== 1 ? 's' : ''} to "${result.title}"`,
              message: 'New album created and photos saved.',
            });
            exitSelectionMode();
          }
        }}
        onSubmit={async () => {
          const result = await albumPicker.submitSelection();
          if (result) {
            showFeedback({
              title: `Added ${result.photoCount} photo${result.photoCount !== 1 ? 's' : ''}`,
              message: `Saved to ${result.albumCount} personal album${result.albumCount !== 1 ? 's' : ''}.`,
            });
            exitSelectionMode();
          }
        }}
      />
    </motion.div>
  );
}
