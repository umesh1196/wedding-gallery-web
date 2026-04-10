import { apiRequest } from './client';
import type {
  ApiEnvelope,
  BackendComment,
  BackendGalleryPhoto,
  BackendGalleryPhotoState,
} from './types';

export function likePhoto(
  studioSlug: string,
  weddingSlug: string,
  photoId: string,
  galleryToken: string
) {
  return apiRequest<ApiEnvelope<BackendGalleryPhotoState>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/photos/${photoId}/like`,
    {
      method: 'POST',
      galleryToken,
    }
  );
}

export function unlikePhoto(
  studioSlug: string,
  weddingSlug: string,
  photoId: string,
  galleryToken: string
) {
  return apiRequest<ApiEnvelope<BackendGalleryPhotoState>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/photos/${photoId}/like`,
    {
      method: 'DELETE',
      galleryToken,
    }
  );
}

export function fetchLikedPhotos(studioSlug: string, weddingSlug: string, galleryToken: string) {
  return apiRequest<ApiEnvelope<BackendGalleryPhoto[]>>(`/api/v1/g/${studioSlug}/${weddingSlug}/likes`, {
    method: 'GET',
    galleryToken,
  });
}

export function fetchPhotoComments(
  studioSlug: string,
  weddingSlug: string,
  photoId: string,
  galleryToken: string,
  limit = 20
) {
  return apiRequest<ApiEnvelope<BackendComment[]>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/photos/${photoId}/comments?limit=${limit}`,
    {
      method: 'GET',
      galleryToken,
    }
  );
}

export function createPhotoComment(
  studioSlug: string,
  weddingSlug: string,
  photoId: string,
  galleryToken: string,
  body: string
) {
  return apiRequest<ApiEnvelope<BackendComment>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/photos/${photoId}/comments`,
    {
      method: 'POST',
      galleryToken,
      body: JSON.stringify({
        comment: { body },
      }),
    }
  );
}

export function deletePhotoComment(
  studioSlug: string,
  weddingSlug: string,
  commentId: string,
  galleryToken: string
) {
  return apiRequest<ApiEnvelope<{ id: string; deleted: boolean }>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/comments/${commentId}`,
    {
      method: 'DELETE',
      galleryToken,
    }
  );
}

export function fetchShortlist(studioSlug: string, weddingSlug: string, galleryToken: string) {
  return apiRequest<ApiEnvelope<Record<string, unknown>>>(`/api/v1/g/${studioSlug}/${weddingSlug}/shortlist`, {
    method: 'GET',
    galleryToken,
  });
}
