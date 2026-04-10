import { useEffect } from 'react';
import { fetchCurrentStudio } from '../../lib/api/admin';
import { useSessionStore } from '../../store/sessionStore';

export function SessionBootstrap() {
  const {
    mode,
    studioJwt,
    currentStudio,
    setCurrentStudio,
    setLoading,
    setError,
    clearSession,
  } = useSessionStore();

  useEffect(() => {
    let active = true;

    if (mode !== 'admin' || !studioJwt || currentStudio) return;

    setLoading(true);
    setError(null);

    fetchCurrentStudio(studioJwt)
      .then((response) => {
        if (!active) return;
        setCurrentStudio(response.data.studio);
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
  }, [clearSession, currentStudio, mode, setCurrentStudio, setError, setLoading, studioJwt]);

  return null;
}

