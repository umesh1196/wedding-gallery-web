import type { Event, Photo } from './data';

export interface TimelineEvent extends Event {
  livePhotoCount: number;
  isPublished: boolean;
  isUpcoming: boolean;
}

function parseEventDate(dateLabel: string) {
  const parsed = new Date(dateLabel);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getGalleryTimeline(events: Event[], photos: Photo[], now = new Date()) {
  const timelineEvents: TimelineEvent[] = events.map((event) => {
    const livePhotoCount = photos.filter((photo) => photo.event === event.id).length;
    const eventDate = parseEventDate(event.date);
    const isUpcoming = livePhotoCount === 0 && Boolean(eventDate && eventDate.getTime() > now.getTime());
    const isPublished = livePhotoCount > 0;

    return {
      ...event,
      livePhotoCount,
      isPublished,
      isUpcoming,
    };
  });

  const publishedEvents = timelineEvents.filter((event) => event.isPublished);
  const upcomingEvents = timelineEvents.filter((event) => event.isUpcoming);
  const latestPublishedEvent = [...publishedEvents].sort((a, b) => {
    const aTime = parseEventDate(a.date)?.getTime() ?? 0;
    const bTime = parseEventDate(b.date)?.getTime() ?? 0;
    return bTime - aTime;
  })[0];

  return {
    publishedEvents,
    upcomingEvents,
    latestPublishedEvent,
    timelineEvents,
  };
}
