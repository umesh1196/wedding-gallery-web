import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import EventsList from './pages/EventsList';
import PhotoViewer from './pages/PhotoViewer';
import Saved from './pages/Saved';
import Albums from './pages/Albums';
import EventAlbums from './pages/EventAlbums';
import AlbumDetail from './pages/AlbumDetail';
import EventSaved from './pages/EventSaved';
import EventPeople from './pages/EventPeople';
import { HomeNav, EventNav } from './components/Navigation';
import { PageTransition } from './components/PageTransition';

function AppContent() {
  const location = useLocation();
  const isPhotoViewer = location.pathname.startsWith('/photo/');
  const isEventPage = location.pathname.startsWith('/event/');
  const showHomeNav = !isPhotoViewer && !isEventPage;
  const eventId = isEventPage ? location.pathname.split('/')[2] : null;

  return (
    <div className="min-h-screen bg-background">
      {showHomeNav && <HomeNav />}
      {!isPhotoViewer && isEventPage && eventId && <EventNav eventId={eventId} />}

      <AnimatePresence mode="wait" initial={false}>
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/event/:id/people" element={<EventPeople />} />
            <Route path="/event/:id/albums" element={<EventAlbums />} />
            <Route path="/event/:id/albums/:albumId" element={<AlbumDetail />} />
            <Route path="/event/:id/saved" element={<EventSaved />} />
            <Route path="/photo/:id" element={<PhotoViewer />} />
            <Route path="/saved" element={<Saved />} />
          </Routes>
        </PageTransition>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
