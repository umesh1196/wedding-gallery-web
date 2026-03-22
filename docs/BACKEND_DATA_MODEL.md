# Wedding Gallery Backend Data Model

## Purpose

This document defines the high-level backend data model for the wedding gallery product.

The model is split into three categories:

- studio-owned catalog data
- user-owned personal data
- system and platform data

The key principle is that the wedding gallery itself is shared and curated by the studio, while saved photos and personal albums belong to the individual viewer.

## Core Catalog Entities

### Wedding

Top-level container for a single client gallery.

Suggested fields:

- `id`
- `slug`
- `title`
- `couple_names`
- `cover_photo_id`
- `wedding_date_range`
- `status`
- `studio_note`
- `last_published_at`

Owns:

- events
- people
- memberships
- studio albums

### Event

A chapter within a wedding.

Suggested fields:

- `id`
- `wedding_id`
- `slug`
- `title`
- `subtitle`
- `mood_label`
- `event_date`
- `cover_photo_id`
- `sort_order`
- `publish_state`
- `published_at`

Owns:

- photos
- event-scoped studio albums
- event-level editorial metadata

### Photo

The canonical record for a single image.

Suggested fields:

- `id`
- `wedding_id`
- `event_id`
- `storage_key_original`
- `storage_key_viewer`
- `storage_key_grid`
- `storage_key_thumb`
- `caption`
- `alt_text`
- `taken_at`
- `sort_order`
- `width`
- `height`
- `orientation`
- `is_highlight`
- `publish_state`
- `uploaded_by`

Important note:

Media URLs should be derived from storage and CDN configuration, not treated as the main source of truth.

### StudioAlbum

A curated album created by the studio.

Suggested fields:

- `id`
- `wedding_id`
- `event_id` nullable
- `title`
- `description`
- `cover_photo_id`
- `sort_order`
- `publish_state`
- `created_by`

Join entity:

`studio_album_photos`

- `studio_album_id`
- `photo_id`
- `sort_order`

### Person

A person or named group used for people-based browsing.

Suggested fields:

- `id`
- `wedding_id`
- `display_name`
- `avatar_photo_id`
- `sort_order`
- `source`
- `is_visible`

Join entity:

`photo_people`

- `photo_id`
- `person_id`
- optional confidence or provenance fields for future recognition workflows

## User And Access Entities

### User

A viewer or a studio team member.

Suggested fields:

- `id`
- `email`
- `name`
- `role`
- `created_at`

### WeddingMembership

Connects a user to a wedding.

Suggested fields:

- `id`
- `wedding_id`
- `user_id`
- `access_role`
- `invited_by`
- `created_at`

### Session / Auth Token

Implementation-specific, but conceptually required for:

- magic links
- invite redemption
- session tracking

## Personal Data Entities

### SavedPhoto

A per-user saved relationship for a shared photo.

Suggested fields:

- `user_id`
- `wedding_id`
- `photo_id`
- `created_at`

Constraint:

- unique on `user_id + photo_id`

### PersonalAlbum

A private album created by a viewer.

Suggested fields:

- `id`
- `user_id`
- `wedding_id`
- `event_id` nullable
- `title`
- `cover_photo_id` nullable
- `created_at`
- `updated_at`

Join entity:

`personal_album_photos`

- `personal_album_id`
- `photo_id`
- `sort_order`
- `added_at`

Key rule:

Personal albums belong to one user, even though the underlying photos come from the shared wedding gallery.

## Sharing Entities

### ShareLink

Represents explicit, revocable sharing.

Suggested fields:

- `id`
- `wedding_id`
- `created_by_user_id`
- `resource_type`
- `resource_id`
- `token`
- `expires_at`
- `access_mode`
- `created_at`

This supports sharing for:

- personal albums
- studio albums
- whole-gallery access later if needed

## Media And Processing Entities

### MediaAsset

Optional but recommended if you want clean tracking of media lifecycle by variant.

Suggested fields:

- `id`
- `photo_id`
- `variant`
- `storage_key`
- `mime_type`
- `width`
- `height`
- `file_size`
- `created_at`

### ProcessingJob

Tracks background work related to ingestion and delivery.

Suggested fields:

- `id`
- `wedding_id`
- `photo_id` nullable
- `job_type`
- `status`
- `payload`
- `error_message`
- `created_at`
- `completed_at`

## Relationship Summary

The most important relationships are:

- one `Wedding` has many `Event`
- one `Event` has many `Photo`
- one `Wedding` has many `Person`
- many `Photo` can map to many `Person`
- one `Wedding` has many `StudioAlbum`
- one `StudioAlbum` has many `Photo`
- one `User` can save many `Photo`
- one `User` can create many `PersonalAlbum`
- one `PersonalAlbum` has many `Photo`
- one `Wedding` has many `WeddingMembership`

## Mapping From Current Frontend

Current frontend data maps like this:

- `EVENTS` in [src/lib/data.ts](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/lib/data.ts) map to `Wedding` and `Event`
- `PHOTOS` in [src/lib/data.ts](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/lib/data.ts) map to `Photo`
- static albums in [src/lib/data.ts](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/lib/data.ts) map to `StudioAlbum`
- `userAlbums` in [src/store/viewerStore.ts](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/store/viewerStore.ts) map to `PersonalAlbum`
- `favouriteIds` in [src/store/viewerStore.ts](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/store/viewerStore.ts) map to `SavedPhoto`

## Recommended V1 Defaults

- `PersonalAlbum.event_id` may be nullable, but prefer setting it when created from an event flow
- `StudioAlbum.event_id` may be nullable for wedding-wide collections
- `Person` should support manual curation first
- `Photo.publish_state` should exist from day one to support staggered delivery
- `SavedPhoto` and `PersonalAlbum` should be private to the viewer by default

## Example Validation Scenarios

- one wedding with 5 events but only 1 currently published
- one photo tagged to multiple people
- one studio album scoped to a single event
- one personal album created from saved photos
- one user saving the same photo twice without duplication
- one share link created for a personal album
- one unpublished event excluded from client gallery reads

## Related Documents

- [BACKEND_OVERVIEW.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/BACKEND_OVERVIEW.md)
- [BACKEND_MODULES.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/BACKEND_MODULES.md)
