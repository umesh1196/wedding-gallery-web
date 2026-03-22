# Wedding Gallery MVP Backend Phases

## Purpose

This document converts the backend MVP strategy into a practical implementation sequence.

The goal is to build the backend in stages that create user value early, reduce delivery risk, and keep the team focused on the most important production needs first.

## Guiding Principle

The MVP backend should not attempt to solve every future gallery-platform problem.

It should first make the current product production-capable by replacing:

- mock gallery data
- local-only persistence
- uncontrolled sharing
- weak download behavior

with reliable backend-backed workflows.

## Phase 1: Backend Foundation

### Goal

Create the minimum shared backend foundation needed for production.

### Scope

- backend application setup
- Postgres database setup
- object storage integration
- base auth/session plumbing
- core wedding, event, photo, and album data models
- environment and deployment setup

### Deliverables

- one backend API service
- one Postgres database
- one object storage bucket layout
- one migration system
- one worker process scaffold
- initial domain models for:
  - wedding
  - event
  - photo
  - studio album
  - share link

### Outcome

The project now has a real backend platform instead of frontend-only mock persistence.

## Phase 2: Gallery Catalog Read API

### Goal

Replace frontend mock data with real backend-driven gallery reads.

### Scope

- home page data
- events list
- event detail
- photo viewer metadata
- studio albums
- curated people read support

### Deliverables

- read endpoints for:
  - wedding overview
  - event listing
  - event detail
  - photo detail
  - album detail
  - curated people listing
- publish-state aware filtering
- CDN-ready media URLs or media variant references

### Outcome

The frontend can remove dependence on [src/lib/data.ts](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/lib/data.ts) for published gallery content.

## Phase 3: Sharing And Access Control

### Goal

Make the gallery private, shareable, and production-safe.

### Scope

- private-by-default access
- share links
- password-protected links
- expiry
- scoped access for wedding, event, and studio album

### Deliverables

- share-link backend model
- share-link creation endpoints
- password verification flow
- expiry validation
- access middleware for protected gallery reads
- frontend access-state support:
  - password required
  - invalid link
  - expired link

### Outcome

The product is now meaningfully better than Google Drive for client delivery.

## Phase 4: Personal Collections

### Goal

Move saved photos and personal albums from local-only frontend state into backend persistence.

### Scope

- saved photos
- personal albums
- add/remove photo from personal album
- event-aware personal album creation

### Deliverables

- personal collection backend models
- endpoints for:
  - save / unsave photo
  - list saved photos
  - create personal album
  - add photo to personal album
  - remove photo from personal album
  - list personal albums

### Outcome

Client actions persist across devices and sessions and no longer rely on browser-local state alone.

## Phase 5: Download Workflow

### Goal

Introduce reliable production-ready download behavior.

### Scope

- single-photo download
- small-selection download
- background export jobs for large selections
- app-level download status

### Deliverables

- direct download endpoint or signed-URL flow
- export-job model
- background worker job for zip creation
- job-status endpoint
- short-lived final download URLs
- frontend support for:
  - preparing
  - ready
  - failed

### Outcome

Download becomes trustworthy and scalable without blocking gallery browsing.

## Phase 6: Curated People

### Goal

Support the MVP `People` experience using studio-curated important people.

### Scope

- curated people entities
- photo-to-person associations
- people listing per wedding/event
- selected person photo retrieval

### Deliverables

- backend models for:
  - person
  - photo_people relationship
- read endpoints for people and selected-person photos
- lightweight admin-compatible write path for curation

### Outcome

The `People` page is production-ready without needing facial-recognition complexity.

## Phase 7: Studio Upload And Curation Basics

### Goal

Give photographers or admins the minimum tools needed to operate the gallery.

### Scope

- upload photos into storage
- attach uploads to weddings/events
- create studio albums
- define covers/highlights
- curate people assignments
- manage publish state

### Deliverables

- simple studio/admin workflow or internal tool
- upload intake API
- media processing trigger
- event assignment and curation endpoints
- studio album management endpoints

### Outcome

The product becomes operationally usable by photographers, not just technically functional.

## Phase 8: Hardening And Launch Readiness

### Goal

Make the system safe and dependable for real client use.

### Scope

- logging
- error handling
- retry behavior
- permissions audit
- rate limits where needed
- production environment verification

### Deliverables

- monitoring and structured logs
- background job retry rules
- access and expiry test coverage
- download workflow test coverage
- share-link security review

### Outcome

The backend is ready for controlled MVP launch.

## Recommended Build Order

1. Phase 1: Backend Foundation
2. Phase 2: Gallery Catalog Read API
3. Phase 3: Sharing And Access Control
4. Phase 4: Personal Collections
5. Phase 5: Download Workflow
6. Phase 6: Curated People
7. Phase 7: Studio Upload And Curation Basics
8. Phase 8: Hardening And Launch Readiness

## Why This Order Works

- it replaces mock data first
- it makes the gallery private before broad usage
- it moves high-value client behaviors into backend persistence early
- it adds download reliability before launch
- it keeps curated people lightweight and intentional
- it delays heavier admin tooling until the product core is stable

## MVP Launch Cut Line

The minimum realistic launch cut line is:

- Phase 1
- Phase 2
- Phase 3
- Phase 4
- basic Phase 5
- basic Phase 6

This gives you:

- real backend content
- private access
- controlled sharing
- persistent saves and albums
- usable downloads
- curated people

Phase 7 and Phase 8 make the system easier to operate and safer to scale, but the first product value arrives earlier.

## Related Documents

- [MVP_FEATURE_SCOPE.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/MVP_FEATURE_SCOPE.md)
- [BACKEND_OVERVIEW.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/BACKEND_OVERVIEW.md)
- [SHARING_AND_ACCESS_PLAN.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/SHARING_AND_ACCESS_PLAN.md)
- [DOWNLOAD_WORKFLOW.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/DOWNLOAD_WORKFLOW.md)
