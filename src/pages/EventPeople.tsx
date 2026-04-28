import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Camera, Upload, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { useSessionStore } from '../store/sessionStore';
import { AlbumPickerSheet } from '../components/AlbumPickerSheet';
import { Sheet } from '../components/Sheet';
import { useAlbumPicker } from '../hooks/useAlbumPicker';
import { useFeedback } from '../components/FeedbackProvider';
import { PeopleStrip } from '../components/people/PeopleStrip';
import { SelectedPersonHero } from '../components/people/SelectedPersonHero';
import { PersonPhotoGrid } from '../components/people/PersonPhotoGrid';
import { EventPageTabs } from '../components/Navigation';
import { fetchPeople, fetchPersonPhotos, searchFaces } from '../lib/api/people';
import { mapGalleryPhotoToPhoto } from '../lib/api/adapters';
import type { Photo } from '../lib/data';
import type { BackendPerson } from '../lib/api/types';

export default function EventPeople() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showFindSheet, setShowFindSheet] = useState(false);
  const [people, setPeople] = useState<BackendPerson[]>([]);
  const [personPhotos, setPersonPhotos] = useState<Photo[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const albumPicker = useAlbumPicker();
  const { showFeedback } = useFeedback();
  const { toggleFavourite, savePhotos, isFavourite } = useViewerStore();
  const { studioSlug, weddingSlug, galleryToken } = useSessionStore();

  const selectedPerson = searchParams.get('person');
  const peopleBasePath = id ? `/event/${id}/people` : '/events';
  const peopleViewPath = selectedPerson
    ? `${peopleBasePath}?person=${encodeURIComponent(selectedPerson)}`
    : peopleBasePath;

  // Load people list
  useEffect(() => {
    if (!studioSlug || !weddingSlug || !galleryToken) return;
    fetchPeople(studioSlug, weddingSlug, galleryToken)
      .then((res) => setPeople(res.data))
      .catch(() => setPeople([]));
  }, [studioSlug, weddingSlug, galleryToken]);

  // Load photos for selected person
  useEffect(() => {
    if (!selectedPerson || !studioSlug || !weddingSlug || !galleryToken) {
      setPersonPhotos([]);
      return;
    }
    const person = people.find((p) => p.label === selectedPerson);
    if (!person) return;

    fetchPersonPhotos(studioSlug, weddingSlug, person.id, galleryToken)
      .then((res) => setPersonPhotos(res.data.map(mapGalleryPhotoToPhoto)))
      .catch(() => setPersonPhotos([]));
  }, [selectedPerson, people, studioSlug, weddingSlug, galleryToken]);

  const peopleForStrip = people.map((p) => ({
    name: p.label,
    count: p.photo_count,
    avatarUrl: p.avatar_url,
  }));

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
      prev.includes(photoId) ? prev.filter((pid) => pid !== photoId) : [...prev, photoId]
    );

  const toggleSelectAllFiltered = () => {
    if (selectedPhotos.length === personPhotos.length) {
      setSelectedPhotos([]);
      return;
    }
    setSelectedPhotos(personPhotos.map((photo) => photo.id));
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

  const handleSelfieSelected = async (file: File) => {
    if (!studioSlug || !weddingSlug || !galleryToken) return;
    setShowFindSheet(false);
    setSearchLoading(true);
    try {
      const res = await searchFaces(studioSlug, weddingSlug, file, galleryToken);
      const result = res.data;
      if (result.person) {
        showFeedback({
          title: `Found you! ${result.photo_ids.length} photo${result.photo_ids.length !== 1 ? 's' : ''} found`,
          message: `Showing photos for ${result.person.label}`,
        });
        navigate(`${peopleBasePath}?person=${encodeURIComponent(result.person.label)}`, {
          state: location.state,
        });
      } else if (result.photo_ids.length > 0) {
        showFeedback({
          title: `${result.photo_ids.length} matching photo${result.photo_ids.length !== 1 ? 's' : ''} found`,
          message: 'Your face was matched in the gallery.',
        });
      } else {
        showFeedback({
          title: 'No matches found',
          message: 'Try a clearer photo with your face visible.',
        });
      }
    } catch {
      showFeedback({ title: 'Search failed', message: 'Please try again.' });
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-14 pb-20 md:pt-16 md:pb-16"
    >
      <section className="wrap page-header">
        <p className="mb-1 label text-outline">People</p>
        <h2 className="font-headline text-[2.5rem] font-light text-foreground md:text-5xl lg:text-6xl">Faces</h2>
        {id ? <EventPageTabs eventId={id} /> : null}
      </section>

      <PeopleStrip
        people={peopleForStrip}
        selectedPerson={selectedPerson}
        onSelectPerson={handleTogglePerson}
        onOpenFindSheet={() => setShowFindSheet(true)}
      />

      {selectedPerson && (
        <>
          <SelectedPersonHero
            selectedPerson={selectedPerson}
            photoCount={personPhotos.length}
            isSelecting={isSelecting}
            selectedCount={selectedPhotos.length}
            allSelected={personPhotos.length > 0 && selectedPhotos.length === personPhotos.length}
            onSaveAll={() => {
              savePhotos(personPhotos.map((photo) => photo.id));
              showFeedback({
                title: `${personPhotos.length} photo${personPhotos.length !== 1 ? 's' : ''} saved`,
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
            photos={personPhotos}
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
        loading={albumPicker.loadingAlbums}
        selectedAlbumIds={albumPicker.selectedAlbumIds}
        emptyMessage="No print albums are available yet. The studio can create them from the admin panel."
        onToggleAlbum={albumPicker.toggleAlbum}
        onSubmit={async () => {
          const result = await albumPicker.submitSelection();
          if (result) {
            showFeedback({
              title: `Added ${result.photoCount} photo${result.photoCount !== 1 ? 's' : ''}`,
              message: `Saved to ${result.albumCount} print album${result.albumCount !== 1 ? 's' : ''}.`,
            });
            resetSelectionState();
          }
        }}
      />

      {/* Hidden file inputs for selfie capture */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleSelfieSelected(file);
          e.target.value = '';
        }}
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleSelfieSelected(file);
          e.target.value = '';
        }}
      />

      <Sheet open={showFindSheet} onClose={() => setShowFindSheet(false)}>
        <div className="px-6 pt-6 pb-4 md:px-8 md:pt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="label text-outline">Find Your Photos</p>
              <h2 className="mt-1 font-headline text-2xl font-light text-foreground md:text-3xl">
                Add a selfie
              </h2>
            </div>
            <button
              onClick={() => setShowFindSheet(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-foreground/5"
            >
              <X className="h-5 w-5 text-outline" />
            </button>
          </div>

          <p className="mb-6 font-body text-sm text-outline">
            Upload a selfie to find photos of yourself in this event.
          </p>

          <div className="grid gap-3 pb-2">
            <button
              disabled={searchLoading}
              onClick={() => cameraInputRef.current?.click()}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-rose-accent px-5 py-3 text-white label font-bold transition-colors hover:bg-rose-accent/90 disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              {searchLoading ? 'Searching…' : 'Open Camera'}
            </button>
            <button
              disabled={searchLoading}
              onClick={() => libraryInputRef.current?.click()}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/5 px-5 py-3 text-foreground/88 label transition-colors hover:bg-foreground/8 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              Upload from Library
            </button>
          </div>
        </div>
      </Sheet>
    </motion.div>
  );
}
