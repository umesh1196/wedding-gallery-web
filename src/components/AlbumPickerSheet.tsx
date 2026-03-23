import { Plus, X } from 'lucide-react';
import type { UserAlbum } from '../store/viewerStore';
import { cn } from '../lib/utils';
import { Sheet } from './Sheet';

interface AlbumPickerSheetProps {
  open: boolean;
  onClose: () => void;
  photoCount: number;
  albums: UserAlbum[];
  selectedAlbumIds: string[];
  showNewAlbumInput: boolean;
  newAlbumTitle: string;
  emptyMessage: string;
  onToggleAlbum: (albumId: string) => void;
  onShowNewAlbumInput: () => void;
  onNewAlbumTitleChange: (value: string) => void;
  onCreateAlbum: () => void;
  onSubmit: () => void;
}

export function AlbumPickerSheet({
  open,
  onClose,
  photoCount,
  albums,
  selectedAlbumIds,
  showNewAlbumInput,
  newAlbumTitle,
  emptyMessage,
  onToggleAlbum,
  onShowNewAlbumInput,
  onNewAlbumTitleChange,
  onCreateAlbum,
  onSubmit,
}: AlbumPickerSheetProps) {
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex items-center justify-between px-6 pt-6 pb-5 md:px-8 md:pt-8">
        <div>
          <h2 className="font-headline text-xl italic font-light tracking-tight text-foreground md:text-2xl">
            Add {photoCount === 1 ? 'photo' : `${photoCount} photos`} to...
          </h2>
          <p className="mt-2 max-w-sm font-body text-xs leading-relaxed text-foreground/56 md:text-sm">
            Choose one of your personal albums below. Studio albums stay read-only so the original curation remains untouched.
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-foreground/5"
        >
          <X className="h-5 w-5 text-outline" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-8">
        {showNewAlbumInput ? (
          <div className="mb-6 flex items-center gap-3">
            <input
              autoFocus
              value={newAlbumTitle}
              onChange={(event) => onNewAlbumTitleChange(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && onCreateAlbum()}
              placeholder="Album name..."
              className="flex-1 rounded border border-foreground/10 bg-foreground/5 px-4 py-3 text-foreground label uppercase tracking-widest outline-none placeholder:text-foreground/20"
            />
            <button
              onClick={onCreateAlbum}
              className="rounded bg-rose-accent px-4 py-3 text-white label transition-colors hover:bg-rose-accent/90"
            >
              Create
            </button>
          </div>
        ) : (
          <button
            onClick={onShowNewAlbumInput}
            className="mb-6 flex min-h-[56px] w-full items-center rounded border border-dashed border-rose-accent/40 px-5 transition-colors hover:bg-foreground/5"
          >
            <Plus className="mr-3 h-5 w-5 text-rose-accent" />
            <span className="label font-bold text-rose-accent">Create a personal album</span>
          </button>
        )}

        <div className="space-y-3 pb-6">
          {albums.map((album) => {
            const isChecked = selectedAlbumIds.includes(album.id);

            return (
              <button
                key={album.id}
                onClick={() => onToggleAlbum(album.id)}
                className="flex h-[60px] w-full items-center justify-between rounded px-1 py-2 transition-colors hover:bg-foreground/3"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border transition-colors',
                      isChecked ? 'border-rose-accent bg-rose-accent' : 'border-foreground/20'
                    )}
                  >
                    {isChecked && (
                      <svg className="h-3 w-3 text-foreground" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-headline text-lg leading-tight text-foreground">{album.title}</p>
                    <p className="label text-outline">{album.photoIds.length} photos</p>
                  </div>
                </div>
                {album.coverUrl ? (
                  <img
                    src={album.coverUrl}
                    className="h-10 w-10 rounded object-cover grayscale-[0.3]"
                    alt={album.title}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded border border-foreground/10 bg-foreground/5">
                    <Plus className="h-4 w-4 text-foreground/20" />
                  </div>
                )}
              </button>
            );
          })}

          {albums.length === 0 && (
            <div className="rounded border border-foreground/6 bg-foreground/[0.02] px-4 py-4">
              <p className="font-body text-sm text-outline">{emptyMessage}</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-foreground/5 px-6 py-5 md:px-8">
        <button
          onClick={onSubmit}
          disabled={selectedAlbumIds.length === 0}
          className={cn(
            'flex h-12 w-full items-center justify-center rounded label font-bold transition-opacity',
            selectedAlbumIds.length > 0 ? 'bg-rose-accent text-white' : 'bg-foreground/10 text-foreground/30'
          )}
        >
          {selectedAlbumIds.length > 0
            ? `Add to ${selectedAlbumIds.length} Personal Album${selectedAlbumIds.length > 1 ? 's' : ''}`
            : 'Choose a personal album'}
        </button>
      </div>
    </Sheet>
  );
}
