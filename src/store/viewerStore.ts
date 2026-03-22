import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export interface UserAlbum {
  id: string;
  title: string;
  eventId: string;
  photoIds: string[];
  coverUrl?: string;
  createdAt: string;
}

interface ViewerStore {
  // Favourites
  favouriteIds: string[];
  toggleFavourite: (photoId: string) => void;
  addFavourites: (photoIds: string[]) => void;
  savePhotos: (photoIds: string[]) => void;
  isFavourite: (photoId: string) => boolean;

  // User-created albums (stored locally)
  userAlbums: UserAlbum[];
  createAlbum: (title: string, eventId: string) => string;
  addPhotosToAlbum: (albumId: string, photoIds: string[]) => void;
  removePhotoFromAlbum: (albumId: string, photoId: string) => void;
}

export const useViewerStore = create<ViewerStore>()(
  persist(
    (set, get) => ({
      favouriteIds: [],

      toggleFavourite: (photoId) =>
        set((state) => ({
          favouriteIds: state.favouriteIds.includes(photoId)
            ? state.favouriteIds.filter((id) => id !== photoId)
            : [...state.favouriteIds, photoId],
        })),

      addFavourites: (photoIds) =>
        set((state) => ({
          favouriteIds: Array.from(new Set([...state.favouriteIds, ...photoIds])),
        })),

      savePhotos: (photoIds) =>
        set((state) => ({
          favouriteIds: Array.from(new Set([...state.favouriteIds, ...photoIds])),
        })),

      isFavourite: (photoId) => get().favouriteIds.includes(photoId),

      userAlbums: [],

      createAlbum: (title, eventId) => {
        const id = nanoid(8);
        set((state) => ({
          userAlbums: [
            ...state.userAlbums,
            { id, title, eventId, photoIds: [], createdAt: new Date().toISOString() },
          ],
        }));
        return id;
      },

      addPhotosToAlbum: (albumId, photoIds) =>
        set((state) => ({
          userAlbums: state.userAlbums.map((album) =>
            album.id === albumId
              ? {
                  ...album,
                  photoIds: Array.from(new Set([...album.photoIds, ...photoIds])),
                }
              : album
          ),
        })),

      removePhotoFromAlbum: (albumId, photoId) =>
        set((state) => ({
          userAlbums: state.userAlbums.map((album) =>
            album.id === albumId
              ? { ...album, photoIds: album.photoIds.filter((id) => id !== photoId) }
              : album
          ),
        })),
    }),
    { name: 'gallery-viewer' }
  )
);
