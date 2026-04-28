import { apiRequest } from './client';
import type {
  ApiEnvelope,
  BackendGalleryPhoto,
  BackendPrintSelectionBucket,
} from './types';

interface PrintSelectionBucketInput {
  name: string;
  selection_limit: number;
}

export function fetchAdminPrintSelectionBuckets(token: string, weddingSlug: string) {
  return apiRequest<ApiEnvelope<BackendPrintSelectionBucket[]>>(
    `/api/v1/weddings/${weddingSlug}/print_selection_buckets`,
    {
      method: 'GET',
      token,
    }
  );
}

export function createAdminPrintSelectionBucket(
  token: string,
  weddingSlug: string,
  bucket: PrintSelectionBucketInput
) {
  return apiRequest<ApiEnvelope<BackendPrintSelectionBucket>>(
    `/api/v1/weddings/${weddingSlug}/print_selection_buckets`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({ print_selection_bucket: bucket }),
    }
  );
}

export function fetchAdminPrintSelectionBucket(
  token: string,
  weddingSlug: string,
  bucketSlug: string
) {
  return apiRequest<ApiEnvelope<BackendPrintSelectionBucket>>(
    `/api/v1/weddings/${weddingSlug}/print_selection_buckets/${bucketSlug}`,
    {
      method: 'GET',
      token,
    }
  );
}

export function updateAdminPrintSelectionBucket(
  token: string,
  weddingSlug: string,
  bucketSlug: string,
  bucket: PrintSelectionBucketInput
) {
  return apiRequest<ApiEnvelope<BackendPrintSelectionBucket>>(
    `/api/v1/weddings/${weddingSlug}/print_selection_buckets/${bucketSlug}`,
    {
      method: 'PATCH',
      token,
      body: JSON.stringify({ print_selection_bucket: bucket }),
    }
  );
}

export function deleteAdminPrintSelectionBucket(
  token: string,
  weddingSlug: string,
  bucketSlug: string
) {
  return apiRequest<ApiEnvelope<{ deleted: boolean }>>(
    `/api/v1/weddings/${weddingSlug}/print_selection_buckets/${bucketSlug}`,
    {
      method: 'DELETE',
      token,
    }
  );
}

export function fetchAdminPrintSelectionBucketPhotos(
  token: string,
  weddingSlug: string,
  bucketSlug: string
) {
  return apiRequest<ApiEnvelope<BackendGalleryPhoto[]>>(
    `/api/v1/weddings/${weddingSlug}/print_selection_buckets/${bucketSlug}/photos`,
    {
      method: 'GET',
      token,
    }
  );
}

export function lockAdminPrintSelectionBucket(
  token: string,
  weddingSlug: string,
  bucketSlug: string
) {
  return apiRequest<ApiEnvelope<BackendPrintSelectionBucket>>(
    `/api/v1/weddings/${weddingSlug}/print_selection_buckets/${bucketSlug}/lock`,
    {
      method: 'POST',
      token,
    }
  );
}

export function unlockAdminPrintSelectionBucket(
  token: string,
  weddingSlug: string,
  bucketSlug: string
) {
  return apiRequest<ApiEnvelope<BackendPrintSelectionBucket>>(
    `/api/v1/weddings/${weddingSlug}/print_selection_buckets/${bucketSlug}/lock`,
    {
      method: 'DELETE',
      token,
    }
  );
}

export function fetchGuestPrintSelectionBuckets(
  studioSlug: string,
  weddingSlug: string,
  galleryToken: string
) {
  return apiRequest<ApiEnvelope<BackendPrintSelectionBucket[]>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/print_selection_buckets`,
    {
      method: 'GET',
      galleryToken,
    }
  );
}

export function fetchGuestPrintSelectionBucket(
  studioSlug: string,
  weddingSlug: string,
  bucketSlug: string,
  galleryToken: string
) {
  return apiRequest<ApiEnvelope<BackendPrintSelectionBucket>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/print_selection_buckets/${bucketSlug}`,
    {
      method: 'GET',
      galleryToken,
    }
  );
}

export function fetchGuestPrintSelectionBucketPhotos(
  studioSlug: string,
  weddingSlug: string,
  bucketSlug: string,
  galleryToken: string,
  limit = 200
) {
  return apiRequest<ApiEnvelope<BackendGalleryPhoto[]>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/print_selection_buckets/${bucketSlug}/photos?limit=${limit}`,
    {
      method: 'GET',
      galleryToken,
    }
  );
}

export function addPhotosToGuestPrintSelectionBucket(
  studioSlug: string,
  weddingSlug: string,
  bucketSlug: string,
  photoIds: string[],
  galleryToken: string
) {
  return apiRequest<ApiEnvelope<BackendPrintSelectionBucket>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/print_selection_buckets/${bucketSlug}/photos`,
    {
      method: 'POST',
      galleryToken,
      body: JSON.stringify({ photo_ids: photoIds }),
    }
  );
}

export function removePhotoFromGuestPrintSelectionBucket(
  studioSlug: string,
  weddingSlug: string,
  bucketSlug: string,
  photoId: string,
  galleryToken: string
) {
  return apiRequest<ApiEnvelope<BackendPrintSelectionBucket>>(
    `/api/v1/g/${studioSlug}/${weddingSlug}/print_selection_buckets/${bucketSlug}/photos/${photoId}`,
    {
      method: 'DELETE',
      galleryToken,
    }
  );
}
