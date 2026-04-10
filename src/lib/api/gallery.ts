import { apiRequest } from './client';
import type {
  ApiEnvelope,
  BackendCeremony,
  BackendGalleryShell,
  BackendGalleryPhoto,
  BackendGalleryVerifyResponse,
} from './types';

export function verifyGalleryAccess(
  studioSlug: string,
  weddingSlug: string,
  password: string,
  visitorName?: string,
  guestIdentityToken?: string
) {
  return apiRequest<ApiEnvelope<BackendGalleryVerifyResponse>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/verify`,
    {
      method: 'POST',
      body: JSON.stringify({
        password,
        ...(visitorName ? { visitor_name: visitorName } : {}),
        ...(guestIdentityToken ? { guest_identity_token: guestIdentityToken } : {}),
      }),
    }
  );
}

export function fetchGalleryBootstrap(studioSlug: string, weddingSlug: string, galleryToken: string) {
  return apiRequest<ApiEnvelope<BackendGalleryShell>>(`/api/v1/g/${studioSlug}/${weddingSlug}`, {
    method: 'GET',
    galleryToken,
  });
}

export function fetchGalleryCeremonies(studioSlug: string, weddingSlug: string, galleryToken: string) {
  return apiRequest<ApiEnvelope<BackendCeremony[]>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/ceremonies`,
    {
      method: 'GET',
      galleryToken,
    }
  );
}

export function fetchGalleryPhotos(
  studioSlug: string,
  weddingSlug: string,
  ceremonySlug: string,
  galleryToken: string,
  limit = 20,
  cursor?: string
) {
  const search = new URLSearchParams({ limit: String(limit) });
  if (cursor) search.set('cursor', cursor);

  return apiRequest<ApiEnvelope<BackendGalleryPhoto[]>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/ceremonies/${ceremonySlug}/photos?${search.toString()}`,
    {
      method: 'GET',
      galleryToken,
    }
  );
}
