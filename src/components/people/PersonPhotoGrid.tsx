import { Check, Heart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { Photo } from '../../lib/data';

interface PersonPhotoGridProps {
  photos: Photo[];
  isSelecting: boolean;
  selectedPhotos: string[];
  peopleViewPath: string;
  selectedPerson: string;
  isFavourite: (photoId: string) => boolean;
  onToggleSelect: (photoId: string) => void;
  onToggleFavourite: (photo: Photo) => void;
  onAddToAlbum: (photoId: string) => void;
}

export function PersonPhotoGrid({
  photos,
  isSelecting,
  selectedPhotos,
  peopleViewPath,
  selectedPerson,
  isFavourite,
  onToggleSelect,
  onToggleFavourite,
  onAddToAlbum,
}: PersonPhotoGridProps) {
  return (
    <>
      <section className="wrap mb-2">
        <p className="label text-outline">
          {isSelecting
            ? `${selectedPhotos.length} chosen`
            : `${photos.length} photos with ${selectedPerson}`}
        </p>
      </section>

      <section className="wrap pb-6 md:pb-10">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {photos.map((photo) => {
            const isSelected = selectedPhotos.includes(photo.id);

            return (
              <div
                key={photo.id}
                className="overflow-hidden rounded-[1.35rem] border border-foreground/6 bg-surface"
              >
                <div
                  className="relative aspect-[0.95] overflow-hidden"
                  onClick={() => isSelecting && onToggleSelect(photo.id)}
                >
                  {isSelecting ? (
                    <>
                      <img
                        alt={photo.alt}
                        className={cn(
                          'h-full w-full object-cover transition-all duration-200',
                          isSelected ? 'brightness-[0.9]' : 'brightness-[0.72] saturate-[0.88]'
                        )}
                        src={photo.thumbnailUrl ?? photo.url}
                        referrerPolicy="no-referrer"
                      />
                      <div
                        className={cn(
                          'absolute inset-0 transition-colors duration-200',
                          isSelected ? 'bg-black/10 ring-2 ring-inset ring-white' : 'bg-black/8'
                        )}
                      />
                      <div className="absolute top-2 left-2">
                        {isSelected ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a73e8] shadow-[0_0_0_2px_rgba(255,255,255,0.92)]">
                            <Check className="h-3.5 w-3.5 text-foreground stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-white bg-black/18 shadow-[0_0_0_1px_rgba(0,0,0,0.18)]" />
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        to={`/photo/${photo.id}`}
                        state={{ backTo: peopleViewPath, backLabel: 'People' }}
                        className="block h-full w-full"
                      >
                        <img
                          alt={photo.alt}
                          className="h-full w-full object-cover photo-grade"
                          src={photo.thumbnailUrl ?? photo.url}
                          referrerPolicy="no-referrer"
                        />
                      </Link>
                      {isFavourite(photo.id) && (
                        <div className="absolute right-2 top-2">
                          <Heart className="h-4 w-4 fill-current text-rose-accent drop-shadow-md" />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {!isSelecting && (
                  <div className="flex items-center justify-between gap-2 px-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-body text-sm text-foreground/88">{photo.alt}</p>
                      <p className="mt-1 label text-outline">{photo.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleFavourite(photo)}
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                          isFavourite(photo.id)
                            ? 'bg-rose-accent/14 text-rose-accent'
                            : 'bg-foreground/6 text-foreground/72 hover:bg-foreground/10 hover:text-foreground'
                        )}
                        aria-label={isFavourite(photo.id) ? 'Unsave photo' : 'Save photo'}
                      >
                        <Heart className={cn('h-4 w-4', isFavourite(photo.id) && 'fill-current')} />
                      </button>
                      <button
                        onClick={() => onAddToAlbum(photo.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/6 text-foreground/72 transition-colors hover:bg-foreground/10 hover:text-foreground"
                        aria-label="Add photo to album"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
