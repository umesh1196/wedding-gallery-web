# Wedding Gallery MVP Feature Scope

## Purpose

This document defines the practical MVP scope for the wedding gallery product.

The goal is to launch something that is already meaningfully better than the current Google Drive delivery workflow used by photographers, without overbuilding the first version.

## MVP Positioning

The MVP promise is:

**A private, beautifully presented wedding gallery with controlled sharing.**

This is already a major improvement over a raw Drive link because it gives clients:

- a curated wedding experience instead of folders
- better mobile browsing
- event-based storytelling
- privacy and access control
- more elegant sharing

## MVP Product Goals

The MVP should:

- feel premium for clients
- be simple for photographers to use
- solve real delivery pain immediately
- avoid backend complexity that does not directly improve launch value

## Must-Have MVP Features

### 1. Private Gallery Access

- password protection
- access-controlled gallery links
- expiry support for shared links

### 2. Controlled Sharing

- selective sharing with specific clients or family members
- the ability to share only specific parts of the gallery when needed
- stable share links with clear access behavior

### 3. Core Gallery Experience

- home page
- event-based browsing
- photo viewer
- mobile-friendly experience
- saved photos
- personal albums

These features already create a significantly better viewing experience than Google Drive.

### 4. Basic Download Support

- single-photo download
- small-selection download
- clear client-facing messaging around download behavior

Batch export workflows can be improved later, but basic download capability should exist in MVP.

### 5. Curated People

The MVP will use a curated people approach.

That means:

- only studio-managed important people appear in the `People` page
- examples: bride, groom, parents, siblings, close family
- people are added and managed during upload or curation workflows
- people browsing remains elegant and controlled

This keeps the feature useful without introducing facial-recognition complexity too early.

## Explicit MVP Decisions

### Curated People Instead Of Full AI Facial Recognition

For MVP, `People` is a curated studio-controlled feature.

Reason:

- simpler implementation
- better trust and accuracy
- cleaner UX
- avoids privacy concerns from selfie uploads
- gives clients the highest-value people groups first

### No Open-Ended Client Person Creation

Clients should not be able to create public people entries in MVP.

This keeps the experience curated and avoids noisy or duplicated people data.

### No Selfie Upload Search In MVP

This is intentionally deferred.

It can be added later as a private discovery workflow, but it is not required to beat the current Google Drive delivery experience.

## Should-Have If Feasible

These are valuable, but not mandatory for first launch:

- branded studio welcome message
- share activity visibility for photographers
- stronger batch download workflow
- lightweight studio upload/admin tooling
- publish-state support for staged event release

## Not In MVP

These are intentionally out of scope for version 1:

- full AI facial recognition
- selfie-based people search
- proofing comments and edit requests
- print or digital commerce
- advanced analytics
- complex studio CRM features
- vendor delivery workflows

## Why This MVP Is Still Strong

Even with a restrained first version, this product is already likely to deliver more value than Google Drive because:

- the experience feels premium
- the gallery is organized around the wedding story
- clients can browse more naturally on mobile
- access feels private and intentional
- saved moments and personal albums create a more personal experience

The MVP does not need to match every gallery-delivery platform immediately.

It only needs to deliver a clearly better client experience while staying reliable and easy to operate.

## Recommended Launch Priorities

1. Private access and sharing
2. Reliable core gallery browsing
3. Download behavior clients can trust
4. Saved photos and personal albums
5. Curated people

## Future Expansion Path

After MVP, the natural progression is:

1. stronger studio admin workflows
2. staged publishing and release controls
3. background batch downloads
4. admin-assisted people recognition
5. private selfie search later, if it proves valuable

## Related Documents

- [GAP_ANALYSIS.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/GAP_ANALYSIS.md)
- [BACKEND_OVERVIEW.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/BACKEND_OVERVIEW.md)
- [BACKEND_MODULES.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/BACKEND_MODULES.md)
- [BACKEND_DATA_MODEL.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/BACKEND_DATA_MODEL.md)
