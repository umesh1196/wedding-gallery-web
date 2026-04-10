import { apiRequest } from './client';
import type {
  ApiEnvelope,
  BackendAdminPhoto,
  BackendCeremony,
  BackendPhotoPresignItem,
  BackendWedding,
  BackendStudio,
} from './types';

interface StudioAuthPayload {
  studio: BackendStudio;
  token: string;
}

interface UpdateStudioInput {
  studio_name: string;
  slug: string;
  color_primary?: string;
  color_accent?: string;
}

interface CreateWeddingInput {
  couple_name: string;
  wedding_date: string;
  password?: string;
  expires_at?: string;
  allow_download: string;
  allow_comments: boolean;
}

interface CreateCeremonyInput {
  name: string;
  scheduled_at?: string;
  description?: string;
}

interface PhotoUploadInput {
  filename: string;
  content_type: string;
  byte_size: number;
}

interface CeremonyCoverUploadResult {
  key: string;
  url: string;
}

export function loginStudio(email: string, password: string) {
  return apiRequest<ApiEnvelope<StudioAuthPayload>>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      studio: { email, password },
    }),
  });
}

export function signupStudio(email: string, password: string, studioName: string) {
  return apiRequest<ApiEnvelope<StudioAuthPayload>>('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      studio: {
        email,
        password,
        studio_name: studioName,
      },
    }),
  });
}

export function fetchCurrentStudio(token: string) {
  return apiRequest<ApiEnvelope<{ studio: BackendStudio }>>('/api/v1/auth/me', {
    method: 'GET',
    token,
  });
}

export function updateStudio(token: string, studio: UpdateStudioInput) {
  return apiRequest<ApiEnvelope<{ studio: BackendStudio }>>('/api/v1/studio', {
    method: 'PATCH',
    token,
    body: JSON.stringify({ studio }),
  });
}

export function fetchWeddings(token: string) {
  return apiRequest<ApiEnvelope<BackendWedding[]>>('/api/v1/weddings', {
    method: 'GET',
    token,
  });
}

export function createWedding(token: string, wedding: CreateWeddingInput) {
  return apiRequest<ApiEnvelope<BackendWedding>>('/api/v1/weddings', {
    method: 'POST',
    token,
    body: JSON.stringify({ wedding }),
  });
}

export function fetchWedding(token: string, weddingSlug: string) {
  return apiRequest<ApiEnvelope<BackendWedding>>(`/api/v1/weddings/${weddingSlug}`, {
    method: 'GET',
    token,
  });
}

export function updateWedding(
  token: string,
  weddingSlug: string,
  wedding: CreateWeddingInput
) {
  return apiRequest<ApiEnvelope<BackendWedding>>(`/api/v1/weddings/${weddingSlug}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ wedding }),
  });
}

export function fetchCeremonies(token: string, weddingSlug: string) {
  return apiRequest<ApiEnvelope<BackendCeremony[]>>(`/api/v1/weddings/${weddingSlug}/ceremonies`, {
    method: 'GET',
    token,
  });
}

export function createCeremony(token: string, weddingSlug: string, ceremony: CreateCeremonyInput) {
  return apiRequest<ApiEnvelope<BackendCeremony>>(`/api/v1/weddings/${weddingSlug}/ceremonies`, {
    method: 'POST',
    token,
    body: JSON.stringify({ ceremony }),
  });
}

export function fetchCeremony(token: string, weddingSlug: string, ceremonySlug: string) {
  return apiRequest<ApiEnvelope<BackendCeremony>>(
    `/api/v1/weddings/${weddingSlug}/ceremonies/${ceremonySlug}`,
    {
      method: 'GET',
      token,
    }
  );
}

export function updateCeremony(
  token: string,
  weddingSlug: string,
  ceremonySlug: string,
  ceremony: CreateCeremonyInput
) {
  return apiRequest<ApiEnvelope<BackendCeremony>>(
    `/api/v1/weddings/${weddingSlug}/ceremonies/${ceremonySlug}`,
    {
      method: 'PATCH',
      token,
      body: JSON.stringify({ ceremony }),
    }
  );
}

export function deleteCeremony(token: string, weddingSlug: string, ceremonySlug: string) {
  return apiRequest<ApiEnvelope<{ deleted: boolean }>>(
    `/api/v1/weddings/${weddingSlug}/ceremonies/${ceremonySlug}`,
    {
      method: 'DELETE',
      token,
    }
  );
}

export function uploadCeremonyCover(token: string, weddingSlug: string, ceremonySlug: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<ApiEnvelope<CeremonyCoverUploadResult>>(
    `/api/v1/weddings/${weddingSlug}/ceremonies/${ceremonySlug}/cover`,
    {
      method: 'POST',
      token,
      body: formData,
    }
  );
}

export function reorderCeremonies(token: string, weddingSlug: string, order: string[]) {
  return apiRequest<ApiEnvelope<{ ceremonies?: BackendCeremony[] }>>(
    `/api/v1/weddings/${weddingSlug}/ceremonies/reorder`,
    {
      method: 'PATCH',
      token,
      body: JSON.stringify({ order }),
    }
  );
}

export function fetchPhotos(token: string, weddingSlug: string, ceremonySlug: string) {
  return apiRequest<ApiEnvelope<BackendAdminPhoto[]>>(
    `/api/v1/weddings/${weddingSlug}/ceremonies/${ceremonySlug}/photos`,
    {
      method: 'GET',
      token,
    }
  );
}

export function reorderPhotos(token: string, weddingSlug: string, ceremonySlug: string, order: string[]) {
  return apiRequest<ApiEnvelope<BackendAdminPhoto[]>>(
    `/api/v1/weddings/${weddingSlug}/ceremonies/${ceremonySlug}/photos/reorder`,
    {
      method: 'PATCH',
      token,
      body: JSON.stringify({ order }),
    }
  );
}

export function presignPhotoUploads(
  token: string,
  weddingSlug: string,
  ceremonySlug: string,
  files: PhotoUploadInput[]
) {
  return apiRequest<ApiEnvelope<BackendPhotoPresignItem[]>>(
    `/api/v1/weddings/${weddingSlug}/ceremonies/${ceremonySlug}/photos/presign`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({ files }),
    }
  );
}

export function confirmPhotoUpload(token: string, photoId: string) {
  return apiRequest<ApiEnvelope<BackendAdminPhoto>>(`/api/v1/photos/${photoId}/confirm`, {
    method: 'POST',
    token,
  });
}

export function retryPhotoImport(token: string, photoId: string) {
  return apiRequest<ApiEnvelope<BackendAdminPhoto>>(`/api/v1/photos/${photoId}/retry_import`, {
    method: 'POST',
    token,
  });
}

export function retryPhotoProcessing(token: string, photoId: string) {
  return apiRequest<ApiEnvelope<BackendAdminPhoto>>(`/api/v1/photos/${photoId}/retry_processing`, {
    method: 'POST',
    token,
  });
}

export function setPhotoCover(token: string, photoId: string) {
  return apiRequest<ApiEnvelope<BackendAdminPhoto>>(`/api/v1/photos/${photoId}/set_cover`, {
    method: 'POST',
    token,
  });
}

export function deletePhoto(token: string, photoId: string) {
  return apiRequest<ApiEnvelope<{ id: string; deleted: boolean }>>(`/api/v1/photos/${photoId}`, {
    method: 'DELETE',
    token,
  });
}
