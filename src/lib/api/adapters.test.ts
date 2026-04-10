import { describe, expect, it } from 'vitest';
import {
  mapCeremonyToEvent,
  mapGalleryPhotoToPhoto,
  mapGalleryShellToStudio,
  mapGalleryShellToWedding,
} from './adapters';
import type { BackendCeremony, BackendGalleryPhoto, BackendGalleryShell } from './types';

describe('mapCeremonyToEvent', () => {
  it('maps a backend ceremony into the current event card shape', () => {
    const ceremony: BackendCeremony = {
      id: 'ceremony-1',
      slug: 'haldi',
      name: 'Haldi',
      photo_count: 24,
      cover_image_url: 'https://cdn.example.com/haldi-cover.jpg',
      scheduled_at: '2026-12-30T19:00:00Z',
    };

    expect(mapCeremonyToEvent(ceremony)).toEqual({
      id: 'haldi',
      title: 'Haldi',
      photoCount: 24,
      coverUrl: 'https://cdn.example.com/haldi-cover.jpg',
      listCoverUrl: 'https://cdn.example.com/haldi-cover.jpg',
      date: 'Dec 30, 2026',
      likes: 0,
    });
  });

  it('falls back safely when optional backend fields are absent', () => {
    const ceremony: BackendCeremony = {
      id: 'ceremony-2',
      slug: 'mehendi',
      name: 'Mehendi',
    };

    expect(mapCeremonyToEvent(ceremony)).toEqual({
      id: 'mehendi',
      title: 'Mehendi',
      photoCount: 0,
      coverUrl: '',
      listCoverUrl: '',
      date: '',
      likes: 0,
    });
  });
});

describe('mapGalleryPhotoToPhoto', () => {
  it('maps backend gallery photos into the current viewer photo shape', () => {
    const photo: BackendGalleryPhoto = {
      id: 'photo-1',
      ceremony_slug: 'haldi',
      original_filename: 'IMG_1001.JPG',
      preview_url: 'https://cdn.example.com/preview.jpg',
      thumbnail_url: 'https://cdn.example.com/thumb.jpg',
      captured_at: '2026-12-30T19:20:00Z',
    };

    expect(mapGalleryPhotoToPhoto(photo)).toEqual({
      id: 'photo-1',
      url: 'https://cdn.example.com/preview.jpg',
      thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
      alt: 'IMG_1001.JPG',
      event: 'haldi',
      date: 'Dec 30, 2026',
      people: [],
      isHighlight: false,
    });
  });

  it('uses available fallbacks when preview assets are missing', () => {
    const photo: BackendGalleryPhoto = {
      id: 'photo-2',
      ceremony_slug: 'reception',
      original_filename: 'IMG_2002.JPG',
      full_url: 'https://cdn.example.com/full.jpg',
      thumbnail_url: 'https://cdn.example.com/thumb.jpg',
    };

    expect(mapGalleryPhotoToPhoto(photo)).toEqual({
      id: 'photo-2',
      url: 'https://cdn.example.com/full.jpg',
      thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
      alt: 'IMG_2002.JPG',
      event: 'reception',
      date: '',
      people: [],
      isHighlight: false,
    });
  });
});

describe('mapGalleryShell adapters', () => {
  it('maps the backend gallery shell into session studio and wedding state', () => {
    const shell: BackendGalleryShell = {
      couple_name: 'Umesh & Shruti',
      wedding_date: '2026-02-10',
      hero_image_url: null,
      allow_download: 'all',
      allow_comments: true,
      branding: {
        slug: 'mppf-photography',
        studio_name: 'MPPF Photography',
        color_primary: '#c9506a',
        color_accent: '#c9506a',
      },
    };

    expect(mapGalleryShellToStudio(shell).studio_name).toBe('MPPF Photography');
    expect(mapGalleryShellToWedding(shell, 'umesh-and-shruti').slug).toBe('umesh-and-shruti');
  });
});
