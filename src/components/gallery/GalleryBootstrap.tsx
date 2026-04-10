import { useEffect } from 'react';
import { mapGalleryShellToStudio, mapGalleryShellToWedding } from '../../lib/api/adapters';
import { fetchGalleryBootstrap } from '../../lib/api/gallery';
import { useSessionStore } from '../../store/sessionStore';

export function GalleryBootstrap() {
  const {
    mode,
    galleryToken,
    studioSlug,
    weddingSlug,
    currentStudio,
    currentWedding,
    setCurrentStudio,
    setCurrentWedding,
    setLoading,
    setError,
    clearSession,
  } = useSessionStore();

  useEffect(() => {
    let active = true;

    if (
      mode !== 'guest' ||
      !galleryToken ||
      !studioSlug ||
      !weddingSlug ||
      (currentStudio && currentWedding)
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    fetchGalleryBootstrap(studioSlug, weddingSlug, galleryToken)
      .then((response) => {
        if (!active) return;
        setCurrentStudio(mapGalleryShellToStudio(response.data));
        setCurrentWedding(mapGalleryShellToWedding(response.data, weddingSlug));
      })
      .catch((error: Error) => {
        if (!active) return;
        clearSession();
        setError(error.message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    clearSession,
    currentStudio,
    currentWedding,
    galleryToken,
    mode,
    setCurrentStudio,
    setCurrentWedding,
    setError,
    setLoading,
    studioSlug,
    weddingSlug,
  ]);

  return null;
}
