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

function getAspectVariant(photo: Photo) {
  if (photo.width && photo.height) {
    if (photo.height >= photo.width * 1.18) return 'portrait';
    if (photo.width >= photo.height * 1.18) return 'landscape';
  }

  return 'square';
}

function getMosaicSpanClass(photo: Photo, index: number) {
  const variant = getAspectVariant(photo);
  const patterns = {
    portrait: [
      'col-span-1 row-span-3 md:col-span-2 md:row-span-4 lg:col-span-2 lg:row-span-4',
      'col-span-1 row-span-4 md:col-span-2 md:row-span-5 lg:col-span-2 lg:row-span-5',
      'col-span-1 row-span-3 md:col-span-2 md:row-span-4 lg:col-span-2 lg:row-span-4',
    ],
    landscape: [
      'col-span-1 row-span-2 md:col-span-3 md:row-span-3 lg:col-span-4 lg:row-span-3',
      'col-span-2 row-span-2 md:col-span-4 md:row-span-3 lg:col-span-4 lg:row-span-3',
      'col-span-1 row-span-2 md:col-span-3 md:row-span-2 lg:col-span-3 lg:row-span-2',
    ],
    square: [
      'col-span-1 row-span-2 md:col-span-2 md:row-span-3 lg:col-span-2 lg:row-span-3',
      'col-span-1 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2',
      'col-span-2 row-span-2 md:col-span-3 md:row-span-3 lg:col-span-3 lg:row-span-3',
      'col-span-1 row-span-3 md:col-span-2 md:row-span-4 lg:col-span-2 lg:row-span-4',
    ],
  } as const;

  const sequence = patterns[variant];
  return sequence[index % sequence.length];
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
  const getGridImageSrc = (photo: Photo) => photo.url || photo.thumbnailUrl || '';

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
    <section
      className={cn(
        'grid grid-flow-dense grid-cols-2 auto-rows-[88px] gap-[3px] md:grid-cols-6 md:auto-rows-[92px] lg:grid-cols-8 lg:auto-rows-[110px]',
        isSelecting && 'mt-2'
      )}
    >
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}
          className={cn(
            'relative overflow-hidden rounded-[1.1rem] bg-[#eadfce] select-none touch-manipulation md:rounded-[1.35rem]',
            getMosaicSpanClass(photo, index)
          )}
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
            <div className="relative h-full cursor-pointer">
              <img
                alt={photo.alt}
                draggable={false}
                className={cn(
                  'block h-full w-full object-cover transition-all duration-200 pointer-events-none',
                  selectedPhotoIds.includes(photo.id)
                    ? 'brightness-[0.88] saturate-[1.05]'
                    : 'brightness-[0.72] saturate-[0.88]'
                )}
                src={getGridImageSrc(photo)}
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
                    <Check className="h-3.5 w-3.5 stroke-[3] text-white" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-white bg-black/18 shadow-[0_0_0_1px_rgba(0,0,0,0.18)]" />
                )}
              </div>
            </div>
          ) : (
            <Link
              to={`/photo/${photo.id}?event=${encodeURIComponent(eventId)}`}
              state={{ backTo: `/event/${eventId}`, backLabel: 'Photos', eventId }}
              className="group block h-full"
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
                className="block h-full w-full bg-[#eadfce] object-cover photo-grade pointer-events-none transition-transform duration-700 group-hover:scale-[1.035]"
                src={getGridImageSrc(photo)}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,249,241,0.02),rgba(40,29,20,0.08)_72%,rgba(40,29,20,0.18))] opacity-90 transition-opacity duration-300 group-hover:opacity-70" />
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
