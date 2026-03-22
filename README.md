# Wedding Gallery Web

A responsive web gallery for Shruti & Umesh's wedding, built with React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Zustand, and Framer Motion.

Dark editorial design — full-width, mobile-first, desktop-ready.

---

## Getting Started

**Prerequisites:** Node.js 18+, npm

```bash
# 1. Clone the repo
git clone https://github.com/umesh1196/wedding-gallery-web.git
cd wedding-gallery-web

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 3001 |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (Vitest) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| State | Zustand 5 (persisted to localStorage) |
| Animation | Framer Motion (`motion/react`) |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── components/
│   ├── home/          # HomeHero, HighlightStrip, EventChapters, CollectionEntryCard
│   ├── event/         # EventHero, EventGrid, SelectionBar
│   ├── viewer/        # ViewerHeader, ViewerActions, ViewerDetails
│   ├── people/        # PeopleStrip, SelectedPersonHero, PersonPhotoGrid
│   ├── Navigation.tsx # HomeNav (top bar + mobile pill nav) + EventNav
│   ├── Sheet.tsx      # Reusable centered modal
│   └── ...
├── pages/
│   ├── Home.tsx
│   ├── EventsList.tsx
│   ├── EventDetail.tsx
│   ├── EventPeople.tsx
│   ├── EventAlbums.tsx
│   ├── AlbumDetail.tsx
│   ├── Albums.tsx
│   ├── EventSaved.tsx
│   ├── Saved.tsx
│   └── PhotoViewer.tsx
├── store/
│   └── viewerStore.ts  # Zustand: favourites + user albums
└── lib/
    ├── data.ts          # Mock events, photos, albums
    ├── galleryTimeline.ts
    ├── eventEditorial.ts
    ├── navigation.ts
    └── download.ts
```

---

## Key Features

- **Browse by event** — Haldi, Mehendi, Sangeet, Ceremony, Reception
- **Save favourites** — private personal collection, persisted in localStorage
- **Albums** — studio-curated albums + user-created albums; share via copy link or WhatsApp
- **Photo viewer** — full-screen lightbox, keyboard navigation (← →), touch swipe, auto-hiding chrome
- **Selection mode** — select multiple photos, save to favourites or add to album in one action
- **People tab** — browse photos filtered by tagged person
- **Responsive** — mobile bottom nav pill, desktop sticky top bar

---

## Documentation

- [Architecture & component reference](docs/ARCHITECTURE.md)
