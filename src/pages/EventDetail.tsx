import { motion } from 'motion/react';
import { Link2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { AlbumPickerSheet } from '../components/AlbumPickerSheet';
import { EventGrid } from '../components/event/EventGrid';
import { EventHero } from '../components/event/EventHero';
import { SelectionBar } from '../components/event/SelectionBar';
import { PHOTOS, EVENTS } from '../lib/data';
import { useViewerStore } from '../store/viewerStore';
import { buildPhotoFilename, downloadPhotos } from '../lib/download';
import { useAlbumPicker } from '../hooks/useAlbumPicker';
import { useFeedback } from '../components/FeedbackProvider';
import { getEventEditorial } from '../lib/eventEditorial';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const albumPicker = useAlbumPicker(id);
  const { showFeedback } = useFeedback();

  const { savePhotos, isFavourite } = useViewerStore();

  const event = EVENTS.find((entry) => entry.id === id);
  const eventPhotos = PHOTOS.filter((photo) => photo.event === id);
  const heroPhoto = eventPhotos.find((photo) => photo.url === event?.coverUrl) ?? eventPhotos[0];
  const editorial = event ? getEventEditorial(event.id) : null;
  const gridPhotos = isSelecting
    ? eventPhotos
    : eventPhotos.filter((photo) => photo.id !== heroPhoto?.id);

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

  const handleSaveFavourites = () => {
    savePhotos(selectedPhotos);
    showFeedback({
      title: `${selectedPhotos.length} photo${selectedPhotos.length !== 1 ? 's' : ''} saved`,
      message: 'These are now part of your personal saved moments.',
    });
    exitSelectionMode();
  };

  const handleDownloadSelected = () => {
    const selectedFiles = eventPhotos
      .filter((photo) => selectedPhotos.includes(photo.id))
      .map((photo) => ({
        url: photo.url,
        filename: buildPhotoFilename(photo.alt, photo.id),
      }));

    downloadPhotos(selectedFiles);
    showFeedback({
      title: `Preparing ${selectedFiles.length} download${selectedFiles.length !== 1 ? 's' : ''}`,
      message: 'Your browser will open each selected photo so you can save them.',
      variant: 'info',
    });
  };

  if (!event || !heroPhoto) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-14 pb-24 md:pt-16 md:pb-16"
    >
      {!isSelecting && (
        <>
        <EventHero
          event={event}
          heroPhoto={heroPhoto}
        />

          <div className="wrap pt-4 pb-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-black/12 px-3 py-2 text-white/72 backdrop-blur-sm">
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
        onSave={handleSaveFavourites}
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

      <AlbumPickerSheet
        open={albumPicker.isOpen}
        onClose={albumPicker.closePicker}
        photoCount={albumPicker.photoIds.length}
        albums={albumPicker.editableAlbums}
        selectedAlbumIds={albumPicker.selectedAlbumIds}
        showNewAlbumInput={albumPicker.showNewAlbumInput}
        newAlbumTitle={albumPicker.newAlbumTitle}
        emptyMessage="Create a new album to save selected photos. Studio albums are view-only."
        onToggleAlbum={albumPicker.toggleAlbum}
        onShowNewAlbumInput={() => albumPicker.setShowNewAlbumInput(true)}
        onNewAlbumTitleChange={albumPicker.setNewAlbumTitle}
        onCreateAlbum={() => {
          const result = albumPicker.createAlbumAndSubmit();
          if (result) {
            showFeedback({
              title: `Added ${result.photoCount} photo${result.photoCount !== 1 ? 's' : ''} to "${result.title}"`,
              message: 'New album created and photos saved.',
            });
            exitSelectionMode();
          }
        }}
        onSubmit={() => {
          const result = albumPicker.submitSelection();
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
