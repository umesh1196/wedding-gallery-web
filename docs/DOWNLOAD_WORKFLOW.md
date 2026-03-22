# Wedding Gallery Download Workflow

## Purpose

This document defines the recommended download workflow for the wedding gallery product.

The goal is to give clients a reliable, premium download experience while keeping backend behavior scalable and predictable.

## Product Goal

Download behavior should feel:

- clear
- reliable
- non-blocking
- mobile-friendly
- consistent with a premium gallery experience

The system should support both simple single-photo downloads and larger batch downloads without relying on fragile long-running browser requests.

## Core Principle

Use two different download paths depending on size and complexity:

- direct download for small/simple cases
- background export jobs for larger selections

This avoids forcing every download through the same path and keeps the user experience clean.

## Download Types

### 1. Single Photo Download

Used when the user downloads one image from the viewer or a photo action.

Recommended behavior:

- backend validates access
- backend returns a direct download response or short-lived signed URL
- browser starts the download immediately

This should feel near-instant.

### 2. Small Selection Download

Used when the user downloads a small number of selected photos.

Recommended behavior:

- backend validates access
- if the selection is small enough, the backend can either:
  - return individual signed URLs, or
  - generate a lightweight zip immediately if operationally safe

This should still feel fast and not require a long preparation flow.

### 3. Large Batch Download

Used when the user downloads many photos or a large total asset size.

Recommended behavior:

- backend creates an export job
- a worker prepares the zip in the background
- frontend shows `Preparing your download`
- user continues browsing while the export is being prepared
- when ready, the user gets a downloadable zip link

This is the preferred production path for larger selections.

## Recommended MVP Rule

Use a simple threshold-based split.

Example:

- `1 photo` → direct download
- `2 to 20 photos` → direct or lightweight zip path
- `20+ photos` → async export job

The exact threshold can be tuned later based on performance and average file size.

The important thing is that large downloads should not be processed as long-running synchronous requests.

## Backend Workflow

### Direct Download Path

1. User clicks download
2. Frontend sends request
3. Backend validates:
   - access
   - share permissions
   - resource visibility
4. Backend returns:
   - direct file response, or
   - short-lived signed URL
5. Browser starts download

### Async Export Path

1. User clicks download
2. Frontend sends selected photo IDs
3. Backend validates access
4. Backend creates `download_export` or `zip_export` job
5. Backend returns:
   - `job_id`
   - `status = preparing`
6. Worker fetches allowed media assets from storage
7. Worker builds zip
8. Worker uploads finished zip to object storage
9. Backend marks job as `ready`
10. Frontend receives ready state
11. User downloads zip through short-lived URL

## Why Not Stream Large Downloads

For large selections, streaming directly from the request path is not recommended.

Reasons:

- long-running HTTP requests are fragile
- mobile connections drop
- browser timeouts happen
- retry behavior is poor
- building large zips synchronously is expensive
- users should be able to keep browsing while preparation happens

Background preparation is much more reliable.

## Media Source Rules

Downloads should not automatically use the raw original file unless that is explicitly allowed by studio policy.

Recommended approach:

- browsing uses CDN-delivered viewer and grid variants
- download uses a dedicated allowed variant
- original files remain a separate policy decision

Recommended download variants:

- `high_quality_web`
- optionally `original` later if enabled

## Frontend UX Model

Download should behave like a background task, not a blocking flow.

### States

Recommended frontend states:

- `idle`
- `preparing`
- `ready`
- `failed`
- `dismissed`

### UX For Single Photo

- click download
- show subtle toast: `Preparing your photo`
- trigger browser download
- show `Download started`

### UX For Small Selection

- click download
- show toast: `Preparing your download`
- if fast enough, trigger directly
- show `Download started`

### UX For Large Batch

- click download
- show toast: `Preparing your download`
- create a persistent lightweight status surface in the app
- allow user to continue browsing
- when ready, update status to `Download ready`
- user taps to download the zip

## Recommended UI For Current App

To fit the current app structure:

- use toasts for transition messages
- add a small global download-status surface
- do not block scrolling or navigation during preparation
- keep bulk-download status visible across routes

This means download state should live at app level, not only inside:

- [EventDetail.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/EventDetail.tsx)
- [PhotoViewer.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/PhotoViewer.tsx)

Recommended location:

- a global store or top-level provider

## Suggested Backend Data Model

Recommended export job fields:

- `id`
- `wedding_id`
- `requested_by`
- `resource_type`
- `photo_ids`
- `variant`
- `status`
- `file_key` nullable
- `expires_at` nullable
- `error_message` nullable
- `created_at`
- `completed_at`

Suggested `status` values:

- `queued`
- `preparing`
- `ready`
- `failed`
- `expired`

## Access And Policy Rules

Before any download is allowed, backend should validate:

- the user or share link can access the relevant wedding/resource
- requested photos are visible within that scope
- download permission is allowed for that share or gallery

This is especially important for:

- event-scoped shares
- album-scoped shares
- expired links
- password-protected access sessions

## MVP Recommendation

For MVP, include:

- single-photo download
- small-selection download
- async background export for larger batches
- clear status messaging

Do not try to build:

- live progress bars based on byte-level transfer
- overly complex streaming pipelines
- multi-format export options
- original-vs-web-size selection UI unless needed immediately

## Future Expansion

Later, the workflow can grow to support:

- full-gallery export
- multiple download quality options
- share-type-specific download policies
- activity logging and download history
- email notification when export is ready
- multiple concurrent export jobs

## Related Documents

- [MVP_FEATURE_SCOPE.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/MVP_FEATURE_SCOPE.md)
- [SHARING_AND_ACCESS_PLAN.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/SHARING_AND_ACCESS_PLAN.md)
- [BACKEND_OVERVIEW.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/BACKEND_OVERVIEW.md)
- [BACKEND_DATA_MODEL.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/BACKEND_DATA_MODEL.md)
