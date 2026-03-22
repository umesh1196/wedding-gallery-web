import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { AnimatePresence } from 'motion/react';
import { Toast } from './Toast';

interface FeedbackToast {
  id: number;
  title: string;
  message?: string;
  variant?: 'success' | 'info';
}

interface FeedbackContextValue {
  showFeedback: (input: { title: string; message?: string; variant?: 'success' | 'info' }) => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<FeedbackToast[]>([]);

  const showFeedback = useCallback(({
    title,
    message,
    variant = 'success',
  }: {
    title: string;
    message?: string;
    variant?: 'success' | 'info';
  }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);

    setToasts((current) => [...current, { id, title, message, variant }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2600);
  }, []);

  const value = useMemo(() => ({ showFeedback }), [showFeedback]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-center px-3 pb-24 md:px-6 md:pb-6">
        <div className="flex w-full max-w-sm flex-col gap-2">
          <AnimatePresence initial={false}>
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                title={toast.title}
                message={toast.message}
                variant={toast.variant}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }

  return context;
}
