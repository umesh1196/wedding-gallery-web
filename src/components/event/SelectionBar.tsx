import { ArrowLeft, Check, CheckCheck, Download, Heart, Plus, X } from 'lucide-react';

interface SelectionBarProps {
  open: boolean;
  selectedCount: number;
  allSelected: boolean;
  onExit: () => void;
  onToggleSelectAll: () => void;
  onDownload: () => void;
  onLike: () => void;
  onAddToAlbum: () => void;
}

export function SelectionBar({
  open,
  selectedCount,
  allSelected,
  onExit,
  onToggleSelectAll,
  onDownload,
  onLike,
  onAddToAlbum,
}: SelectionBarProps) {
  return (
    open ? (
      <div className="sticky top-16 z-40 px-4 pb-3 pt-3 sm:px-6 lg:px-10 md:top-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="rounded-[1.25rem] border border-[#d8cbb8] bg-[#f8f0e6]/95 px-3 py-3 shadow-[0_18px_40px_rgba(70,54,35,0.12)] backdrop-blur-xl md:px-4">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <button
                onClick={onExit}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d8cbb8] bg-white/70 px-3 text-[#6b5646] transition-colors hover:bg-white"
                aria-label="Back from selection mode"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="label">Back</span>
              </button>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#d8cbb8] bg-white/55 px-3 py-2">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1a73e8]">
                  <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
                </div>
                <span className="label text-[#241d17]">{selectedCount} selected</span>
              </div>

              <div className="ml-0 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar md:ml-2">
                <button
                  onClick={onToggleSelectAll}
                  title={allSelected ? 'Deselect all' : 'Select all'}
                  aria-label={allSelected ? 'Deselect all' : 'Select all'}
                  className="inline-flex h-10 flex-shrink-0 items-center justify-center rounded-full border border-[#d8cbb8] bg-white/55 px-3 text-[#6b5646] transition-colors hover:bg-white"
                >
                  {allSelected ? <X className="h-4.5 w-4.5" /> : <CheckCheck className="h-4.5 w-4.5" />}
                </button>
                <button
                  onClick={onDownload}
                  title="Download selected"
                  aria-label="Download selected"
                  className="inline-flex h-10 flex-shrink-0 items-center gap-2 rounded-full border border-[#d8cbb8] bg-white/55 px-3 text-[#6b5646] transition-colors hover:bg-white"
                >
                  <Download className="h-4 w-4" />
                  <span className="label">Download</span>
                </button>
                <button
                  onClick={onLike}
                  title="Like selected photos"
                  aria-label="Like selected photos"
                  className="inline-flex h-10 flex-shrink-0 items-center gap-2 rounded-full border border-[#d8cbb8] bg-white/55 px-3 text-[#6b5646] transition-colors hover:bg-white"
                >
                  <Heart className="h-4 w-4" />
                  <span className="label">Like</span>
                </button>
                <button
                  onClick={onAddToAlbum}
                  title="Add to print album"
                  aria-label="Add to print album"
                  className="inline-flex h-10 flex-shrink-0 items-center gap-2 rounded-full bg-rose-accent px-3 text-white transition-colors hover:bg-rose-accent/90"
                >
                  <Plus className="h-4 w-4" />
                  <span className="label">Add to print album</span>
                </button>
              </div>

              <button
                onClick={onExit}
                title="Exit selection"
                aria-label="Exit selection"
                className="ml-auto inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#d8cbb8] bg-white/70 text-[#6b5646] transition-colors hover:bg-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null
  );
}
