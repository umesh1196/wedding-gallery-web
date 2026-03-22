import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Camera, Upload, X } from 'lucide-react';
import { PHOTOS, EVENTS, type Photo } from '../lib/data';
import { useState } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { AlbumPickerSheet } from '../components/AlbumPickerSheet';
import { Sheet } from '../components/Sheet';
import { useAlbumPicker } from '../hooks/useAlbumPicker';
import { useFeedback } from '../components/FeedbackProvider';
import { PeopleStrip } from '../components/people/PeopleStrip';
import { SelectedPersonHero } from '../components/people/SelectedPersonHero';
import { PersonPhotoGrid } from '../components/people/PersonPhotoGrid';

export default function EventPeople() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showFindSheet, setShowFindSheet] = useState(false);
  const albumPicker = useAlbumPicker(id);
  const { showFeedback } = useFeedback();

  const {
    toggleFavourite,
    savePhotos,
    isFavourite,
  } = useViewerStore();

  const event = EVENTS.find((e) => e.id === id);
  const eventPhotos = PHOTOS.filter((p) => p.event === id);
  const selectedPerson = searchParams.get('person');
  const peopleBasePath = id ? `/event/${id}/people` : '/events';
  const peopleViewPath = selectedPerson
    ? `${peopleBasePath}?person=${encodeURIComponent(selectedPerson)}`
    : peopleBasePath;

  const peopleMap = new Map<string, number>();
  eventPhotos.forEach((photo) => {
    photo.people?.forEach((person) => {
      peopleMap.set(person, (peopleMap.get(person) ?? 0) + 1);
    });
  });

  const people = Array.from(peopleMap.entries()).map(([name, count]) => ({ name, count }));
  const filteredPhotos = selectedPerson
    ? eventPhotos.filter((p) => p.people?.includes(selectedPerson))
    : eventPhotos;

  const resetSelectionState = () => {
    setIsSelecting(false);
    setSelectedPhotos([]);
  };

  const backToPeopleView = () => {
    resetSelectionState();
    navigate(peopleBasePath, { replace: true, state: location.state });
  };

  const toggleSelect = (photoId: string) =>
    setSelectedPhotos((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    );

  const toggleSelectAllFiltered = () => {
    if (selectedPhotos.length === filteredPhotos.length) {
      setSelectedPhotos([]);
      return;
    }

    setSelectedPhotos(filteredPhotos.map((photo) => photo.id));
  };

  const handleTogglePerson = (name: string) => {
    resetSelectionState();
    navigate(
      selectedPerson === name ? peopleBasePath : `${peopleBasePath}?person=${encodeURIComponent(name)}`,
      { state: location.state }
    );
  };

  const handleToggleFavourite = (photo: Photo) => {
    const alreadySaved = isFavourite(photo.id);
    toggleFavourite(photo.id);
    showFeedback({
      title: alreadySaved ? 'Removed from saved' : 'Saved to your collection',
      message: photo.alt,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-14 pb-20 md:pt-16 md:pb-16"
    >
      <section className="wrap page-header">
        <p className="mb-1 label text-outline">{event?.title || 'Event'}</p>
        <h2 className="font-headline text-[2.5rem] font-light text-white md:text-5xl lg:text-6xl">People</h2>
      </section>

      <PeopleStrip
        people={people}
        selectedPerson={selectedPerson}
        onSelectPerson={handleTogglePerson}
        onOpenFindSheet={() => setShowFindSheet(true)}
      />

      {selectedPerson && (
        <>
          <SelectedPersonHero
            selectedPerson={selectedPerson}
            photoCount={filteredPhotos.length}
            isSelecting={isSelecting}
            selectedCount={selectedPhotos.length}
            allSelected={filteredPhotos.length > 0 && selectedPhotos.length === filteredPhotos.length}
            onSaveAll={() => {
              savePhotos(filteredPhotos.map((photo) => photo.id));
              showFeedback({
                title: `${filteredPhotos.length} photo${filteredPhotos.length !== 1 ? 's' : ''} saved`,
                message: `${selectedPerson}'s matching photos were added to your collection.`,
              });
            }}
            onStartSelection={() => setIsSelecting(true)}
            onToggleSelectAll={toggleSelectAllFiltered}
            onSaveSelected={() => {
              savePhotos(selectedPhotos);
              showFeedback({
                title: `${selectedPhotos.length} photo${selectedPhotos.length !== 1 ? 's' : ''} saved`,
                message: `Added from ${selectedPerson}.`,
              });
            }}
            onAddSelectedToAlbum={() => albumPicker.openPicker(selectedPhotos)}
            onBackToPeople={backToPeopleView}
          />

          <PersonPhotoGrid
            photos={filteredPhotos}
            isSelecting={isSelecting}
            selectedPhotos={selectedPhotos}
            peopleViewPath={peopleViewPath}
            selectedPerson={selectedPerson}
            isFavourite={isFavourite}
            onToggleSelect={toggleSelect}
            onToggleFavourite={handleToggleFavourite}
            onAddToAlbum={(photoId) => albumPicker.openPicker([photoId])}
          />
        </>
      )}

      <AlbumPickerSheet
        open={albumPicker.isOpen}
        onClose={albumPicker.closePicker}
        photoCount={albumPicker.photoIds.length}
        albums={albumPicker.editableAlbums}
        selectedAlbumIds={albumPicker.selectedAlbumIds}
        showNewAlbumInput={albumPicker.showNewAlbumInput}
        newAlbumTitle={albumPicker.newAlbumTitle}
        emptyMessage="Create a new album to save these photos. Studio albums are view-only."
        onToggleAlbum={albumPicker.toggleAlbum}
        onShowNewAlbumInput={() => albumPicker.setShowNewAlbumInput(true)}
        onNewAlbumTitleChange={albumPicker.setNewAlbumTitle}
        onCreateAlbum={() => {
          const createdAlbum = albumPicker.createNewAlbum();
          if (createdAlbum) {
            showFeedback({
              title: `Created "${createdAlbum.title}"`,
              message: 'It is ready for these selections.',
            });
          }
        }}
        onSubmit={() => {
          const result = albumPicker.submitSelection();
          if (result) {
            showFeedback({
              title: `Added ${result.photoCount} photo${result.photoCount !== 1 ? 's' : ''}`,
              message: `Saved to ${result.albumCount} album${result.albumCount !== 1 ? 's' : ''}.`,
            });
            resetSelectionState();
          }
        }}
      />

      <Sheet open={showFindSheet} onClose={() => setShowFindSheet(false)}>
        <div className="px-6 pt-6 pb-4 md:px-8 md:pt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="label text-outline">Find Your Photos</p>
              <h2 className="mt-1 font-headline text-2xl font-light text-white md:text-3xl">
                Add a selfie
              </h2>
            </div>
            <button
              onClick={() => setShowFindSheet(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/5"
            >
              <X className="h-5 w-5 text-outline" />
            </button>
          </div>

          <p className="mb-6 font-body text-sm text-outline">
            Upload a selfie to find photos of yourself in this event.
          </p>

          <div className="grid gap-3 pb-2">
            <button className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-rose-accent px-5 py-3 text-white label font-bold transition-colors hover:bg-rose-accent/90">
              <Camera className="h-4 w-4" />
              Open Camera
            </button>
            <button className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white/88 label transition-colors hover:bg-white/8">
              <Upload className="h-4 w-4" />
              Upload from Library
            </button>
          </div>
        </div>
      </Sheet>
    </motion.div>
  );
}
