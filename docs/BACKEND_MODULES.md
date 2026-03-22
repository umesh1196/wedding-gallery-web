# Wedding Gallery Backend Modules

## Purpose

This document defines the backend module boundaries and responsibilities for the wedding gallery product.

The focus is on clean ownership. Each module should own one business area end-to-end: core rules, persistence, and API-facing behavior for that area.

## Recommended Module Set

The backend should start with 6 core modules:

1. Identity and Access
2. Gallery Catalog
3. Personal Collections
4. People and Discovery
5. Media Pipeline
6. Studio Operations

## 1. Identity And Access

### Owns

- users
- sessions
- invite flows
- login and magic-link flows
- wedding-level access control
- role checks for viewers and studio members

### Responsibilities

- authenticate users
- attach users to one or more weddings
- enforce whether a user may view or modify a wedding
- enforce admin/editor permissions for studio actions
- support private sharing links where needed

### Notes

This module decides who can act. It should not own gallery structure, albums, or media logic.

## 2. Gallery Catalog

### Owns

- weddings
- events / chapters
- photos and metadata
- studio highlights
- event order
- editorial metadata such as subtitles, mood labels, and notes
- publish state for visible gallery content

### Responsibilities

- serve the shared wedding story shown to all authorized viewers
- determine what content is live versus draft
- support staged release over time
- provide the frontend with event and photo data for home, events, event detail, and viewer pages

### Notes

This is the central read domain for the client gallery experience.

## 3. Personal Collections

### Owns

- saved photos per user
- personal albums per user
- album membership for personal albums
- personal collection summaries

### Responsibilities

- save and unsave photos
- create and manage personal albums
- add and remove photos from personal albums
- keep personal collections private by default
- support cross-device persistence for viewer actions

### Notes

This module owns viewer-specific state that is currently stored in local persistence on the frontend.

## 4. People And Discovery

### Owns

- people entities within a wedding
- photo-to-person relationships
- visibility and ordering for people surfaces
- future recognition-related metadata

### Responsibilities

- power people-based browsing
- return photos for a selected person
- support manual or curated people tagging
- support future face-cluster ingestion and review workflows

### Notes

Version 1 should be compatible with manual tagging even if automated recognition is added later.

## 5. Media Pipeline

### Owns

- upload intake
- original media files
- derived image variants
- metadata extraction
- media processing jobs
- download packaging workflows

### Responsibilities

- process uploaded assets
- store originals and resized variants
- make CDN-friendly delivery possible
- prepare batch downloads or exports
- keep expensive work out of request-response API paths

### Notes

This module owns files and processing, not business visibility or user permissions.

## 6. Studio Operations

### Owns

- studio upload workflows
- curation workflows
- publishing workflows
- chapter release timing
- studio-managed albums and highlights
- admin-facing editing of editorial metadata

### Responsibilities

- upload photos into the system
- assign photos to events
- create and manage studio albums
- mark featured photos and covers
- publish or unpublish events over time
- manage the client-delivery lifecycle

### Notes

This module is the operational control surface for the photographer or studio team.

## Cross-Cutting Platform Pieces

These are not domain modules, but they support all modules:

### API / BFF Layer

- exposes frontend-ready endpoints
- aggregates domain data into page-level responses
- applies access checks consistently

### Postgres

- stores canonical metadata and relationships across all modules

### Object Storage + CDN

- stores originals and variants
- serves media efficiently at scale

### Background Workers

- process uploads
- generate image variants
- extract metadata
- prepare downloads
- support future search or recognition jobs

## Ownership Rules

Keep these boundaries strict:

- Identity and Access decides who may act.
- Gallery Catalog owns published wedding-story content.
- Personal Collections owns viewer-private saved state and albums.
- People and Discovery owns person grouping and people-based navigation.
- Media Pipeline owns files and transformations.
- Studio Operations owns curation and release workflows.

## Mapping To Current Frontend

Current frontend behavior maps like this:

- [src/lib/data.ts](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/lib/data.ts) shared mock data moves into `Gallery Catalog` and `Studio Operations`
- [src/store/viewerStore.ts](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/store/viewerStore.ts) saved photos and user albums move into `Personal Collections`
- people browsing currently shown in the event people flow is backed by `People and Discovery`

## Recommended V1 Scope

For the first backend version:

- keep all 6 modules in one codebase
- share one Postgres database
- share one background worker system
- keep admin features simple and internal
- support manual people curation first

## Related Documents

- [BACKEND_OVERVIEW.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/BACKEND_OVERVIEW.md)
- [BACKEND_DATA_MODEL.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/BACKEND_DATA_MODEL.md)
