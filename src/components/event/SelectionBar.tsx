import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Check, CheckCheck, Download, Heart, Plus, X } from 'lucide-react';

interface SelectionBarProps {
  open: boolean;
  selectedCount: number;
  allSelected: boolean;
  onExit: () => void;
  onToggleSelectAll: () => void;
  onDownload: () => void;
  onSave: () => void;
  onAddToAlbum: () => void;
}

export function SelectionBar({
  open,
  selectedCount,
  allSelected,
  onExit,
  onToggleSelectAll,
  onDownload,
  onSave,
  onAddToAlbum,
}: SelectionBarProps) {
  return (
    <>
      {open && (
        <div className="wrap flex items-center justify-between py-4">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-white/60 transition-colors hover:text-white"
            aria-label="Back from selection mode"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="label">Back</span>
          </button>
          <span className="label text-white">{selectedCount} chosen</span>
          <div className="w-6" />
        </div>
      )}

      <AnimatePresence>
        {open && selectedCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="mobile-safe-bottom fixed inset-x-0 bottom-0 z-[60] px-3 pb-2 md:bottom-8 md:left-1/2 md:right-auto md:w-auto md:min-w-[440px] md:-translate-x-1/2 md:px-0 md:pb-0"
          >
            <div className="mx-auto max-w-2xl rounded-[1rem] border border-white/8 bg-black/24 px-3 pb-1.5 pt-2.5 backdrop-blur-xl md:rounded-xl md:bg-surface-container/62 md:px-4 md:py-3 md:shadow-2xl">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1a73e8]">
                  <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
                </div>
                <span className="label text-white/92">{selectedCount} selected</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar md:flex-wrap">
                <button
                  onClick={onToggleSelectAll}
                  title={allSelected ? 'Deselect all' : 'Select all'}
                  aria-label={allSelected ? 'Deselect all' : 'Select all'}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/7 text-white/82 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {allSelected ? <X className="h-4.5 w-4.5" /> : <CheckCheck className="h-4.5 w-4.5" />}
                </button>
                <button
                  onClick={onDownload}
                  title="Download selected"
                  aria-label="Download selected"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/7 text-white/82 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Download className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={onSave}
                  title="Save to my moments (private)"
                  aria-label="Save to my moments"
                  className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full bg-white/7 px-3 text-white/82 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Heart className="h-4 w-4 flex-shrink-0" />
                  <span className="label">Save to mine</span>
                </button>
                <button
                  onClick={onAddToAlbum}
                  title="Add to album to share"
                  aria-label="Add to album"
                  className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full bg-rose-accent/92 px-3 text-white transition-colors hover:bg-rose-accent"
                >
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  <span className="label">Add to album</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
