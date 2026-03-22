# Wedding Gallery Web — Architecture & Component Reference

A responsive web gallery for Shruti & Umesh's wedding, built with React 19,
TypeScript, Vite, Tailwind CSS v4, React Router v7, Zustand, and Framer Motion.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Design System](#3-design-system)
4. [Routing](#4-routing)
5. [Navigation](#5-navigation)
6. [Pages](#6-pages)
7. [Components](#7-components)
8. [State Management](#8-state-management)
9. [Data Model](#9-data-model)
10. [File Structure](#10-file-structure)

---

## 1. Project Overview

This is the **web version** of the wedding gallery — a full-width, responsive web
application. It shares the same dark editorial design language as the companion
mobile app (`elegance---wedding-gallery`) but is built desktop-first with no
mobile-only patterns (no bottom nav, no bottom sheets, no 390px constraints).

**What it does:**
- Displays a wedding photo gallery organised by events (Haldi, Mehendi, Sangeet, Ceremony, Reception)
- Lets viewers browse photos by event, by person, or by album
- Supports saving favourite photos (persisted in localStorage)
- Supports user-created albums per event
- Full-screen photo lightbox with keyboard navigation
- Share albums via copy link or WhatsApp

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.8 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| Routing | React Router v7 |
| State | Zustand 5 + `persist` middleware (localStorage) |
| Animation | Framer Motion (`motion/react`) |
| Icons | Lucide React |
| Utilities | clsx + tailwind-merge (`cn()`) |

---

## 3. Design System

Defined in `src/index.css` using Tailwind v4's `@theme {}` block.

### Colours

| Token | Hex | Usage |
|---|---|---|
| `bg-background` | `#0d0d0d` | Page background |
| `bg-surface` | `#131313` | Cards, modals, sheets |
| `bg-surface-container` | `#201f1f` | Elevated surfaces |
| `text-rose-accent` | `#c9506a` | Active states, CTAs, hearts |
| `text-on-surface` | `#e5e2e1` | Primary body text |
| `text-outline` | `#a48a8d` | Secondary / muted text |

### Typography

| Class | Font | Role |
|---|---|---|
| `font-headline` | Newsreader (serif) | Titles, event names, hero text |
| `font-body` | Manrope (sans-serif) | Body copy, captions |
| `font-label` | Inter (sans-serif) | Navigation, buttons, metadata |

### Utility Classes

| Class | Definition |
|---|---|
| `.wrap` | Responsive centered container — `max-w-7xl`, padding scales from `px-4` (mobile) to `px-24` (xl) |
| `.label` | Micro label — `text-[10px]` → `text-xs`, `uppercase`, `tracking-[0.15rem]` |
| `.photo-grade` | Photo filter — `sepia(15%) contrast(105%) saturate(85%) brightness(95%)` |
| `.no-scrollbar` | Hides scrollbar on all browsers |

### Responsive Breakpoints (Tailwind defaults)

| Prefix | Width | Usage |
|---|---|---|
| *(base)* | 0px | Mobile |
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop |
| `xl:` | 1280px | Desktop |

---

## 4. Routing

All routes are defined in `src/App.tsx`.

```
/                           → Home (gallery home with hero + events)
/events                     → EventsList (all 5 wedding events)
/event/:id                  → EventDetail (photos for one event)
/event/:id/people           → EventPeople (face chips + selfie CTA)
/event/:id/albums           → EventAlbums (albums for one event)
/event/:id/albums/:albumId  → AlbumDetail (photos inside an album)
/event/:id/saved            → EventSaved (favourites for one event)
/photo/:id                  → PhotoViewer (full-screen lightbox)
/saved                      → Saved (all favourites grouped by event)
```

### Navigation switching logic (App.tsx)

```typescript
const isPhotoViewer = location.pathname.startsWith('/photo/');
const isEventPage   = location.pathname.startsWith('/event/');

// No nav on photo viewer (full-screen)
// HomeNav on all home-level pages (/, /events, /saved)
// EventNav on all event-level pages (/event/*)
```

---

## 5. Navigation

Defined in `src/components/Navigation.tsx`.

### `HomeNav`

Top bar shown on home-level pages (`/`, `/events`, `/saved`).

```
[MPPF Photography]  [Photos | Events | Saved]  [spacer]
```

- Fixed, full-width, `h-14 md:h-16`
- Background: `bg-background/80 backdrop-blur-xl`
- Active tab: `text-rose-accent`
- Inactive tab: `text-white/40`

### `EventNav`

Top bar shown on all event pages (`/event/*`).

```
[← Events]  [Photos | People | Albums | Saved]  [spacer]
```

- Same styling as `HomeNav`
- Left "← Events" is a NavLink back to `/events`
- The 4 tabs are scoped to the current `eventId` (e.g. `/event/ceremony/albums`)

---

## 6. Pages

### `Home` (`src/pages/Home.tsx`)

Entry point for the gallery.

| Section | Details |
|---|---|
| **Hero** | Full-width, viewport-height image (`h-[50vh]` → `h-[75vh]`). Couple name in large italic serif. Gradient overlay. |
| **Studio Highlights** | Photos marked `isHighlight: true`. Grid: 4-col → 6-col → 8-col. Each photo links to `/photo/:id`. |
| **Events** | All 5 events as cards. Grid: 1-col → 2-col → 3-col. Each card links to `/event/:id`. |

---

### `EventsList` (`src/pages/EventsList.tsx`)

Dedicated events overview page (reached from HomeNav "Events" tab).

- Header: "Events" + subtitle "5 wedding chapters"
- Same event card grid as Home (1→2→3 col)
- Cards: cover photo + event title + date + photo count + like count

---

### `EventDetail` (`src/pages/EventDetail.tsx`)

Core gallery page for a single event.

| Section | Details |
|---|---|
| **Hero** | Event cover photo, `h-[40vh]` → `h-[55vh]`. Event title + photo count overlaid. "Select photos" button visible in hero. |
| **Full-width strip** | First event photo shown as a wide banner (`col-span-full`). |
| **Photo grid** | Remaining photos. 3-col → 4-col → 5-col → 6-col. Each photo links to `/photo/:id`. |
| **Heart overlay** | Saved photos show a small `♡` icon (bottom-right corner). |
| **Selection mode** | Tap "Select photos" → circles appear. Floating action bar rises with "Save" + "Add to Album". |
| **Add to Album** | `Sheet` modal with checklist of albums + "Create new album" input. |

**State managed locally:**
- `isSelecting` — selection mode on/off
- `selectedPhotos[]` — IDs of selected photos
- `showAddModal` — Add to Album sheet open/closed
- `selectedAlbumIds[]` — albums checked in the sheet

---

### `EventPeople` (`src/pages/EventPeople.tsx`)

People-browse tab within an event.

| Section | Details |
|---|---|
| **Face chips** | Circular avatars for each person tagged in event photos. `flex-wrap` layout. Active chip has rose-accent border + photo count badge. |
| **Filtered grid** | Shown when a chip is selected. 3→4→6 col grid of that person's photos. |
| **Selfie CTA** | "Find your photos" card with camera icon. Upload buttons (UI only — face recognition not yet wired). |

---

### `EventAlbums` (`src/pages/EventAlbums.tsx`)

Albums tab within an event.

- Shows studio albums + user-created albums for the current event
- Grid: 2-col → 3-col → 4-col
- Each album card: cover photo + title + photo count → links to `/event/:id/albums/:albumId`
- "Create Album" card (dashed border) opens inline text input

---

### `AlbumDetail` (`src/pages/AlbumDetail.tsx`)

Photos inside a single album.

- Page header (`.wrap`): album title + "Share album" button
- Photo grid: 3→4→6 col
- Right-click on a photo → context menu with "Remove from album" (user albums only; studio albums are read-only)
- Share → `Sheet` modal with photo strip, copy link, WhatsApp button

---

### `EventSaved` (`src/pages/EventSaved.tsx`)

Saved (favourited) photos within a single event.

- Same 3→4→6 col grid as EventDetail
- Heart icon overlay on each photo
- Empty state with "Browse Photos" link

---

### `Saved` (`src/pages/Saved.tsx`)

Global saved page — all favourites across all events.

- Grouped by event: event banner card → 4/6/8-col photo strip
- Event card links to `/event/:id/saved` for full view
- Empty state if no photos saved

---

### `PhotoViewer` (`src/pages/PhotoViewer.tsx`)

Full-screen lightbox.

| Element | Details |
|---|---|
| **Background** | Full-viewport image, `object-contain`, `brightness-[0.85] saturate-[0.8]` |
| **Top bar** | Back arrow, event pill (frosted glass), share icon |
| **Prev/Next arrows** | Always visible, positioned left/right centre |
| **People chips** | Frosted glass pills for tagged people |
| **Heart button** | Large 80×80px square, rose-accent when liked. Toggles `favouriteIds` in Zustand. |
| **Save / Share buttons** | Download icon (UI only) + Share icon (UI only) |
| **Caption** | Event name · date + italic photo description |
| **Photo counter** | "3 / 12" — current index within the event |
| **Keyboard shortcuts** | `←` prev, `→` next, `Escape` back |

---

## 7. Components

### `HomeNav` / `EventNav` — `src/components/Navigation.tsx`

See [Navigation](#5-navigation) above.

### `Sheet` — `src/components/Sheet.tsx`

Reusable modal component used for Add-to-Album and Share flows.

```tsx
<Sheet open={boolean} onClose={() => void}>
  {/* content */}
</Sheet>
```

- Always renders as a **centered modal** (web-first — no bottom sheet)
- Backdrop: `bg-black/60 backdrop-blur-sm`
- Card: `max-w-lg`, `rounded-2xl`, `max-h-[85vh] overflow-y-auto`
- Animation: Framer Motion fade + scale (`opacity: 0→1`, `scale: 0.96→1`)

---

## 8. State Management

All client state lives in Zustand (`src/store/viewerStore.ts`), persisted to
`localStorage` under the key `gallery-viewer`.

```typescript
interface ViewerStore {
  // Favourites
  favouriteIds: string[]
  toggleFavourite(photoId: string): void
  isFavourite(photoId: string): boolean

  // User-created albums
  userAlbums: UserAlbum[]
  createAlbum(title: string, eventId: string): string   // returns new album id
  addPhotosToAlbum(albumId: string, photoIds: string[]): void
  removePhotoFromAlbum(albumId: string, photoId: string): void
}
```

**`UserAlbum` type:**
```typescript
interface UserAlbum {
  id: string        // nanoid(8)
  title: string
  eventId: string
  photoIds: string[]
  createdAt: string // ISO timestamp
}
```

**Persistence:** Zustand's `persist` middleware — survives page refresh, stored
in `localStorage`. No backend required.

---

## 9. Data Model

Static mock data in `src/lib/data.ts`. In production this would be fetched from
an API / CDN-hosted JSON.

### `Event`
```typescript
interface Event {
  id: string        // URL slug, e.g. 'ceremony'
  title: string     // Display name, e.g. 'The Ceremony'
  photoCount: number
  coverUrl: string
  date: string
  likes: number
}
```

Events: `haldi` · `mehendi` · `sangeet` · `ceremony` · `reception`

### `Photo`
```typescript
interface Photo {
  id: string
  url: string
  alt: string
  event: string       // matches Event.id
  date: string
  people?: string[]   // names of tagged people
  isHighlight?: boolean  // shown in Studio Highlights strip
}
```

### `Album` (studio-created)
```typescript
interface Album {
  id: string
  title: string
  coverUrl: string
  eventId: string     // which event this belongs to
  photoIds: string[]  // explicit photo list
}
```

User-created albums use the same shape, stored in Zustand (`UserAlbum` adds `createdAt`).

---

## 10. File Structure

```
wedding-gallery-web/
├── docs/
│   └── ARCHITECTURE.md         ← this file
├── src/
│   ├── main.tsx                 ← Vite entry point
│   ├── App.tsx                  ← Router + nav switching logic
│   ├── index.css                ← Tailwind v4 @theme tokens + utility classes
│   │
│   ├── components/
│   │   ├── Navigation.tsx       ← HomeNav, EventNav (fixed top bars)
│   │   └── Sheet.tsx            ← Reusable centered modal
│   │
│   ├── pages/
│   │   ├── Home.tsx             ← Gallery home (hero + highlights + events)
│   │   ├── EventsList.tsx       ← All events overview
│   │   ├── EventDetail.tsx      ← Photo grid for one event
│   │   ├── EventPeople.tsx      ← People chips + filtered grid
│   │   ├── EventAlbums.tsx      ← Albums list for one event
│   │   ├── AlbumDetail.tsx      ← Photos inside an album
│   │   ├── EventSaved.tsx       ← Saved photos for one event
│   │   ├── Saved.tsx            ← All saved photos across events
│   │   └── PhotoViewer.tsx      ← Full-screen lightbox
│   │
│   ├── store/
│   │   └── viewerStore.ts       ← Zustand store (favourites + user albums)
│   │
│   └── lib/
│       ├── data.ts              ← Mock data (Events, Photos, Albums)
│       └── utils.ts             ← cn() helper (clsx + tailwind-merge)
│
├── package.json
├── vite.config.ts
└── tsconfig.json
```
