import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginStudio } from '../../lib/api/admin';
import { useSessionStore } from '../../store/sessionStore';
import { useFeedback } from '../../components/FeedbackProvider';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showFeedback } = useFeedback();
  const { setAdminSession, setCurrentStudio, setLoading, setError, loading, error } = useSessionStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectTo = (location.state as { from?: string } | null)?.from || '/admin';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await loginStudio(email, password);
      setAdminSession({
        studioJwt: response.data.token,
        studioSlug: response.data.studio.slug,
      });
      setCurrentStudio(response.data.studio);

      showFeedback({
        title: 'Admin session ready',
        message: `Welcome back to ${response.data.studio.studio_name}.`,
      });

      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
          <section className="hidden rounded-[2rem] border border-foreground/8 bg-[radial-gradient(circle_at_top,_rgba(201,80,106,0.18),_transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-8 lg:block">
            <p className="label text-outline">Studio Control</p>
            <h1 className="mt-4 font-headline text-5xl font-light leading-[1.02] text-foreground">
              Bring the gallery online, one chapter at a time.
            </h1>
            <p className="mt-5 max-w-2xl font-body text-base leading-relaxed text-foreground/72">
              This admin surface will become the calm operational layer for studio branding,
              weddings, chapters, uploads, and curated albums. We are starting with the auth shell
              so every next integration step has a real session to build on.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.4rem] border border-foreground/8 bg-black/12 p-5">
                <p className="label text-rose-accent">Next up</p>
                <p className="mt-2 font-body text-sm text-foreground/72">
                  Studio settings, wedding management, and chapter controls will plug into this
                  shell next.
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-foreground/8 bg-black/12 p-5">
                <p className="label text-rose-accent">Auth model</p>
                <p className="mt-2 font-body text-sm text-foreground/72">
                  Admin uses JWT via the backend auth endpoints. Guest gallery access stays on its
                  own token path.
                </p>
              </div>
            </div>
          </section>

          <section className="soft-panel rounded-[2rem] p-6 md:p-8">
            <p className="label text-outline">Studio Admin</p>
            <h2 className="mt-3 font-headline text-[2.35rem] font-light text-foreground md:text-5xl">
              Sign in
            </h2>
            <p className="mt-3 max-w-lg font-body text-sm leading-relaxed text-foreground/70">
              Use your studio account to manage weddings, chapters, uploads, and curated delivery.
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="label text-foreground/60">Email</span>
                <input
                  className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="studio@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="block">
                <span className="label text-foreground/60">Password</span>
                <input
                  className="mt-2 w-full rounded-[1.15rem] border border-foreground/10 bg-black/14 px-4 py-3 text-base text-foreground outline-none transition focus:border-rose-accent/40"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </label>

              {error && (
                <div className="rounded-[1rem] border border-rose-accent/25 bg-rose-accent/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              )}

              <button
                className="w-full rounded-full border border-rose-accent/30 bg-rose-accent px-4 py-3 font-label text-xs uppercase tracking-[0.18rem] text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
