import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '../../store/sessionStore';

export function AdminRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const studioJwt = useSessionStore((state) => state.studioJwt);

  if (!studioJwt) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

