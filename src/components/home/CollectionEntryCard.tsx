import { Link } from 'react-router-dom';
import { Heart, Folder } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CollectionEntryCardProps {
  title: string;
  description: string;
  countLabel: string;
  href: string;
  icon: 'saved' | 'albums';
  ctaLabel?: string;
}

export function CollectionEntryCard({
  title,
  description,
  countLabel,
  href,
  icon,
  ctaLabel = 'Open collection →',
}: CollectionEntryCardProps) {
  const Icon = icon === 'saved' ? Heart : Folder;

  return (
    <Link
      to={href}
      className="soft-panel group flex min-h-[12.5rem] flex-col justify-between rounded-[1.7rem] p-5 transition-colors hover:border-foreground/10 md:min-h-[14rem] md:p-6"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground/6 text-rose-accent">
        <Icon className={cn('h-5 w-5', icon === 'saved' && 'fill-current')} />
      </div>
      <div>
        <p className="label text-foreground/42">{countLabel}</p>
        <h3 className="mt-2 font-headline text-[1.9rem] italic leading-none text-foreground">{title}</h3>
        <p className="mt-3 max-w-sm font-body text-sm leading-relaxed text-foreground/62">{description}</p>
        <p className="mt-4 label text-rose-accent">{ctaLabel}</p>
      </div>
    </Link>
  );
}
