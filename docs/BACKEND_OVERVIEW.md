# Wedding Gallery Backend Overview

## Purpose

This document outlines the high-level backend architecture for the wedding gallery product.

The goal is to move the app from a frontend-driven prototype with static mock data and local persisted state into a production-ready system that supports:

- private client galleries
- studio-managed publishing
- personal saved photos and albums across devices
- staggered delivery over weeks or months
- scalable media storage and processing

## Recommended Architecture

The recommended starting point is a modular monolith.

That means:

- one backend API application
- one primary Postgres database
- one object storage layer for media
- one background worker process for heavy jobs
- one CDN in front of media delivery

This is the right balance for the product at this stage. It keeps the system simple to build and operate while still creating clean boundaries for future growth.

## High-Level System Shape

```text
Web App / Mobile App
        |
        v
  Backend API / BFF
        |
        +-- Postgres
        +-- Object Storage
        +-- CDN
        +-- Background Workers
        +-- Auth / Session Layer
        +-- Studio Admin Tools
```

## Core Backend Responsibilities

The backend should own all persistent business data and rules.

This includes:

- wedding and event structure
- photo metadata and publishing state
- studio-curated albums
- user saved photos
- user-created albums
- people tagging and people-based discovery
- access control and sharing rules
- media lifecycle and processing

The frontend should keep only transient UI state such as:

- whether a sheet is open
- which photos are currently selected
- local animation and navigation state

## Main Building Blocks

### API / BFF Layer

This is the single backend entry point for the frontend.

It should:

- expose frontend-ready endpoints
- aggregate data for page views
- apply access control
- keep storage and domain complexity hidden from the client

### Postgres

Postgres should be the primary source of truth for:

- users
- weddings
- events
- photos and metadata
- albums
- people
- saved-photo relationships
- personal albums
- share links
- processing job state

### Object Storage

Store originals and derived assets here.

Expected variants:

- original
- viewer
- grid
- thumbnail

### CDN

Serve image assets through a CDN for fast browsing, especially for:

- home highlight strips
- event grids
- photo viewer assets
- album covers

### Background Workers

Workers should handle slow or expensive work outside the request path.

Typical jobs:

- ingest uploads
- generate resized image variants
- extract metadata
- prepare batch downloads
- generate album cover fallbacks
- support future face clustering or search indexing

### Auth And Access

This layer should support:

- client and family access
- studio admin access
- session management
- invite links or magic-link login
- explicit permission checks at the wedding level

## Domain Split

The backend should be organized around business domains, not technical utility layers.

Recommended domains:

- Identity and Access
- Gallery Catalog
- Personal Collections
- People and Discovery
- Media Pipeline
- Studio Operations

These are described in detail in [BACKEND_MODULES.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/BACKEND_MODULES.md).

## How This Maps To The Current Frontend

Today the app reads shared gallery data from [src/lib/data.ts](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/lib/data.ts) and personal state from [src/store/viewerStore.ts](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/store/viewerStore.ts).

In the backend-backed version:

- events, photos, studio albums, people, and editorial metadata move to the API
- saved photos and personal albums also move to the API
- Zustand remains only for transient UI concerns if needed

## Delivery Strategy

Recommended phases:

1. Core backend foundation
   Replace mock data and local persistence with API, database, and object storage.

2. Studio publishing workflows
   Add uploads, curated albums, event publishing, and staged gallery rollout.

3. Premium capabilities
   Add richer sharing, batch downloads, notifications, and future people-recognition workflows.

## Guiding Principles

- Keep the first version as a modular monolith.
- Treat the wedding story as shared studio-owned data.
- Treat saves and personal albums as user-owned private data.
- Keep media processing out of request-response flows.
- Let the backend own business rules, not the client.

## Related Documents

- [BACKEND_MODULES.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/BACKEND_MODULES.md)
- [BACKEND_DATA_MODEL.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/BACKEND_DATA_MODEL.md)
- [ARCHITECTURE.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/ARCHITECTURE.md)
