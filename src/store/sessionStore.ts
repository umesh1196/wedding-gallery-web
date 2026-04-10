import type { BackendStudio, BackendWedding } from '../lib/api/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SessionMode = 'admin' | 'guest' | null;

interface AdminSessionPayload {
  studioJwt: string;
  studioSlug?: string | null;
}

interface GallerySessionPayload {
  galleryToken: string;
  guestIdentityToken?: string | null;
  studioSlug: string;
  weddingSlug: string;
}

interface SessionStore {
  mode: SessionMode;
  studioJwt: string | null;
  galleryToken: string | null;
  guestIdentityToken: string | null;
  studioSlug: string | null;
  weddingSlug: string | null;
  currentStudio: BackendStudio | null;
  currentWedding: BackendWedding | null;
  loading: boolean;
  error: string | null;
  setAdminSession: (payload: AdminSessionPayload) => void;
  setGallerySession: (payload: GallerySessionPayload) => void;
  setCurrentStudio: (studio: BackendStudio | null) => void;
  setCurrentWedding: (wedding: BackendWedding | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSession: () => void;
}

const initialState = {
  mode: null,
  studioJwt: null,
  galleryToken: null,
  guestIdentityToken: null,
  studioSlug: null,
  weddingSlug: null,
  currentStudio: null,
  currentWedding: null,
  loading: false,
  error: null,
} satisfies Pick<
  SessionStore,
  | 'mode'
  | 'studioJwt'
  | 'galleryToken'
  | 'guestIdentityToken'
  | 'studioSlug'
  | 'weddingSlug'
  | 'currentStudio'
  | 'currentWedding'
  | 'loading'
  | 'error'
>;

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAdminSession: ({ studioJwt, studioSlug }) =>
        set({
          mode: 'admin',
          studioJwt,
          studioSlug: studioSlug ?? null,
          galleryToken: null,
          guestIdentityToken: null,
          error: null,
        }),

      setGallerySession: ({ galleryToken, guestIdentityToken, studioSlug, weddingSlug }) =>
        set({
          mode: 'guest',
          galleryToken,
          guestIdentityToken: guestIdentityToken ?? null,
          studioSlug,
          weddingSlug,
          studioJwt: null,
          error: null,
        }),

      setCurrentStudio: (currentStudio) =>
        set({
          currentStudio,
          studioSlug: currentStudio?.slug ?? null,
        }),
      setCurrentWedding: (currentWedding) => set({ currentWedding }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearSession: () => set({ ...initialState }),
    }),
    { name: 'gallery-session' }
  )
);
