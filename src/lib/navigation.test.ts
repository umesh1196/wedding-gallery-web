import { describe, expect, it } from 'vitest';
import {
  getEventNavConfig,
  getHomeBackState,
  isHomeLevelBackTarget,
  toBackState,
  type GalleryRouteState,
} from './navigation';

describe('navigation helpers', () => {
  it('identifies home-level back targets', () => {
    expect(isHomeLevelBackTarget('/albums')).toBe(true);
    expect(isHomeLevelBackTarget('/saved')).toBe(true);
    expect(isHomeLevelBackTarget('/event/haldi')).toBe(false);
    expect(isHomeLevelBackTarget('/photo/h1')).toBe(false);
    expect(isHomeLevelBackTarget(undefined)).toBe(false);
  });

  it('returns home back state when present', () => {
    expect(getHomeBackState({ backTo: '/albums', backLabel: 'Albums' })).toEqual({
      backTo: '/albums',
      backLabel: 'Albums',
    });
  });

  it('falls back to events when no home back state exists', () => {
    expect(getHomeBackState({ backTo: '/event/haldi', backLabel: 'Photos' })).toEqual({
      backTo: '/events',
      backLabel: 'Events',
    });
  });

  it('creates a concrete back state', () => {
    expect(toBackState('/saved', 'Saved')).toEqual({ backTo: '/saved', backLabel: 'Saved' });
  });
});

describe('getEventNavConfig', () => {
  const homeState: GalleryRouteState = { backTo: '/albums', backLabel: 'Albums' };

  it('returns to home source from the event root page', () => {
    expect(
      getEventNavConfig({
        eventId: 'haldi',
        pathname: '/event/haldi',
        search: '',
        state: homeState,
      })
    ).toEqual({
      backTo: '/albums',
      backLabel: 'Albums',
      tabState: { backTo: '/albums', backLabel: 'Albums' },
    });
  });

  it('returns to the event root from event subpages opened via tabs', () => {
    expect(
      getEventNavConfig({
        eventId: 'haldi',
        pathname: '/event/haldi/albums',
        search: '',
        state: { ...homeState, fromEventTabs: true },
      })
    ).toEqual({
      backTo: '/event/haldi',
      backLabel: 'Photos',
      tabState: { backTo: '/albums', backLabel: 'Albums' },
    });
  });

  it('returns to the home source from grouped event albums opened directly', () => {
    expect(
      getEventNavConfig({
        eventId: 'haldi',
        pathname: '/event/haldi/albums',
        search: '',
        state: homeState,
      })
    ).toEqual({
      backTo: '/albums',
      backLabel: 'Albums',
      tabState: { backTo: '/albums', backLabel: 'Albums' },
    });
  });

  it('returns to the default people page from a focused people view', () => {
    expect(
      getEventNavConfig({
        eventId: 'haldi',
        pathname: '/event/haldi/people',
        search: '?person=Shruti',
        state: { backTo: '/', backLabel: 'Photos' },
      })
    ).toEqual({
      backTo: '/event/haldi/people',
      backLabel: 'People',
      tabState: { backTo: '/', backLabel: 'Photos' },
    });
  });

  it('falls back to events when there is no source context on the event root', () => {
    expect(
      getEventNavConfig({
        eventId: 'haldi',
        pathname: '/event/haldi',
        search: '',
        state: null,
      })
    ).toEqual({
      backTo: '/events',
      backLabel: 'Events',
      tabState: undefined,
    });
  });
});
