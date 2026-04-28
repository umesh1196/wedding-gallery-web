import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PersonSummary {
  name: string;
  count: number;
  avatarUrl?: string | null;
}

interface PeopleStripProps {
  people: PersonSummary[];
  selectedPerson: string | null;
  onSelectPerson: (name: string) => void;
  onOpenFindSheet: () => void;
}

export function PeopleStrip({
  people,
  selectedPerson,
  onSelectPerson,
  onOpenFindSheet,
}: PeopleStripProps) {
  return (
    <section className="wrap mb-8 md:mb-10">
      <div className="mb-4 flex items-end justify-between gap-3 md:mb-6">
        <div>
          <p className="label text-outline">Browse by familiar faces</p>
          <p className="mt-2 max-w-lg font-body text-sm leading-relaxed text-foreground/60">
            Pick a face to bring together portraits, candid frames, and the quieter in-between moments they appear in.
          </p>
          <p className="mt-2 max-w-lg font-body text-xs leading-relaxed text-foreground/46 md:text-sm">
            Tap any face to see their photos together. If you do not see yourself yet, use the `Find Yourself` option to start there.
          </p>
        </div>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-2 md:flex-wrap md:gap-7 md:overflow-visible md:px-0">
        {people.map(({ name, count, avatarUrl }) => {
          const isSelected = selectedPerson === name;

          return (
            <button
              key={name}
              onClick={() => onSelectPerson(name)}
              className="flex flex-shrink-0 flex-col items-center"
            >
              <div
                className={cn(
                  'relative h-16 w-16 rounded-full p-[3px] transition-all duration-200 md:h-20 md:w-20',
                  isSelected
                    ? 'bg-[linear-gradient(180deg,rgba(201,80,106,0.95),rgba(201,80,106,0.35))]'
                    : 'bg-foreground/[0.04]'
                )}
              >
                <div className="h-full w-full overflow-hidden rounded-full border border-foreground/8 bg-[#151515]">
                  {avatarUrl ? (
                    <img
                      alt={name}
                      className="h-full w-full rounded-full object-cover"
                      src={avatarUrl}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-foreground/10 text-foreground/40 text-lg font-bold">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 rounded-full border border-surface bg-black/78 px-1.5 py-0.5 backdrop-blur-sm">
                  <span className={cn('text-[8px] font-label font-bold tracking-[0.18em]', isSelected ? 'text-rose-accent' : 'text-foreground/68')}>
                    {count}
                  </span>
                </div>
              </div>
              <span className={cn('mt-2 label', isSelected ? 'text-rose-accent' : 'text-outline')}>
                {name}
              </span>
            </button>
          );
        })}

        <button
          onClick={onOpenFindSheet}
          className="flex flex-shrink-0 flex-col items-center"
          aria-label="Find your photos"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-rose-accent/45 bg-rose-accent/8 text-rose-accent transition-colors hover:bg-rose-accent/12 md:h-20 md:w-20">
            <Plus className="h-6 w-6 md:h-7 md:w-7" />
          </div>
          <span className="mt-2 label text-rose-accent">Find Yourself</span>
        </button>
      </div>
    </section>
  );
}
