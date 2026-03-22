import { useState } from 'react';
import { useViewerStore } from '../store/viewerStore';

export function useAlbumPicker(eventId?: string) {
  const { userAlbums, addPhotosToAlbum, createAlbum } = useViewerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<string[]>([]);
  const [showNewAlbumInput, setShowNewAlbumInput] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [photoIds, setPhotoIds] = useState<string[]>([]);

  const editableAlbums = userAlbums.filter((album) => album.eventId === eventId);

  const reset = () => {
    setIsOpen(false);
    setSelectedAlbumIds([]);
    setShowNewAlbumInput(false);
    setNewAlbumTitle('');
    setPhotoIds([]);
  };

  const openPicker = (nextPhotoIds: string[]) => {
    setPhotoIds(nextPhotoIds);
    setSelectedAlbumIds([]);
    setShowNewAlbumInput(false);
    setNewAlbumTitle('');
    setIsOpen(true);
  };

  const toggleAlbum = (albumId: string) =>
    setSelectedAlbumIds((prev) =>
      prev.includes(albumId) ? prev.filter((id) => id !== albumId) : [...prev, albumId]
    );

  const createNewAlbum = () => {
    if (!newAlbumTitle.trim() || !eventId) return;
    const title = newAlbumTitle.trim();
    const albumId = createAlbum(title, eventId);
    setSelectedAlbumIds((prev) => [...prev, albumId]);
    setNewAlbumTitle('');
    setShowNewAlbumInput(false);
    return { albumId, title };
  };

  const submitSelection = () => {
    if (selectedAlbumIds.length === 0 || photoIds.length === 0) return false;

    const summary = {
      albumCount: selectedAlbumIds.length,
      photoCount: photoIds.length,
    };
    selectedAlbumIds.forEach((albumId) => addPhotosToAlbum(albumId, photoIds));
    reset();
    return summary;
  };

  return {
    editableAlbums,
    isOpen,
    selectedAlbumIds,
    showNewAlbumInput,
    newAlbumTitle,
    photoIds,
    openPicker,
    closePicker: reset,
    toggleAlbum,
    setShowNewAlbumInput,
    setNewAlbumTitle,
    createNewAlbum,
    submitSelection,
  };
}
