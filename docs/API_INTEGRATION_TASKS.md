# API Integration Tasks

This checklist maps the current frontend UI to the Rails backend that now powers the wedding gallery platform. The frontend keeps the user-facing language of "chapters" and "events", while the backend uses `ceremonies`. Integration should happen through adapters so backend payloads do not leak directly into page components.

## Principles

- Keep `chapter` as the UI term and `ceremony` as the backend term.
- Centralize all HTTP logic in a shared API layer.
- Support both auth modes from the beginning:
  - studio admin via `Authorization: Bearer <jwt>`
  - guest gallery via `X-Gallery-Token: <token>`
- Replace mock data gradually instead of doing one risky full rewrite.
- Use adapters to translate backend payloads into existing frontend models.
- Ship vertical slices that stay usable after each milestone.

## Phase 1: Foundation

- [x] Create a typed API boundary in `src/lib/api/`
- [x] Add `client.ts` for shared request behavior and error normalization
- [x] Add `admin.ts` for studio-authenticated endpoints
- [x] Add `gallery.ts` for guest/gallery endpoints
- [x] Add `albums.ts` for album-specific endpoints
- [x] Add `interactions.ts` for likes, shortlist, comments, and downloads
- [x] Add `adapters.ts` to map backend payloads to frontend models
- [x] Add `types.ts` for raw backend response contracts
- [x] Add runtime config for `VITE_API_BASE_URL`
- [ ] Add a unified auth/session store that supports:
  - [x] `studioJwt`
  - [x] `galleryToken`
  - [x] `mode`
  - [x] `currentStudio`
  - [ ] `currentWedding`
  - [x] loading and error state
- [x] Add request helpers for admin and gallery token headers
- [ ] Add reusable async state handling for:
  - [ ] loading
  - [ ] empty
  - [ ] unauthorized
  - [ ] forbidden
  - [ ] expired
  - [ ] general error
- [x] Add tests for the adapter layer first

## Phase 2: Admin Flow

### Admin auth shell

- [ ] Build studio signup page integration
  - [ ] `POST /api/v1/auth/signup`
- [x] Build studio login page integration
  - [x] `POST /api/v1/auth/login`
- [x] Build session restore and admin bootstrap
  - [x] `GET /api/v1/auth/me`
- [x] Add logout flow
- [x] Add protected admin route/layout shell

### Studio config

- [x] Integrate studio settings form
  - [x] `PATCH /api/v1/studio`
- [ ] Integrate studio logo upload
  - [ ] `POST /api/v1/studio/logo`
- [ ] Integrate studio watermark upload
  - [ ] `POST /api/v1/studio/watermark`
- [ ] Replace mock branding/config usage with backend values

### Weddings

- [x] Build wedding list page
  - [x] `GET /api/v1/weddings`
- [x] Build wedding creation flow
  - [x] `POST /api/v1/weddings`
- [x] Build wedding detail/edit flow
  - [x] `GET /api/v1/weddings/:slug`
  - [x] `PATCH /api/v1/weddings/:slug`
- [ ] Build wedding archive/deactivate action
  - [ ] `DELETE /api/v1/weddings/:slug`
- [ ] Build wedding hero upload
  - [ ] `POST /api/v1/weddings/:slug/hero`

### Chapters (backend ceremonies)

- [x] Build chapter list management
  - [x] `GET /api/v1/weddings/:wedding_slug/ceremonies`
- [x] Build chapter creation
  - [x] `POST /api/v1/weddings/:wedding_slug/ceremonies`
- [x] Build chapter detail/edit
  - [x] `GET /api/v1/weddings/:wedding_slug/ceremonies/:slug`
  - [x] `PATCH /api/v1/weddings/:wedding_slug/ceremonies/:slug`
- [x] Build chapter delete
  - [x] `DELETE /api/v1/weddings/:wedding_slug/ceremonies/:slug`
- [ ] Build chapter cover upload
  - [x] `POST /api/v1/weddings/:wedding_slug/ceremonies/:slug/cover`
- [x] Build chapter reorder
  - [x] `PATCH /api/v1/weddings/:wedding_slug/ceremonies/reorder`
- [ ] Build chapter template seeding
  - [ ] `POST /api/v1/weddings/:wedding_slug/ceremonies/seed`

### Storage and photo management

- [ ] Build storage connection management UI
  - [ ] `GET /api/v1/storage_connections`
  - [ ] `POST /api/v1/storage_connections`
  - [ ] `PATCH /api/v1/storage_connections/:id`
  - [ ] `DELETE /api/v1/storage_connections/:id`
- [ ] Build upload batch status UI
  - [ ] `GET /api/v1/upload_batches/:id`
