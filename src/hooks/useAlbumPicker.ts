import { useEffect, useMemo, useState } from 'react';
import {
  addPhotosToGalleryAlbum,
  createGalleryAlbum,
  fetchGalleryAlbums,
} from '../lib/api/albums';
import { useSessionStore } from '../store/sessionStore';
import { useViewerStore } from '../store/viewerStore';

export interface PickerAlbum {
  id: string;
  slug: string;
  title: string;
  eventId: string;
  photoCount: number;
}

function mapBackendAlbumToPickerAlbum(
  album: {
    id: string;
    slug: string;
    name: string;
    photos_count: number;
  },
  eventId: string
): PickerAlbum {
  return {
    id: album.id,
    slug: album.slug,
    title: album.name,
    eventId,
    photoCount: album.photos_count ?? 0,
  };
}

export function useAlbumPicker(eventId?: string) {
  const { mode, galleryToken, studioSlug, weddingSlug } = useSessionStore();
  const { upsertUserAlbum } = useViewerStore();
  const [albums, setAlbums] = useState<PickerAlbum[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<string[]>([]);
  const [showNewAlbumInput, setShowNewAlbumInput] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [photoIds, setPhotoIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug || !eventId) {
      setAlbums([]);
      setLoadingAlbums(false);
      return;
    }

    setLoadingAlbums(true);

    fetchGalleryAlbums(studioSlug, weddingSlug, eventId, galleryToken)
      .then((response) => {
        if (!active) return;
        const mappedAlbums = response.data.map((album) => mapBackendAlbumToPickerAlbum(album, eventId));
        setAlbums(mappedAlbums);
        mappedAlbums.forEach((album) => {
          upsertUserAlbum({
            id: album.id,
            slug: album.slug,
            title: album.title,
            eventId: album.eventId,
            photoIds: [],
            photoCount: album.photoCount,
            createdAt: new Date().toISOString(),
          });
        });
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
  }, [eventId, galleryToken, mode, studioSlug, upsertUserAlbum, weddingSlug]);

  const editableAlbums = useMemo(() => albums, [albums]);

  const reset = () => {
    setIsOpen(false);
    setSelectedAlbumIds([]);
    setShowNewAlbumInput(false);
    setNewAlbumTitle('');
    setPhotoIds([]);
  };

  const refreshAlbums = async () => {
    if (mode !== 'guest' || !galleryToken || !studioSlug || !weddingSlug || !eventId) return;

    const response = await fetchGalleryAlbums(studioSlug, weddingSlug, eventId, galleryToken);
    const mappedAlbums = response.data.map((album) => mapBackendAlbumToPickerAlbum(album, eventId));
    setAlbums(mappedAlbums);
    mappedAlbums.forEach((album) => {
      upsertUserAlbum({
        id: album.id,
        slug: album.slug,
        title: album.title,
        eventId: album.eventId,
        photoIds: [],
        photoCount: album.photoCount,
        createdAt: new Date().toISOString(),
      });
    });
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

  const createNewAlbum = async () => {
    if (
      !newAlbumTitle.trim() ||
      !eventId ||
      mode !== 'guest' ||
      !galleryToken ||
      !studioSlug ||
      !weddingSlug
    ) {
      return;
    }

    const title = newAlbumTitle.trim();
    const response = await createGalleryAlbum(
      studioSlug,
      weddingSlug,
      eventId,
      galleryToken,
      { name: title, album_type: 'user_created' }
    );
    const nextAlbum = mapBackendAlbumToPickerAlbum(response.data, eventId);
    setAlbums((current) => [...current, nextAlbum].sort((a, b) => a.title.localeCompare(b.title)));
    upsertUserAlbum({
      id: nextAlbum.id,
      slug: nextAlbum.slug,
      title: nextAlbum.title,
      eventId: nextAlbum.eventId,
      photoIds: [],
      photoCount: nextAlbum.photoCount,
      createdAt: new Date().toISOString(),
    });
    setSelectedAlbumIds((prev) => [...prev, nextAlbum.id]);
    setNewAlbumTitle('');
    setShowNewAlbumInput(false);
    return { albumId: nextAlbum.id, title: nextAlbum.title };
  };

  const createAlbumAndSubmit = async () => {
    if (
      !newAlbumTitle.trim() ||
      !eventId ||
      photoIds.length === 0 ||
      mode !== 'guest' ||
      !galleryToken ||
      !studioSlug ||
      !weddingSlug
    ) {
      return;
    }

    const title = newAlbumTitle.trim();
    const created = await createGalleryAlbum(
      studioSlug,
      weddingSlug,
      eventId,
      galleryToken,
      { name: title, album_type: 'user_created' }
    );

    await addPhotosToGalleryAlbum(
      studioSlug,
      weddingSlug,
      eventId,
      created.data.slug,
      galleryToken,
      photoIds
    );

    upsertUserAlbum({
      id: created.data.id,
      slug: created.data.slug,
      title,
      eventId,
      photoIds,
      photoCount: photoIds.length,
      createdAt: new Date().toISOString(),
    });

    await refreshAlbums();
    const summary = { albumCount: 1, photoCount: photoIds.length, title };
    reset();
    return summary;
  };

  const submitSelection = async () => {
    if (
      selectedAlbumIds.length === 0 ||
      photoIds.length === 0 ||
      mode !== 'guest' ||
      !galleryToken ||
      !studioSlug ||
      !weddingSlug ||
      !eventId
    ) {
      return false;
    }

    const selectedAlbums = albums.filter((album) => selectedAlbumIds.includes(album.id));

    await Promise.all(
      selectedAlbums.map((album) =>
        addPhotosToGalleryAlbum(
          studioSlug,
          weddingSlug,
          eventId,
          album.slug,
          galleryToken,
          photoIds
        )
      )
    );

    selectedAlbums.forEach((album) => {
      upsertUserAlbum({
        id: album.id,
        slug: album.slug,
        title: album.title,
        eventId,
        photoIds,
        photoCount: (album.photoCount ?? 0) + photoIds.length,
        createdAt: new Date().toISOString(),
      });
    });

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
    showNewAlbumInput,
    newAlbumTitle,
    photoIds,
    openPicker,
    closePicker: reset,
    toggleAlbum,
    setShowNewAlbumInput,
    setNewAlbumTitle,
    createNewAlbum,
    createAlbumAndSubmit,
    submitSelection,
  };
}
