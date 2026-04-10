import { apiRequest } from './client';
import type { ApiEnvelope, BackendAlbum, BackendGalleryPhoto } from './types';

export function fetchSharedAlbum(token: string) {
  return apiRequest<ApiEnvelope<Record<string, unknown>>>(`/api/v1/g/albums/shared/${token}`, {
    method: 'GET',
  });
}

export function fetchGalleryAlbums(
  studioSlug: string,
  weddingSlug: string,
  ceremonySlug: string,
  galleryToken: string
) {
  return apiRequest<ApiEnvelope<BackendAlbum[]>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/ceremonies/${ceremonySlug}/albums`,
    {
      method: 'GET',
      galleryToken,
    }
  );
}

export function fetchGalleryAlbum(
  studioSlug: string,
  weddingSlug: string,
  ceremonySlug: string,
  albumIdOrSlug: string,
  galleryToken: string
) {
  return apiRequest<ApiEnvelope<BackendAlbum>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/ceremonies/${ceremonySlug}/albums/${albumIdOrSlug}`,
    {
      method: 'GET',
      galleryToken,
    }
  );
}

export function fetchGalleryAlbumPhotos(
  studioSlug: string,
  weddingSlug: string,
  ceremonySlug: string,
  albumIdOrSlug: string,
  galleryToken: string,
  limit = 100
) {
  return apiRequest<ApiEnvelope<BackendGalleryPhoto[]>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/ceremonies/${ceremonySlug}/albums/${albumIdOrSlug}/photos?limit=${limit}`,
    {
      method: 'GET',
      galleryToken,
    }
  );
}

export function createGalleryAlbum(
  studioSlug: string,
  weddingSlug: string,
  ceremonySlug: string,
  galleryToken: string,
  album: { name: string; description?: string; album_type: 'user_created' }
) {
  return apiRequest<ApiEnvelope<BackendAlbum>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/ceremonies/${ceremonySlug}/albums`,
    {
      method: 'POST',
      galleryToken,
      body: JSON.stringify({ album }),
    }
  );
}

export function addPhotosToGalleryAlbum(
  studioSlug: string,
  weddingSlug: string,
  ceremonySlug: string,
  albumSlug: string,
  galleryToken: string,
  photoIds: string[]
) {
  return apiRequest<ApiEnvelope<BackendAlbum>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/ceremonies/${ceremonySlug}/albums/${albumSlug}/photos`,
    {
      method: 'POST',
      galleryToken,
      body: JSON.stringify({ photo_ids: photoIds }),
    }
  );
}

export function removePhotoFromGalleryAlbum(
  studioSlug: string,
  weddingSlug: string,
  ceremonySlug: string,
  albumSlug: string,
  photoId: string,
  galleryToken: string
) {
  return apiRequest<ApiEnvelope<BackendAlbum>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/ceremonies/${ceremonySlug}/albums/${albumSlug}/photos/${photoId}`,
    {
      method: 'DELETE',
      galleryToken,
    }
  );
}
