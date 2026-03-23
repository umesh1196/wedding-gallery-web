import { useRef } from 'react';
import { Check, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Photo } from '../../lib/data';
import { cn } from '../../lib/utils';

interface EventGridProps {
  photos: Photo[];
  isSelecting: boolean;
  selectedPhotoIds: string[];
  eventId: string;
  isFavourite: (photoId: string) => boolean;
  onToggleSelect: (photoId: string) => void;
  onLongPress?: (photoId: string) => void;
}

export function EventGrid({
  photos,
  isSelecting,
  selectedPhotoIds,
  eventId,
  isFavourite,
  onToggleSelect,
  onLongPress,
}: EventGridProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressBlocked = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, photoId: string) => {
    if (isSelecting) return;
    longPressBlocked.current = false;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    longPressTimer.current = setTimeout(() => {
      longPressBlocked.current = true;
      pointerStart.current = null;
      if (navigator.vibrate) navigator.vibrate(30);
      onLongPress?.(photoId);
    }, 500);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) cancelTimer();
  };

  const cancelTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    pointerStart.current = null;
  };

  return (
    <section className={cn('grid grid-cols-2 gap-[2px] md:grid-cols-4 md:gap-1 lg:grid-cols-5 xl:grid-cols-6', isSelecting && 'mt-2')}>
      {photos.map((photo) => (
        <div
          key={photo.id}
          // eslint-disable-next-line react/forbid-dom-props
          style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}
          className="relative col-span-1 aspect-square overflow-hidden select-none touch-manipulation"
          onPointerDown={(e) => handlePointerDown(e, photo.id)}
          onPointerMove={handlePointerMove}
          onPointerUp={cancelTimer}
          onPointerCancel={cancelTimer}
          onPointerLeave={cancelTimer}
          onContextMenu={(e) => {
            e.preventDefault();
            if (!isSelecting) onLongPress?.(photo.id);
          }}
          onClick={() => isSelecting && onToggleSelect(photo.id)}
        >
          {isSelecting ? (
            <div className="h-full w-full cursor-pointer">
              <img
                alt={photo.alt}
                draggable={false}
                className={cn(
                  'h-full w-full object-cover transition-all duration-200 pointer-events-none',
                  selectedPhotoIds.includes(photo.id)
                    ? 'brightness-[0.88] saturate-[1.05]'
                    : 'brightness-[0.72] saturate-[0.88]'
                )}
                src={photo.thumbnailUrl ?? photo.url}
                referrerPolicy="no-referrer"
              />
              <div
                className={cn(
                  'absolute inset-0 transition-colors duration-200',
                  selectedPhotoIds.includes(photo.id)
                    ? 'bg-black/10 ring-2 ring-inset ring-white'
                    : 'bg-black/8'
                )}
              />
              <div className="absolute left-2 top-2">
                {selectedPhotoIds.includes(photo.id) ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a73e8] shadow-[0_0_0_2px_rgba(255,255,255,0.92)]">
                    <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-white bg-black/18 shadow-[0_0_0_1px_rgba(0,0,0,0.18)]" />
                )}
              </div>
            </div>
          ) : (
            <Link
              to={`/photo/${photo.id}`}
              state={{ backTo: `/event/${eventId}`, backLabel: 'Photos' }}
              className="block h-full w-full"
              onClick={(e) => {
                if (longPressBlocked.current) {
                  e.preventDefault();
                  longPressBlocked.current = false;
                }
              }}
            >
              <img
                alt={photo.alt}
                draggable={false}
                className="h-full w-full object-cover photo-grade pointer-events-none"
                src={photo.thumbnailUrl ?? photo.url}
                referrerPolicy="no-referrer"
              />
              {isFavourite(photo.id) && (
                <div className="absolute bottom-1.5 right-1.5">
                  <Heart className="h-3.5 w-3.5 fill-current text-rose-accent drop-shadow-md" />
                </div>
              )}
            </Link>
          )}
        </div>
      ))}
    </section>
  );
}
