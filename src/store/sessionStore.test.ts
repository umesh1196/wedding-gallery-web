import { beforeEach, describe, expect, it } from 'vitest';
import { useSessionStore } from './sessionStore';

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({
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
    });
  });

  it('stores admin auth state separately from guest auth state', () => {
    useSessionStore.getState().setAdminSession({
      studioJwt: 'studio-jwt',
      studioSlug: 'my-studio',
    });

    expect(useSessionStore.getState()).toMatchObject({
      mode: 'admin',
      studioJwt: 'studio-jwt',
      studioSlug: 'my-studio',
      galleryToken: null,
      guestIdentityToken: null,
    });
  });

  it('stores current studio metadata after bootstrap', () => {
    useSessionStore.getState().setCurrentStudio({
      id: 'studio-1',
      studio_name: 'My Studio',
      slug: 'my-studio',
    });

    expect(useSessionStore.getState().currentStudio).toEqual({
      id: 'studio-1',
      studio_name: 'My Studio',
      slug: 'my-studio',
    });
  });

  it('stores guest gallery session state', () => {
    useSessionStore.getState().setGallerySession({
      galleryToken: 'gallery-token',
      guestIdentityToken: 'guest-identity-token',
      studioSlug: 'real-photo-studio',
      weddingSlug: 'real-photo-couple',
    });

    expect(useSessionStore.getState()).toMatchObject({
      mode: 'guest',
      galleryToken: 'gallery-token',
      guestIdentityToken: 'guest-identity-token',
      studioSlug: 'real-photo-studio',
      weddingSlug: 'real-photo-couple',
    });
  });

  it('clears all session state together', () => {
    useSessionStore.getState().setGallerySession({
      galleryToken: 'gallery-token',
      guestIdentityToken: 'guest-identity-token',
      studioSlug: 'studio',
      weddingSlug: 'wedding',
    });

    useSessionStore.getState().clearSession();

    expect(useSessionStore.getState()).toMatchObject({
      mode: null,
      studioJwt: null,
      galleryToken: null,
      guestIdentityToken: null,
      studioSlug: null,
      weddingSlug: null,
      error: null,
    });
  });
});
