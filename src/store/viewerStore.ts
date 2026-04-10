import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export interface UserAlbum {
  id: string;
  slug?: string;
  title: string;
  eventId: string;
  photoIds: string[];
  photoCount?: number;
  coverUrl?: string;
  createdAt: string;
}

interface ViewerStore {
  // Favourites
  favouriteIds: string[];
  toggleFavourite: (photoId: string) => void;
  syncPhotoLikeStates: (states: Array<{ id: string; liked: boolean }>) => void;
  replaceFavourites: (photoIds: string[]) => void;
  addFavourites: (photoIds: string[]) => void;
  savePhotos: (photoIds: string[]) => void;
  isFavourite: (photoId: string) => boolean;

  // User-created albums (stored locally)
  userAlbums: UserAlbum[];
  createAlbum: (title: string, eventId: string) => string;
  addPhotosToAlbum: (albumId: string, photoIds: string[]) => void;
  removePhotoFromAlbum: (albumId: string, photoId: string) => void;
  upsertUserAlbum: (album: UserAlbum) => void;
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

      syncPhotoLikeStates: (states) =>
        set((state) => {
          const nextIds = new Set(state.favouriteIds);

          for (const { id, liked } of states) {
            nextIds.delete(id);
            if (liked) nextIds.add(id);
          }

          return {
            favouriteIds: Array.from(nextIds),
          };
        }),

      replaceFavourites: (photoIds) =>
        set({
          favouriteIds: Array.from(new Set(photoIds)),
        }),

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

      upsertUserAlbum: (album) =>
        set((state) => {
          const existing = state.userAlbums.find((entry) => entry.id === album.id);
          if (!existing) {
            return {
              userAlbums: [...state.userAlbums, album],
            };
          }

          return {
            userAlbums: state.userAlbums.map((entry) =>
              entry.id === album.id
                ? {
                    ...entry,
                    ...album,
                    photoIds: album.photoIds.length ? album.photoIds : entry.photoIds,
                    photoCount: album.photoCount ?? entry.photoCount,
                  }
                : entry
            ),
          };
        }),
    }),
    { name: 'gallery-viewer' }
  )
);
