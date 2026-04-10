const DEFAULT_API_BASE_URL = 'http://127.0.0.1:3000';
const DEFAULT_GALLERY_STUDIO_SLUG = 'mppf-photography';
const DEFAULT_GALLERY_WEDDING_SLUG = 'umesh-and-shruti';

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
}

export function getDefaultGalleryStudioSlug() {
  return (import.meta.env.VITE_GALLERY_STUDIO_SLUG || DEFAULT_GALLERY_STUDIO_SLUG).trim();
}

export function getDefaultGalleryWeddingSlug() {
  return (import.meta.env.VITE_GALLERY_WEDDING_SLUG || DEFAULT_GALLERY_WEDDING_SLUG).trim();
}
