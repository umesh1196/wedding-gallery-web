import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import EventsList from './pages/EventsList';
import PhotoViewer from './pages/PhotoViewer';
import Saved from './pages/Saved';
import Albums from './pages/Albums';
import AlbumDetail from './pages/AlbumDetail';
import EventSaved from './pages/EventSaved';
import EventPeople from './pages/EventPeople';
import { HomeNav, EventNav } from './components/Navigation';
import { PageTransition } from './components/PageTransition';
import { SessionBootstrap } from './components/admin/SessionBootstrap';
import { AdminRoute } from './components/admin/AdminRoute';
import { GalleryBootstrap } from './components/gallery/GalleryBootstrap';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function AppContent() {
  const location = useLocation();
  const isPhotoViewer = location.pathname.startsWith('/photo/');
  const isEventPage = location.pathname.startsWith('/event/');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isGalleryLandingPage = location.pathname === '/';
  const isPhotosLandingPage = location.pathname === '/events';
  const showHomeNav =
    !isPhotoViewer && !isEventPage && !isAdminPage && !isGalleryLandingPage && !isPhotosLandingPage;
  const eventId = isEventPage ? location.pathname.split('/')[2] : null;

  return (
    <div className="min-h-screen bg-background">
      <SessionBootstrap />
      <GalleryBootstrap />
      {showHomeNav && <HomeNav />}
      {!isPhotoViewer && isEventPage && eventId && !isAdminPage && <EventNav eventId={eventId} />}

      <AnimatePresence mode="wait" initial={false}>
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/event/:id/people" element={<EventPeople />} />
            <Route path="/event/:id/albums" element={<Navigate to="/albums" replace />} />
            <Route path="/albums/:albumId" element={<AlbumDetail />} />
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
