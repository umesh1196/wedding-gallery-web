import { Download, Heart, Info, Plus, Share2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ViewerActionsProps {
  liked: boolean;
  showDetails: boolean;
  onDownload: () => void;
  onShare: () => void;
  onToggleFavourite: () => void;
  onAddToAlbum: () => void;
  onToggleDetails: () => void;
}

export function ViewerActions({
  liked,
  showDetails,
  onDownload,
  onShare,
  onToggleFavourite,
  onAddToAlbum,
  onToggleDetails,
}: ViewerActionsProps) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={onDownload}
        className="flex h-9 w-9 items-center justify-center rounded-full text-white/68 transition-colors hover:bg-white/8 hover:text-white"
        aria-label="Save photo"
      >
        <Download className="h-5 w-5" />
      </button>

      <button
        onClick={onShare}
        className="flex h-9 w-9 items-center justify-center rounded-full text-white/68 transition-colors hover:bg-white/8 hover:text-white"
        aria-label="Share photo"
      >
        <Share2 className="h-5 w-5" />
      </button>

      <button
        onClick={onToggleFavourite}
        className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/8"
        aria-label={liked ? 'Remove from favourites' : 'Add to favourites'}
      >
        <Heart className={cn('h-5 w-5', liked ? 'fill-current text-rose-accent' : 'text-white/88')} />
      </button>

      <button
        onClick={onAddToAlbum}
        className="flex h-9 w-9 items-center justify-center rounded-full text-white/68 transition-colors hover:bg-white/8 hover:text-white"
        aria-label="Add photo to album"
      >
        <Plus className="h-5 w-5" />
      </button>

      <button
        onClick={onToggleDetails}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/8',
          showDetails ? 'text-white' : 'text-white/72'
        )}
        aria-label={showDetails ? 'Hide details' : 'Show details'}
      >
        <Info className="h-5 w-5" />
      </button>
    </div>
  );
}
