import { apiRequest } from './client';
import type { ApiEnvelope } from './types';

export interface DownloadPhotoPayload {
  download_url: string;
  filename: string;
  expires_at: string;
}

export interface DownloadRequestPayload {
  id: string;
  scope_type: string;
  status: string;
  filename: string;
  completed_at?: string | null;
  expires_at?: string | null;
  error_message?: string | null;
  download_url?: string | null;
}

export function fetchPhotoDownload(
  studioSlug: string,
  weddingSlug: string,
  photoId: string,
  galleryToken: string
) {
  return apiRequest<ApiEnvelope<DownloadPhotoPayload>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/photos/${photoId}/download`,
    {
      method: 'GET',
      galleryToken,
    }
  );
}

export function createDownloadRequest(
  studioSlug: string,
  weddingSlug: string,
  galleryToken: string,
  payload: { type: string; ceremony_slug?: string; photo_ids?: string[] }
) {
  return apiRequest<ApiEnvelope<DownloadRequestPayload>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/downloads`,
    {
      method: 'POST',
      galleryToken,
      body: JSON.stringify(payload),
    }
  );
}

export function fetchDownloadRequest(
  studioSlug: string,
  weddingSlug: string,
  requestId: string,
  galleryToken: string
) {
  return apiRequest<ApiEnvelope<DownloadRequestPayload>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/downloads/${requestId}`,
    {
      method: 'GET',
      galleryToken,
    }
  );
}
