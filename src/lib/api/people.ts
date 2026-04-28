import { apiRequest } from './client';
import type { ApiEnvelope, BackendPerson, BackendGalleryPhoto, BackendFaceSearchResult } from './types';

export function fetchPeople(studioSlug: string, weddingSlug: string, galleryToken: string) {
  return apiRequest<ApiEnvelope<BackendPerson[]>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/people`,
    { method: 'GET', galleryToken }
  );
}

export function fetchPersonPhotos(
  studioSlug: string,
  weddingSlug: string,
  personId: string,
  galleryToken: string
) {
  return apiRequest<ApiEnvelope<BackendGalleryPhoto[]>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/people/${personId}/photos`,
    { method: 'GET', galleryToken }
  );
}

export function searchFaces(
  studioSlug: string,
  weddingSlug: string,
  selfieFile: File,
  galleryToken: string
) {
  const formData = new FormData();
  formData.append('selfie', selfieFile);

  return apiRequest<ApiEnvelope<BackendFaceSearchResult>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/face-search`,
    { method: 'POST', body: formData, galleryToken }
  );
}
