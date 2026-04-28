import { NavLink, useLocation } from 'react-router-dom';
import { Heart, Image as ImageIcon, Folder, CalendarDays, Lock, User } from 'lucide-react';
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
    { icon: Folder,       label: 'Print Albums',  path: '/albums' },
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
  const currentWedding = useSessionStore((state) => state.currentWedding);
  const currentStudio = useSessionStore((state) => state.currentStudio);
  const navigationState = readRouteState(location);
  const { backTo, backLabel, tabState } = getEventNavConfig({
    eventId,
    pathname: location.pathname,
    search: location.search,
    state: navigationState,
  });

  const brandLabel = currentWedding?.couple_name || currentStudio?.studio_name || 'Private Gallery';

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#dacdb9]/45 bg-[#f5efe4]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <span className="font-headline text-[1.85rem] font-light tracking-[-0.04em] text-[#7d5f3f]">
          {brandLabel}
        </span>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex min-w-0 items-center">
            <NavLink
              to={backTo}
              state={tabState}
              className="label whitespace-nowrap text-[#be3d2f] transition-colors hover:text-[#a53125]"
            >
              ← {backLabel}
            </NavLink>
          </div>
          <button className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d8cbb8] bg-[#f8f0e6] px-4 text-[10px] font-medium uppercase tracking-[0.22em] text-[#6b5646]">
            <Lock className="h-3.5 w-3.5" />
            Private Gallery
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dacdb9] bg-white/50 text-[#7f7367]">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function EventPageTabs({ eventId }: { eventId: string }) {
  const location = useLocation();
  const navigationState = readRouteState(location);
  const { backTo, backLabel, tabState } = getEventNavConfig({
    eventId,
    pathname: location.pathname,
    search: location.search,
    state: navigationState,
  });

  const items = [
    { label: 'Edited Photos', path: `/event/${eventId}`, enabled: true },
    { label: 'All Photos', path: '#', enabled: false },
    { label: 'Saved', path: `/event/${eventId}/saved`, enabled: true },
    { label: 'Print Albums', path: `/albums`, enabled: true },
    { label: 'People', path: `/event/${eventId}/people`, enabled: true },
  ];

  return (
    <nav className="mt-10 border-b border-[#dfd6c8]">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pb-3">
        <NavLink
          to={backTo}
          state={tabState}
          className="label pb-4 whitespace-nowrap text-[#be3d2f] transition-colors hover:text-[#a53125] md:hidden"
        >
          ← {backLabel}
        </NavLink>
        {items.map((item) =>
          item.enabled ? (
            <NavLink
              key={item.label}
              to={item.path}
              state={tabState ? { ...tabState, fromEventTabs: true } : undefined}
              end
              className={({ isActive }) =>
                cn(
                  'relative pb-4 text-[12px] uppercase tracking-[0.34em] transition-colors',
                  isActive ? 'text-[#be3d2f]' : 'text-[#9a907f] hover:text-[#241d17]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-[-4px] h-[3px] rounded-full bg-[#be3d2f]" />
                  )}
                </>
              )}
            </NavLink>
          ) : (
            <span
              key={item.label}
              className="pb-4 text-[12px] uppercase tracking-[0.34em] text-[#c2b7a6]"
            >
              {item.label}
            </span>
          )
        )}
      </div>
    </nav>
  );
}
