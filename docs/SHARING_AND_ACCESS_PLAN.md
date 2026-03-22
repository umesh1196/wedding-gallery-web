# Wedding Gallery Sharing And Access Plan

## Purpose

This document defines the access-control and sharing plan for the wedding gallery MVP.

The focus is to replace the current Google Drive-style sharing experience with something that feels:

- private
- premium
- easy for photographers to manage
- clear for clients and family members to use

## Product Goal

The MVP promise for access and sharing is:

**A private gallery that can be shared intentionally, with controlled visibility and time-limited access.**

This should feel significantly more professional than a raw file link while remaining simple enough for photographers to use without operational friction.

## MVP Access Model

For version 1, access should be based on share links and simple viewer access controls rather than a heavy account system.

Recommended model:

- each wedding gallery is private by default
- access is granted via controlled links
- links can optionally be protected by password
- links can optionally expire
- access can be limited to the full wedding, a specific event, or a specific album

This keeps the system flexible without requiring every viewer to create a full account.

## Core Access Concepts

### 1. Private By Default

No gallery should be public by default.

If someone has not received a valid shared link, they should not be able to access the content.

### 2. Scoped Sharing

A share should be able to point to one of these resources:

- the full wedding gallery
- a specific event
- a specific studio album
- a specific personal album, if that is allowed in MVP

This allows photographers to share only what is relevant instead of exposing the entire gallery.

### 3. Password Protection

A photographer should be able to attach an optional password to a share link.

Use cases:

- sharing with the couple
- family-only galleries
- extra privacy for unfinished galleries

### 4. Expiry

A photographer should be able to create links that expire after a chosen date or duration.

Use cases:

- short-term preview access
- vendor delivery
- temporary family sharing

### 5. Stable Viewer Experience

Clients should land in a polished gallery view, not a utility-style access flow.

That means:

- minimal friction to enter
- clear messaging when a password is required
- clear messaging when a link has expired
- clear messaging when access is invalid

## Recommended MVP Sharing Types

### Type 1: Full Gallery Share

Access to the entire wedding.

Use for:

- the couple
- immediate family
- primary client delivery

### Type 2: Event Share

Access to a single event or chapter.

Use for:

- partial release over time
- previewing one stage of the celebration
- selectively sharing one event before the full gallery is ready

### Type 3: Album Share

Access to one album only.

Use for:

- curated family albums
- vendor sharing
- smaller highlight delivery

### Type 4: Personal Album Share

Optional for MVP.

If included:

- the album remains owned by the creator
- sharing exposes only that personal album
- the system should still enforce expiry and password rules

If MVP scope needs to stay tight, this can be deferred until after launch.

## Photographer/Admin Workflow

The expected admin flow should be simple:

1. Open wedding, event, or album
2. Click `Share`
3. Choose scope:
   - full gallery
   - event
   - album
4. Configure:
   - password required or not
   - expiry date or duration
5. Generate link
6. Copy link and send to client/family/vendor

This should feel like a lightweight delivery control, not a complex permission system.

## Client/Viewer Workflow

The viewer flow should be:

1. Open link
2. If password protected, enter password
3. If valid, enter gallery
4. If expired or invalid, see a clear branded message

The experience should feel calm and premium, with no confusing auth concepts.

## Recommended Backend Model

Use explicit share-link records in the backend.

Suggested fields:

- `id`
- `resource_type`
- `resource_id`
- `wedding_id`
- `token`
- `password_hash` nullable
- `expires_at` nullable
- `status`
- `created_by`
- `created_at`
- `last_accessed_at` optional

Recommended `resource_type` values:

- `wedding`
- `event`
- `studio_album`
- `personal_album`

Recommended `status` values:

- `active`
- `revoked`
- `expired`

## Access Rules

### Wedding Share

- grants read access to all currently published wedding content
- should respect publish-state filtering

### Event Share

- grants read access only to that event and its photos
- should not reveal unrelated events unless explicitly allowed

### Album Share

- grants read access only to that album and its included photos

### Password-Protected Share

- link token identifies the share
- password gates final access
- successful password entry creates a short-lived viewer session

### Expired Or Revoked Share

- no content should be shown
- user should see a clear access state screen

## Frontend UX Requirements

The frontend should support these states cleanly:

### 1. Password Required

Show:

- branded entry screen
- password input
- calm helper text

### 2. Invalid Link

Show:

- the link is not valid
- option to contact the photographer or gallery owner

### 3. Expired Link

Show:

- the gallery link has expired
- suggestion to request a fresh link

### 4. Access Granted

After access is granted:

- user enters the scoped resource directly
- browsing experience should feel identical to the normal gallery

## Recommended MVP Boundaries

For MVP, keep the model simple:

- no complex user role management for clients
- no mandatory sign-up
- no deep invitation management UI
- no per-photo access rules
- no open public search indexing

That keeps the system easy to reason about and easy for photographers to operate.

## Security Notes

- store only password hashes, never raw passwords
- use high-entropy random share tokens
- check expiry on every access
- support share revocation
- keep link scope explicit
- do not leak hidden resources through navigation or API responses

## Recommended MVP Decisions

- `Private by default` is mandatory
- `Password protection` is included
- `Expiry` is included
- `Scoped sharing` is included for wedding, event, and studio album
- `Personal album sharing` is optional depending on launch scope

## Future Expansion

After MVP, sharing can evolve to support:

- branded invite emails
- named guest access
- vendor-specific access
- share activity tracking
- download permissions by share type
- guest accounts if needed later

## Related Documents

- [MVP_FEATURE_SCOPE.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/MVP_FEATURE_SCOPE.md)
- [BACKEND_OVERVIEW.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/BACKEND_OVERVIEW.md)
- [BACKEND_DATA_MODEL.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/BACKEND_DATA_MODEL.md)
