import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminRoute } from './AdminRoute';
import { useSessionStore } from '../../store/sessionStore';

describe('AdminRoute', () => {
  beforeEach(() => {
    useSessionStore.setState({
      mode: null,
      studioJwt: null,
      galleryToken: null,
      studioSlug: null,
      weddingSlug: null,
      currentStudio: null,
      currentWedding: null,
      loading: false,
      error: null,
    });
  });

  it('redirects unauthenticated users to the admin login screen', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin/login" element={<div>Admin Login</div>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Admin Home</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Login')).toBeInTheDocument();
  });

  it('renders admin content when a studio jwt exists', () => {
    useSessionStore.setState({
      mode: 'admin',
      studioJwt: 'studio-jwt',
      currentStudio: {
        id: 'studio-1',
        studio_name: 'Studio',
        slug: 'studio',
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin/login" element={<div>Admin Login</div>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Admin Home</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Home')).toBeInTheDocument();
  });
});
