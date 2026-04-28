import { useEffect, useMemo, useState } from 'react';
import {
  addPhotosToGuestPrintSelectionBucket,
  fetchGuestPrintSelectionBuckets,
} from '../lib/api/printSelection';
import { useSessionStore } from '../store/sessionStore';

export interface PickerAlbum {
  id: string;
  slug: string;
  title: string;
  photoCount: number;
  selectionLimit: number;
  remainingCount: number;
  locked: boolean;
  full: boolean;
}

function mapBucketToPickerAlbum(bucket: {
  id: string;
  slug: string;
  name: string;
  selected_count: number;
  selection_limit: number;
  remaining_count: number;
  locked: boolean;
}) {
  return {
    id: bucket.id,
    slug: bucket.slug,
    title: bucket.name,
    photoCount: bucket.selected_count ?? 0,
    selectionLimit: bucket.selection_limit ?? 0,
    remainingCount: bucket.remaining_count ?? 0,
    locked: Boolean(bucket.locked),
    full: (bucket.remaining_count ?? 0) <= 0,
  };
}

export function useAlbumPicker() {
  const { mode, galleryToken, studioSlug, weddingSlug } = useSessionStore();
  const [albums, setAlbums] = useState<PickerAlbum[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<string[]>([]);
  const [photoIds, setPhotoIds] = useState<string[]>([]);

  const refreshAlbums = async () => {
    if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug) return;

    const response = await fetchGuestPrintSelectionBuckets(studioSlug, weddingSlug, galleryToken);
    setAlbums(response.data.map(mapBucketToPickerAlbum));
  };

  useEffect(() => {
    let active = true;

    if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug) {
      setAlbums([]);
      setLoadingAlbums(false);
      return;
    }

    setLoadingAlbums(true);

    fetchGuestPrintSelectionBuckets(studioSlug, weddingSlug, galleryToken)
      .then((response) => {
        if (!active) return;
        setAlbums(response.data.map(mapBucketToPickerAlbum));
      })
      .catch(() => {
        if (!active) return;
        setAlbums([]);
      })
      .finally(() => {
        if (!active) return;
        setLoadingAlbums(false);
      });

    return () => {
      active = false;
    };
  }, [galleryToken, mode, studioSlug, weddingSlug]);

  const editableAlbums = useMemo(() => albums, [albums]);

  const reset = () => {
    setIsOpen(false);
    setSelectedAlbumIds([]);
    setPhotoIds([]);
  };

  const openPicker = (nextPhotoIds: string[]) => {
    setPhotoIds(nextPhotoIds);
    setSelectedAlbumIds([]);
    setIsOpen(true);
  };

  const toggleAlbum = (albumId: string) =>
    setSelectedAlbumIds((prev) =>
      prev.includes(albumId) ? prev.filter((id) => id !== albumId) : [...prev, albumId]
    );

  const submitSelection = async () => {
    if (
      selectedAlbumIds.length === 0 ||
      photoIds.length === 0 ||
      mode !== 'guest' ||
      !galleryToken ||
      !studioSlug ||
      !weddingSlug
    ) {
      return false;
    }

    const selectedAlbums = albums.filter((album) => selectedAlbumIds.includes(album.id));

    await Promise.all(
      selectedAlbums.map((album) =>
        addPhotosToGuestPrintSelectionBucket(
          studioSlug,
          weddingSlug,
          album.slug,
          photoIds,
          galleryToken
        )
      )
    );

    await refreshAlbums();
    const summary = {
      albumCount: selectedAlbumIds.length,
      photoCount: photoIds.length,
    };
    reset();
    return summary;
  };

  return {
    editableAlbums,
    loadingAlbums,
    isOpen,
    selectedAlbumIds,
    photoIds,
    openPicker,
    closePicker: reset,
    toggleAlbum,
    submitSelection,
  };
}
