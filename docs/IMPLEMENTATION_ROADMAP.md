# Wedding Gallery Implementation Roadmap

## Purpose

This document defines the practical implementation roadmap for evolving the wedding gallery from a strong prototype into a studio-grade client product.

The focus is not just on adding features. The priority is to improve reliability, emotional polish, editorial presentation, and consistency across mobile and desktop experiences.

## Product Goal

The site should feel less like a generic photo web app and more like a premium wedding gallery experience:

- calm and elegant
- effortless to navigate
- emotionally paced
- mobile-first without feeling mobile-limited
- trustworthy for non-technical clients

## Guiding Principles

- Navigation should feel invisible. Users should never have to think about where "back" goes.
- Photo presentation comes first. Controls should support the gallery, not dominate it.
- Client-facing copy should feel warm, polished, and reassuring.
- Shared behaviors should be implemented once and reused consistently.
- Mobile and desktop should be adaptive, not identical.

## Current Priorities

The product already has a solid foundation:

- home-level navigation
- event-based browsing
- people filtering
- saved photos
- albums
- mobile-oriented photo viewer

The biggest remaining gaps are:

- navigation consistency across flows
- inconsistent page-level orchestration patterns
- prototype-like copy and feedback
- editorial polish on home and event pages
- stronger premium presentation for albums and people flows

## Phase 1: Stability and UX Foundation

### Goal

Make the current product feel dependable and consistent before deeper redesign work.

### Workstreams

#### 1. Navigation audit

Files:

- [src/components/Navigation.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/components/Navigation.tsx)
- [src/pages/Home.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/Home.tsx)
- [src/pages/Saved.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/Saved.tsx)
- [src/pages/Albums.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/Albums.tsx)
- [src/pages/EventDetail.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/EventDetail.tsx)
- [src/pages/EventPeople.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/EventPeople.tsx)
- [src/pages/EventAlbums.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/EventAlbums.tsx)
- [src/pages/EventSaved.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/EventSaved.tsx)
- [src/pages/PhotoViewer.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/PhotoViewer.tsx)

Tasks:

- normalize route state handling
- define explicit rules for home-level vs event-level back behavior
- verify photo viewer back behavior from all entry points
- verify people-filtered flows with URL state

#### 2. Feedback system

Planned files:

- `src/components/Toast.tsx`
- `src/components/FeedbackProvider.tsx`

Tasks:

- show subtle success feedback for save, add to album, remove from album, share, and download
- avoid heavy or interruptive confirmations
- keep styling soft and consistent with the gallery UI

#### 3. Copy polish pass

Scope:

- page headers
- action labels
- empty states
- helper text
- sheet titles and descriptions

Tasks:

- replace functional or technical wording with premium client-facing language
- improve clarity without sounding app-heavy
- align tone across all pages

#### 4. Layout rhythm pass

Primary files:

- [src/index.css](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/index.css)
- all major page components

Tasks:

- standardize top spacing under nav
- standardize section spacing and card density
- reduce any remaining overly heavy overlays or card treatments
- ensure desktop and mobile spacing feel intentional, not just responsive

## Phase 2: Home Page Redesign

### Goal

Make the home page feel like a wedding gallery entrance, not just a content index.

### Primary file

- [src/pages/Home.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/Home.tsx)

### Planned components

- `src/components/home/HomeHero.tsx`
- `src/components/home/EventChapters.tsx`
- `src/components/home/HighlightStrip.tsx`
- `src/components/home/CollectionEntryCard.tsx`

### Tasks

- design a stronger emotional first screen
- make event entry points feel like wedding chapters
- reduce utility-dashboard feel
- improve home-page hierarchy on both mobile and desktop
- keep quick access to saved and albums, but present them more elegantly

## Phase 3: Event Page Storytelling

### Goal

Make each event feel like a curated chapter rather than just a photo grid.

### Primary file

- [src/pages/EventDetail.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/EventDetail.tsx)

### Planned components

- `src/components/event/EventHero.tsx`
- `src/components/event/EventGrid.tsx`
- `src/components/event/SelectionBar.tsx`

### Tasks

- refine event hero composition
- strengthen metadata hierarchy
- simplify and isolate bulk selection logic
- preserve the subtle gallery-like action treatment
- improve consistency between event page and photo viewer interactions

## Phase 4: Albums Experience

### Goal

Make albums feel premium, curated, and collectible.

### Primary files

- [src/pages/Albums.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/Albums.tsx)
- [src/pages/EventAlbums.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/EventAlbums.tsx)
- [src/pages/AlbumDetail.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/AlbumDetail.tsx)

### Tasks

- improve grouped-by-event presentation on the home-level albums page
- create stronger album card hierarchy and cover presentation
- move event album creation into a more polished sheet-based flow
- make album detail actions clearer and softer
- reinforce the distinction between studio albums and user-created albums

