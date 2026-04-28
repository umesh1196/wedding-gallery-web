import { Lock, Plus, X } from 'lucide-react';
import type { PickerAlbum } from '../hooks/useAlbumPicker';
import { cn } from '../lib/utils';
import { Sheet } from './Sheet';

interface AlbumPickerSheetProps {
  open: boolean;
  onClose: () => void;
  photoCount: number;
  albums: PickerAlbum[];
  loading?: boolean;
  selectedAlbumIds: string[];
  emptyMessage: string;
  onToggleAlbum: (albumId: string) => void;
  onSubmit: () => void | Promise<void>;
}

export function AlbumPickerSheet({
  open,
  onClose,
  photoCount,
  albums,
  loading = false,
  selectedAlbumIds,
  emptyMessage,
  onToggleAlbum,
  onSubmit,
}: AlbumPickerSheetProps) {
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex items-center justify-between px-6 pt-6 pb-5 md:px-8 md:pt-8">
        <div>
          <h2 className="font-headline text-xl italic font-light tracking-tight text-foreground md:text-2xl">
            Add {photoCount === 1 ? 'photo' : `${photoCount} photos`} to print album
          </h2>
          <p className="mt-2 max-w-sm font-body text-xs leading-relaxed text-foreground/56 md:text-sm">
            Choose one of the print albums prepared for this wedding. Each one has a hard selection limit and can span moments from every chapter.
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
        <div className="space-y-3 pb-6">
          {albums.map((album) => {
            const isChecked = selectedAlbumIds.includes(album.id);
            const disabled = album.locked || album.full;

            return (
              <button
                key={album.id}
                onClick={() => !disabled && onToggleAlbum(album.id)}
                className={cn(
                  'flex min-h-[76px] w-full items-center justify-between rounded-[1.1rem] border px-4 py-3 text-left transition-colors',
                  disabled
                    ? 'cursor-not-allowed border-foreground/8 bg-foreground/[0.02] opacity-70'
                    : 'border-foreground/8 bg-foreground/[0.03] hover:bg-foreground/[0.05]',
                  isChecked && !disabled && 'border-rose-accent/40 bg-rose-accent/8'
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border transition-colors',
                      isChecked ? 'border-rose-accent bg-rose-accent' : 'border-foreground/20'
                    )}
                  >
                    {isChecked && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-headline text-lg leading-tight text-foreground">{album.title}</p>
                    <p className="mt-1 label text-outline">
                      {album.photoCount} selected · {album.selectionLimit} max
                    </p>
                    <p className="mt-1 font-body text-xs text-foreground/60">
                      {album.locked
                        ? 'Locked by studio'
                        : album.full
                          ? 'Selection limit reached'
                          : `${album.remainingCount} remaining`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {album.locked ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-foreground/10 px-3 py-1.5">
                      <Lock className="h-3.5 w-3.5 text-outline" />
                      <span className="label text-outline">Locked</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-foreground/10 bg-white/60 px-3 py-1.5">
                      <Plus className="h-3.5 w-3.5 text-rose-accent" />
                      <span className="label text-foreground/70">{album.remainingCount}</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {!loading && albums.length === 0 && (
            <div className="rounded border border-foreground/6 bg-foreground/[0.02] px-4 py-4">
              <p className="font-body text-sm text-outline">{emptyMessage}</p>
            </div>
          )}

          {loading && (
            <div className="rounded border border-foreground/6 bg-foreground/[0.02] px-4 py-4">
              <p className="font-body text-sm text-outline">Loading print albums…</p>
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
            ? `Add to ${selectedAlbumIds.length} Print Album${selectedAlbumIds.length > 1 ? 's' : ''}`
            : 'Choose a print album'}
        </button>
      </div>
    </Sheet>
  );
}
