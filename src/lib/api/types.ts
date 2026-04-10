export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code?: string;
  };
  meta?: Record<string, unknown>;
}

export interface BackendStudio {
  id: string;
  studio_name: string;
  slug: string;
  logo_url?: string | null;
  watermark_url?: string | null;
  color_primary?: string | null;
  color_accent?: string | null;
  font_heading?: string | null;
  font_body?: string | null;
}

export interface BackendWedding {
  id: string;
  slug: string;
  couple_name: string;
  wedding_date?: string | null;
  allow_download?: string | null;
  allow_comments?: boolean | null;
  hero_image_url?: string | null;
  expired?: boolean;
}

export interface BackendCeremony {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  scheduled_at?: string | null;
  photo_count?: number | null;
  cover_image_url?: string | null;
  cover_image_key?: string | null;
  sort_order?: number | null;
}

export interface BackendGalleryPhoto {
  id: string;
  ceremony_slug?: string;
  original_filename?: string;
  preview_url?: string | null;
  thumbnail_url?: string | null;
  full_url?: string | null;
  download_url?: string | null;
  captured_at?: string | null;
  width?: number | null;
  height?: number | null;
  comment_count?: number | null;
  is_liked?: boolean;
  is_shortlisted?: boolean;
}

export interface BackendGalleryPhotoState {
  id: string;
  liked: boolean;
  shortlisted: boolean;
}

export interface BackendComment {
  id: string;
  body: string;
  visitor_name?: string | null;
  created_at: string;
}

export interface BackendAlbum {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  album_type: string;
  visibility?: string | null;
  photos_count: number;
  cover_photo_id?: string | null;
}

export interface BackendGalleryBranding {
  slug: string;
  studio_name: string;
  color_primary?: string | null;
  color_accent?: string | null;
  font_heading?: string | null;
  font_body?: string | null;
  logo_url?: string | null;
  watermark_url?: string | null;
  watermark_opacity?: string | number | null;
}

export interface BackendGalleryShell {
  couple_name: string;
  wedding_date?: string | null;
  hero_image_url?: string | null;
  allow_download?: string | null;
  allow_comments?: boolean | null;
  branding: BackendGalleryBranding;
}

export interface BackendAdminPhoto {
  id: string;
  original_filename: string;
  is_cover?: boolean | null;
  processing_status?: string | null;
  ingestion_status?: string | null;
  thumbnail_url?: string | null;
  preview_url?: string | null;
  full_url?: string | null;
  original_url?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface BackendPhotoPresignItem {
  photo_id: string;
  presigned_url: string;
  object_key?: string;
}

export interface BackendGalleryVerifyResponse {
  session_token: string;
  guest_identity_token?: string | null;
  gallery: BackendGalleryShell;
}
