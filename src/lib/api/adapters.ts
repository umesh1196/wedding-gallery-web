import type { Event, Photo } from '../data';
import type {
  BackendCeremony,
  BackendGalleryPhoto,
  BackendGalleryShell,
  BackendStudio,
  BackendWedding,
} from './types';

function formatDate(dateValue?: string | null) {
  if (!dateValue) return '';

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

export function mapCeremonyToEvent(ceremony: BackendCeremony): Event {
  const coverUrl = ceremony.cover_image_url || '';

  return {
    id: ceremony.slug,
    title: ceremony.name,
    photoCount: ceremony.photo_count ?? 0,
    coverUrl,
    listCoverUrl: coverUrl,
    date: formatDate(ceremony.scheduled_at),
    likes: 0,
  };
}

export function mapGalleryPhotoToPhoto(photo: BackendGalleryPhoto): Photo {
  const url = photo.preview_url || photo.full_url || photo.thumbnail_url || '';
  const ceremonySlug = photo.ceremony_slug || 'gallery';
  const fallbackLabel = photo.original_filename || `Photo ${photo.id}`;

  return {
    id: photo.id,
    url,
    thumbnailUrl: photo.thumbnail_url || url,
    alt: fallbackLabel,
    event: ceremonySlug,
    date: formatDate(photo.captured_at),
    people: [],
    isHighlight: false,
  };
}

export function mapGalleryShellToStudio(shell: BackendGalleryShell): BackendStudio {
  return {
    id: 'guest-studio',
    studio_name: shell.branding.studio_name,
    slug: shell.branding.slug,
    logo_url: shell.branding.logo_url,
    watermark_url: shell.branding.watermark_url,
    color_primary: shell.branding.color_primary,
    color_accent: shell.branding.color_accent,
    font_heading: shell.branding.font_heading,
    font_body: shell.branding.font_body,
  };
}

export function mapGalleryShellToWedding(
  shell: BackendGalleryShell,
  weddingSlug: string
): BackendWedding {
  return {
    id: weddingSlug,
    slug: weddingSlug,
    couple_name: shell.couple_name,
    wedding_date: shell.wedding_date,
    allow_download: shell.allow_download,
    allow_comments: shell.allow_comments,
    hero_image_url: shell.hero_image_url,
    expired: false,
  };
}
