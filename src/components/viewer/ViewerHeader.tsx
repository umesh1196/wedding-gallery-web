import { ArrowLeft, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ViewerHeaderProps {
  backTo: string;
  backLabel: string;
  photoState?: { backTo: string; backLabel: string };
  currentIndex: number;
  totalPhotos: number;
  onShare: () => void;
}

export function ViewerHeader({
  backTo,
  backLabel,
  photoState,
  currentIndex,
  totalPhotos,
  onShare,
}: ViewerHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link
        to={backTo}
        state={photoState}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/28 text-foreground backdrop-blur-md transition-colors hover:bg-black/45 md:h-11 md:w-11"
        aria-label={`Back to ${backLabel}`}
      >
        <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
      </Link>

      <div className="rounded-full border border-foreground/8 bg-black/22 px-3 py-1.5 backdrop-blur-sm">
        <span className="label text-foreground/85">
          {currentIndex} / {totalPhotos}
        </span>
      </div>

      <button
        onClick={onShare}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/28 text-foreground backdrop-blur-md transition-colors hover:bg-black/45 md:h-11 md:w-11"
        aria-label="Share photo"
      >
        <Share2 className="h-5 w-5 md:h-6 md:w-6" />
      </button>
    </div>
  );
}
