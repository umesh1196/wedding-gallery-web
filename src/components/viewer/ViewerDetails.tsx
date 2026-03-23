import { AnimatePresence, motion } from 'motion/react';

interface ViewerDetailsProps {
  showDetails: boolean;
  eventName: string;
  date: string;
  people?: string[];
}

export function ViewerDetails({
  showDetails,
  eventName,
  date,
  people,
}: ViewerDetailsProps) {
  return (
    <AnimatePresence>
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pointer-events-auto overflow-hidden"
        >
          <div className="mt-2.5 border-t border-foreground/10 pt-3">
            <div className="grid grid-cols-2 gap-3 text-left md:grid-cols-3">
              <div>
                <p className="label text-foreground/35">Event</p>
                <p className="mt-1 font-body text-sm text-foreground/82">{eventName}</p>
              </div>
              <div>
                <p className="label text-foreground/35">Date</p>
                <p className="mt-1 font-body text-sm text-foreground/82">{date}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="label text-foreground/35">Tagged</p>
                <p className="mt-1 font-body text-sm text-foreground/82">
                  {people?.join(', ') || 'No tags'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