## Phase 5: People Experience

### Goal

Make the people flow feel magical and personal instead of operational.

### Primary file

- [src/pages/EventPeople.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/EventPeople.tsx)

### Planned components

- `src/components/people/PeopleStrip.tsx`
- `src/components/people/SelectedPersonHero.tsx`
- `src/components/people/PersonPhotoGrid.tsx`

### Tasks

- refine chip presentation and selected-person state
- improve the emotional feel of the filtered-person view
- keep the URL-backed flow, but make transitions feel smoother
- improve individual and bulk actions for filtered photos
- keep the "Find You" entry point lightweight and premium

## Phase 6: Photo Viewer Premium Pass

### Goal

Make the photo viewer feel like a finished premium gallery experience.

### Primary file

- [src/pages/PhotoViewer.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/pages/PhotoViewer.tsx)

### Planned components

- `src/components/viewer/ViewerHeader.tsx`
- `src/components/viewer/ViewerActions.tsx`
- `src/components/viewer/ViewerDetails.tsx`

### Tasks

- refine chrome timing and opacity
- further reduce unnecessary visual weight
- improve desktop vs mobile behavior intentionally
- keep sharing, saving, downloading, and add-to-album fast and predictable
- ensure transitions between photos feel calm and confident

## Phase 7: Motion and System Polish

### Goal

Introduce a restrained motion system that makes the product feel expensive without becoming distracting.

### Tasks

- improve route transitions between home, event, album, and viewer
- refine sheet open/close motion
- polish selection state transitions
- add subtle action feedback motion
- support reduced-motion users

## Phase 8: Production Readiness

### Goal

Prepare the product to behave like a real client gallery, not just a polished prototype.

### Tasks

#### 1. State and component cleanup

- reduce route-component complexity
- move shared workflows into hooks and reusable components
- minimize duplicated stateful behavior

#### 2. Testing

Recommended coverage:

- navigation/back-flow tests
- album add/remove behavior
- people URL and back behavior
- photo viewer entry/exit behavior
- selection flow tests

#### 3. Content realism

- replace placeholder-feeling copy
- use realistic names, events, and gallery labels
- make imagery and metadata feel more bespoke

## Recommended Build Order

Implementation order:

1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 5
6. Phase 6
7. Phase 7
8. Phase 8

## Suggested Sprint Breakdown

### Sprint 1

- navigation audit
- feedback system
- copy polish
- layout rhythm pass

### Sprint 2

- home page redesign
- initial event page storytelling improvements

### Sprint 3

- albums experience
- people experience

### Sprint 4

- photo viewer premium pass
- motion system
- production-readiness cleanup and testing

## Success Criteria

The product should feel studio-grade when:

- back behavior is predictable everywhere
- controls feel lightweight and supportive
- mobile browsing feels premium, not compressed
- pages feel editorial rather than utility-driven
- albums and events feel curated
- people flow feels personal and elegant
- copy feels calm, clear, and trustworthy

## Notes

- This roadmap should evolve as the product matures.
- Architectural guidance should remain aligned with [docs/ARCHITECTURE.md](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/docs/ARCHITECTURE.md).
- When implementing future phases, prefer shared components and hooks over page-specific orchestration.

## Current Status

The main roadmap phases are now substantially implemented:

- Phase 1: stability, navigation cleanup, feedback system, copy polish, and layout rhythm
- Phase 2: editorial home page redesign
- Phase 3: event detail storytelling and component extraction
- Phase 4: albums experience refresh
- Phase 5: people experience redesign
- Phase 6: photo viewer premium pass
- Phase 7: motion and feedback polish
- Phase 8: production-readiness foundation, shared navigation helpers, and initial automated tests

The project is also now running on Node `22.22.1`, with both `npm test` and `npm run build` succeeding.

## Next Steps

These are the highest-value follow-ups from here:

1. Fix the CSS import-order warning in [src/index.css](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/index.css) by moving the Google Fonts `@import` above the other non-layer rules.
2. Expand automated coverage beyond [src/lib/navigation.test.ts](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/lib/navigation.test.ts) to include album add/remove flows, people-page back behavior, and photo viewer source-return behavior.
3. Add render-level tests for shared components such as [src/components/Navigation.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/components/Navigation.tsx), [src/components/AlbumPickerSheet.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/components/AlbumPickerSheet.tsx), and [src/components/Sheet.tsx](/Users/umeshpalav/Desktop/Projects/wedding-gallery-web/src/components/Sheet.tsx).
4. Replace placeholder-like content and metadata with more realistic wedding copy, names, and supporting text.
5. Do one final code-quality sweep for dead code, repeated strings, and any remaining route-state simplifications.
