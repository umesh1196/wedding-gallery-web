import { Check, Link2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ToastProps {
  title: string;
  message?: string;
  variant?: 'success' | 'info';
}

export function Toast({ title, message, variant = 'success' }: ToastProps) {
  const Icon = variant === 'info' ? Link2 : Check;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 14, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/72 px-4 py-3 text-white shadow-[0_18px_48px_rgba(0,0,0,0.32)] backdrop-blur-2xl"
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-px',
          variant === 'info'
            ? 'bg-gradient-to-r from-transparent via-white/30 to-transparent'
            : 'bg-gradient-to-r from-transparent via-rose-accent/70 to-transparent'
        )}
      />
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border',
            variant === 'info'
              ? 'border-white/12 bg-white/[0.05] text-white/74'
              : 'border-rose-accent/18 bg-rose-accent/12 text-rose-accent'
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="font-body text-sm text-white/94">{title}</p>
          {message && <p className="mt-1 font-body text-xs leading-relaxed text-white/58">{message}</p>}
        </div>
      </div>
    </motion.div>
  );
}