- [x] Build direct photo upload flow
  - [x] request presign URLs
  - [x] upload file directly to storage
  - [x] confirm upload
- [x] Wire direct upload API endpoints
  - [x] `POST /api/v1/weddings/:wedding_slug/ceremonies/:ceremony_slug/photos/presign`
  - [x] `POST /api/v1/photos/:id/confirm`
- [ ] Build import-from-storage flow
  - [ ] `POST /api/v1/weddings/:wedding_slug/ceremonies/:ceremony_slug/photos/import/discover`
  - [ ] `POST /api/v1/weddings/:wedding_slug/ceremonies/:ceremony_slug/photos/import`
- [x] Build chapter photo management list
  - [x] `GET /api/v1/weddings/:wedding_slug/ceremonies/:ceremony_slug/photos`
- [x] Build photo reorder
  - [x] `PATCH /api/v1/weddings/:wedding_slug/ceremonies/:ceremony_slug/photos/reorder`
- [x] Build set-cover action
  - [x] `POST /api/v1/photos/:id/set_cover`
- [ ] Build retry import and retry processing actions
  - [x] `POST /api/v1/photos/:id/retry_import`
  - [x] `POST /api/v1/photos/:id/retry_processing`
- [x] Build delete photo action
  - [x] `DELETE /api/v1/photos/:id`

### Studio review pages

- [ ] Build shortlist summary page
  - [ ] `GET /api/v1/weddings/:wedding_slug/shortlists`
- [ ] Build shortlist detail page
  - [ ] `GET /api/v1/weddings/:wedding_slug/shortlists/:id`
- [ ] Build comment review page
  - [ ] `GET /api/v1/weddings/:slug/comments`

### Studio curated albums

- [ ] Build chapter album list
  - [ ] `GET /api/v1/weddings/:wedding_slug/ceremonies/:ceremony_slug/albums`
- [ ] Build chapter album create/show/update/delete
  - [ ] `POST /api/v1/weddings/:wedding_slug/ceremonies/:ceremony_slug/albums`
  - [ ] `GET /api/v1/weddings/:wedding_slug/ceremonies/:ceremony_slug/albums/:slug`
  - [ ] `PATCH /api/v1/weddings/:wedding_slug/ceremonies/:ceremony_slug/albums/:slug`
  - [ ] `DELETE /api/v1/weddings/:wedding_slug/ceremonies/:ceremony_slug/albums/:slug`
- [ ] Build chapter album photo management
  - [ ] add photos
  - [ ] remove photos
  - [ ] reorder
  - [ ] cover
- [ ] Build studio album share link creation
  - [ ] `POST /api/v1/weddings/:wedding_slug/ceremonies/:ceremony_slug/albums/:album_slug/share_links`

## Phase 3: Guest Flow

### Gallery entry

- [x] Build gallery verify screen
  - [x] `POST /api/v1/g/:studio_slug/:wedding_slug/verify`
- [x] Store `galleryToken` after verification
- [x] Create protected gallery shell based on guest session
- [x] Build gallery bootstrap load
  - [x] `GET /api/v1/g/:studio_slug/:wedding_slug`

### Chapters and photos

- [x] Replace `EVENTS` usage in [EventsList.tsx](../src/pages/EventsList.tsx)
  - [x] wire `GET /api/v1/g/:studio_slug/:wedding_slug/ceremonies`
- [x] Map backend ceremonies to frontend chapter cards
- [x] Replace chapter photo grids with backend data
  - [x] `GET /api/v1/g/:studio_slug/:wedding_slug/ceremonies/:ceremony_slug/photos`
- [x] Add cursor-based pagination support for chapter photo feeds
- [x] Replace lightbox/photo detail data with backend photo payloads

### Shared gallery links

- [ ] Build shared gallery link redemption
  - [ ] `GET /api/v1/g/shared/:token`
- [ ] Respect shared gallery permissions in the UI

## Phase 4: Interactions

### Likes

- [x] Wire like action
  - [x] `POST /api/v1/g/:studio_slug/:wedding_slug/photos/:photo_id/like`
- [x] Wire unlike action
  - [x] `DELETE /api/v1/g/:studio_slug/:wedding_slug/photos/:photo_id/like`
- [x] Build liked-photos page/state
  - [x] `GET /api/v1/g/:studio_slug/:wedding_slug/likes`

### Shortlist

- [ ] Replace local shortlist with backend shortlist
  - [ ] `GET /api/v1/g/:studio_slug/:wedding_slug/shortlist`
  - [ ] `POST /api/v1/g/:studio_slug/:wedding_slug/shortlist/photos`
  - [ ] `DELETE /api/v1/g/:studio_slug/:wedding_slug/shortlist/photos/:photo_id`
  - [ ] `PATCH /api/v1/g/:studio_slug/:wedding_slug/shortlist/reorder`

