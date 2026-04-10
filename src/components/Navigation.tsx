import { NavLink, useLocation } from 'react-router-dom';
import { Heart, Image as ImageIcon, Users, Folder, CalendarDays } from 'lucide-react';
import { cn } from '../lib/utils';
import { getEventNavConfig, readRouteState } from '../lib/navigation';
import { useSessionStore } from '../store/sessionStore';
import { ThemeToggle } from './ThemeToggle';

/**
 * HomeNav — fixed top bar for home-level pages (/, /events, /saved).
 * Always renders as a top bar. No mobile-only classes.
 */
export function HomeNav() {
  const currentStudio = useSessionStore((state) => state.currentStudio);
  const items = [
    { icon: ImageIcon,    label: 'Memories', path: '/' },
    { icon: CalendarDays, label: 'Chapters', path: '/events' },
    { icon: Folder,       label: 'Albums',  path: '/albums' },
    { icon: Heart,        label: 'Saved',   path: '/saved' },
  ];

  return (
    <>
      <header className="hidden md:flex sticky top-0 z-50 h-14 md:h-16 items-center bg-background/80 backdrop-blur-xl border-b border-foreground/5">
        {/* Left: brand */}
        <div className="flex-1 flex items-center pl-4 md:pl-8 lg:pl-12">
          <span className="label text-outline whitespace-nowrap">
            {currentStudio?.studio_name ?? 'Wedding Gallery'}
          </span>
        </div>

        {/* Center: nav links */}
        <nav className="flex items-center gap-1 md:gap-2">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 label',
                  isActive ? 'text-rose-accent' : 'text-foreground/40 hover:text-foreground/70'
                )
              }
            >
              <item.icon
                className={cn(
                  'w-4 h-4 flex-shrink-0',
                  item.label === 'Saved' && 'fill-current'
                )}
              />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right: theme toggle */}
        <div className="flex-1 flex items-center justify-end pr-4 md:pr-8 lg:pr-12">
          <ThemeToggle />
        </div>
      </header>

      <nav className="md:hidden fixed inset-x-3 bottom-3 z-50 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <div className="rounded-[1.75rem] border border-foreground/10 bg-surface-container/92 px-2 py-2 shadow-[0_-12px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="grid grid-cols-5 gap-1">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  cn(
                    'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 transition-all duration-200',
                    isActive ? 'bg-rose-accent/14 text-rose-accent' : 'text-foreground/50 active:text-foreground'
                  )
                }
              >
                <item.icon
                  className={cn(
                    'h-[18px] w-[18px] flex-shrink-0',
                    item.label === 'Saved' && 'fill-current'
                  )}
                />
                <span className="label leading-none">{item.label}</span>
              </NavLink>
            ))}
            <div className="flex min-h-14 flex-col items-center justify-center rounded-2xl">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

/**
 * EventNav — fixed top bar for event-scoped pages.
 * Left: back to events. Center: 4 event tabs. Right: spacer.
 */
export function EventNav({ eventId }: { eventId: string }) {
  const location = useLocation();
  const navigationState = readRouteState(location);
  const { backTo, backLabel, tabState } = getEventNavConfig({
    eventId,
    pathname: location.pathname,
    search: location.search,
    state: navigationState,
  });

  const items = [
    { icon: ImageIcon, label: 'Photos', path: `/event/${eventId}` },
    { icon: Users, label: 'People', path: `/event/${eventId}/people` },
    { icon: Folder, label: 'Albums', path: `/event/${eventId}/albums` },
    { icon: Heart, label: 'Saved', path: `/event/${eventId}/saved` },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 md:h-16 flex items-center bg-background/80 backdrop-blur-xl border-b border-foreground/5">
      {/* Left: back link */}
      <div className="flex-1 flex items-center pl-4 md:pl-8 lg:pl-12">
        <NavLink
          to={backTo}
          state={tabState}
          className="label text-rose-accent hover:text-rose-accent/80 transition-colors whitespace-nowrap"
        >
          ← {backLabel}
        </NavLink>
      </div>

      {/* Center: event tabs */}
      <nav className="flex items-center gap-0.5 md:gap-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            state={tabState ? { ...tabState, fromEventTabs: true } : undefined}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 px-2.5 md:px-3 py-2 rounded-lg transition-all duration-200 label',
                isActive ? 'text-rose-accent' : 'text-foreground/40 hover:text-foreground/70'
              )
            }
          >
            {() => (
              <>
                <item.icon
                  className={cn(
                    'w-4 h-4 flex-shrink-0',
                    item.label === 'Saved' && 'fill-current'
                  )}
                />
                <span className="hidden sm:inline">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Right: theme toggle */}
      <div className="flex-1 flex items-center justify-end pr-4 md:pr-8 lg:pr-12">
        <ThemeToggle />
      </div>
    </header>
  );
}
