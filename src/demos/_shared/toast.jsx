import { create } from 'zustand';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, Info } from '@phosphor-icons/react';

const useToasts = create((set) => ({
  items: [],
  push: (text, tone = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ items: [...s.items.slice(-2), { id, text, tone }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), 3200);
  },
}));

export const toast = (text, tone) => useToasts.getState().push(text, tone);

export function Toaster() {
  const items = useToasts((s) => s.items);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4" aria-live="polite">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full bg-fg px-4 py-2.5 text-sm font-medium text-bg shadow-lg"
          >
            {t.tone === 'info' ? <Info size={18} weight="fill" /> : <CheckCircle size={18} weight="fill" />}
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
