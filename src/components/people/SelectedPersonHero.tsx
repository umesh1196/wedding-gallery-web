interface SelectedPersonHeroProps {
  selectedPerson: string;
  photoCount: number;
  isSelecting: boolean;
  selectedCount: number;
  allSelected: boolean;
  onSaveAll: () => void;
  onStartSelection: () => void;
  onToggleSelectAll: () => void;
  onSaveSelected: () => void;
  onAddSelectedToAlbum: () => void;
  onBackToPeople: () => void;
}

export function SelectedPersonHero({
  selectedPerson,
  photoCount,
  isSelecting,
  selectedCount,
  allSelected,
  onSaveAll,
  onStartSelection,
  onToggleSelectAll,
  onSaveSelected,
  onAddSelectedToAlbum,
  onBackToPeople,
}: SelectedPersonHeroProps) {
  return (
    <section className="wrap mb-6 md:mb-8">
      <div className="soft-panel overflow-hidden rounded-[1.85rem]">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="border-b border-white/6 p-5 md:p-7 lg:border-r lg:border-b-0">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full p-[3px] md:h-20 md:w-20 bg-[linear-gradient(180deg,rgba(201,80,106,0.95),rgba(201,80,106,0.35))]">
                <div className="h-full w-full overflow-hidden rounded-full border border-white/10">
                  <img
                    alt={selectedPerson}
                    className="h-full w-full rounded-full object-cover"
                    src={`https://picsum.photos/seed/${selectedPerson}/240/240`}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div>
                <p className="label text-outline">Moments with</p>
                <h3 className="font-headline text-3xl italic text-white md:text-4xl">{selectedPerson}</h3>
                <p className="mt-1 label text-white/46">{photoCount} photo{photoCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="label text-white/42">{isSelecting ? `${selectedCount} selected` : `${photoCount} photo${photoCount !== 1 ? 's' : ''}`}</p>
              </div>
              <button
                onClick={onBackToPeople}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 label text-white/72 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                Back to People
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {isSelecting ? (
                <>
                  <button
                    onClick={onToggleSelectAll}
                    className="rounded-full bg-white/8 px-4 py-2.5 label text-white/88 transition-colors hover:bg-white/12"
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    onClick={onSaveSelected}
                    className="rounded-full bg-white/8 px-4 py-2.5 label text-white/88 transition-colors hover:bg-white/12"
                  >
                    Save Selected
                  </button>
                  <button
                    onClick={onAddSelectedToAlbum}
                    className="rounded-full bg-rose-accent px-4 py-2.5 label text-white transition-colors hover:bg-rose-accent/90"
                  >
                    Add to Album
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onSaveAll}
                    className="rounded-full bg-white/8 px-4 py-2.5 label text-white/88 transition-colors hover:bg-white/12"
                  >
                    Save All
                  </button>
                  <button
                    onClick={onStartSelection}
                    className="rounded-full bg-rose-accent px-4 py-2.5 label text-white transition-colors hover:bg-rose-accent/90"
                  >
                    Choose Moments
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