### Comments

- [x] Build comment list UI
  - [x] `GET /api/v1/g/:studio_slug/:wedding_slug/photos/:photo_id/comments`
- [x] Build comment create UI
  - [x] `POST /api/v1/g/:studio_slug/:wedding_slug/photos/:photo_id/comments`
- [x] Build comment delete UI
  - [x] `DELETE /api/v1/g/:studio_slug/:wedding_slug/comments/:id`

### Downloads

- [x] Build single-photo download flow
  - [x] `GET /api/v1/g/:studio_slug/:wedding_slug/photos/:photo_id/download`
- [x] Build bulk download request flow
  - [x] `POST /api/v1/g/:studio_slug/:wedding_slug/downloads`
  - [x] `GET /api/v1/g/:studio_slug/:wedding_slug/downloads/:id`
- [x] Add polling UI for queued/ready download states

## Phase 5: Albums and Shared Album Access

### Guest/user albums

- [ ] Replace personal album store state with backend user albums
- [ ] Build chapter album list in [EventAlbums.tsx](../src/pages/EventAlbums.tsx)
  - [ ] `GET /api/v1/g/:studio_slug/:wedding_slug/ceremonies/:ceremony_slug/albums`
- [ ] Build user album create
  - [ ] `POST /api/v1/g/:studio_slug/:wedding_slug/ceremonies/:ceremony_slug/albums`
- [ ] Build user album show/update/delete
  - [ ] `GET /api/v1/g/:studio_slug/:wedding_slug/ceremonies/:ceremony_slug/albums/:slug`
  - [ ] `PATCH /api/v1/g/:studio_slug/:wedding_slug/ceremonies/:ceremony_slug/albums/:slug`
  - [ ] `DELETE /api/v1/g/:studio_slug/:wedding_slug/ceremonies/:ceremony_slug/albums/:slug`
- [ ] Build user album photo management
  - [ ] `POST /api/v1/g/:studio_slug/:wedding_slug/ceremonies/:ceremony_slug/albums/:album_slug/photos`
  - [ ] `DELETE /api/v1/g/:studio_slug/:wedding_slug/ceremonies/:ceremony_slug/albums/:album_slug/photos/:photo_id`
  - [ ] `PATCH /api/v1/g/:studio_slug/:wedding_slug/ceremonies/:ceremony_slug/albums/:album_slug/reorder`
  - [ ] `POST /api/v1/g/:studio_slug/:wedding_slug/ceremonies/:ceremony_slug/albums/:album_slug/cover`
- [ ] Build guest album share creation
  - [ ] `POST /api/v1/g/:studio_slug/:wedding_slug/ceremonies/:ceremony_slug/albums/:album_slug/share_links`

### Shared albums

- [ ] Build shared album shell page
  - [ ] `GET /api/v1/g/albums/shared/:token`
- [ ] Build shared album photo feed
  - [ ] `GET /api/v1/g/albums/shared/:token/photos`

### Top-level albums page

- [ ] Replace [Albums.tsx](../src/pages/Albums.tsx) mock aggregation with real grouped album data
- [ ] Build grouped chapter-to-album presentation from backend responses

## Phase 6: Cleanup and Hardening

- [ ] Remove direct page dependency on `EVENTS`, `PHOTOS`, and `ALBUMS` from `src/lib/data.ts`
- [ ] Move demo-only content into dedicated mock fixtures if still needed
- [ ] Add route-level loading, empty, unauthorized, forbidden, and expired states
- [ ] Add retry UI for failed API requests
- [ ] Add integration tests for:
  - [ ] admin login -> wedding -> chapter management
  - [ ] guest verify -> chapter list -> chapter photos
  - [ ] shortlist/comments flow
  - [ ] album create/share flow
- [ ] Add a manual smoke checklist for QA
- [ ] Document frontend/backend contract and token rules

## Recommended Delivery Order

1. Foundation
2. Admin auth + studio/wedding/chapter management
3. Guest verify + chapter/photo browsing
4. Likes, shortlist, comments, downloads
5. Albums and shared links
6. Cleanup and hardening

## Current UI Correlation Notes

- Frontend `chapter` / `event` corresponds to backend `ceremony`
- [EventsList.tsx](../src/pages/EventsList.tsx) maps to public ceremony listing
- [EventAlbums.tsx](../src/pages/EventAlbums.tsx) maps to chapter-level album APIs
- [Albums.tsx](../src/pages/Albums.tsx) maps to grouped album aggregation across ceremonies
- [src/lib/data.ts](../src/lib/data.ts) is the main mock-data replacement boundary
