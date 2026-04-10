import type { Location } from 'react-router-dom';

export interface GalleryRouteState {
  backTo?: string;
  backLabel?: string;
  fromEventTabs?: boolean;
  eventId?: string;
}

export interface GalleryBackState {
  backTo: string;
  backLabel: string;
}

export interface EventNavConfig {
  backTo: string;
  backLabel: string;
  tabState?: GalleryBackState;
}

export function readRouteState(location: Location): GalleryRouteState | null {
  return (location.state as GalleryRouteState | null) ?? null;
}

export function isHomeLevelBackTarget(backTo?: string) {
  return Boolean(backTo && !backTo.startsWith('/event/') && !backTo.startsWith('/photo/'));
}

export function getHomeBackState(state: GalleryRouteState | null, fallback = '/events', label = 'Events') {
  if (isHomeLevelBackTarget(state?.backTo)) {
    return {
      backTo: state?.backTo ?? fallback,
      backLabel: state?.backLabel ?? label,
    };
  }

  return {
    backTo: fallback,
    backLabel: label,
  };
}

export function toBackState(backTo: string, backLabel: string): GalleryBackState {
  return { backTo, backLabel };
}

export function getEventNavConfig(input: {
  eventId: string;
  pathname: string;
  search: string;
  state: GalleryRouteState | null;
}): EventNavConfig {
  const { eventId, pathname, search, state } = input;
  const isFocusedPeoplePage =
    pathname === `/event/${eventId}/people` && new URLSearchParams(search).has('person');
  const isEventSavedPage = pathname === `/event/${eventId}/saved`;
  const isEventAlbumsPage = pathname === `/event/${eventId}/albums`;
  const isEventRootPage = pathname === `/event/${eventId}`;
  const hasHomeLevelBackTarget = isHomeLevelBackTarget(state?.backTo);
  const { backTo: homeBackTo, backLabel: homeBackLabel } = getHomeBackState(state);
  const cameFromEventTabs = Boolean(state?.fromEventTabs);
  const shouldReturnToHomeSource =
    hasHomeLevelBackTarget && ((isEventSavedPage || isEventAlbumsPage) && !cameFromEventTabs);

  const backTo = isFocusedPeoplePage
    ? `/event/${eventId}/people`
    : isEventRootPage
      ? homeBackTo
      : shouldReturnToHomeSource
        ? homeBackTo
        : `/event/${eventId}`;
  const backLabel = isFocusedPeoplePage
    ? 'People'
    : isEventRootPage
      ? homeBackLabel
      : shouldReturnToHomeSource
        ? homeBackLabel
        : 'Photos';

  return {
    backTo,
    backLabel,
    tabState: hasHomeLevelBackTarget ? toBackState(homeBackTo, homeBackLabel) : undefined,
  };
}
