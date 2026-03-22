import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Sheet({ open, onClose, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[70] backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] flex items-end md:items-center justify-center p-0 md:p-8"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 32, opacity: 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="w-full max-w-none md:max-w-lg bg-surface border border-white/5 shadow-2xl flex max-h-[88vh] md:max-h-[85vh] flex-col overflow-hidden rounded-t-[1.75rem] md:rounded-2xl mobile-safe-bottom md:mobile-safe-bottom"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-2 md:hidden">
                <div className="h-1.5 w-12 rounded-full bg-white/15" />
              </div>
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
