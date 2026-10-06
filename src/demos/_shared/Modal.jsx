import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from '@phosphor-icons/react';
import { cx } from '../../lib/format';

// Open modals, newest last, so Escape only closes the top one.
const stack = [];

// Rendered in place (not portalled) so it inherits the demo's scoped theme tokens.
// variant: 'center' (dialog), 'right' (drawer), 'bottom' (sheet on mobile, dialog on desktop)
export default function Modal({ open, onClose, title, children, footer, variant = 'center', size = 'md' }) {
  const ref = useRef(null);
  const titleId = useId();
  const reduce = useReducedMotion();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const token = {};
    stack.push(token);
    const onKey = (e) => e.key === 'Escape' && stack[stack.length - 1] === token && closeRef.current?.();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => ref.current?.querySelector('[autofocus], input, select, textarea, button:not([data-close])')?.focus(), 30);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      stack.splice(stack.indexOf(token), 1);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open]);

  const widths = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };
  const panel = {
    center: 'inset-x-3 top-1/2 -translate-y-1/2 mx-auto max-h-[88dvh] rounded-2xl',
    right: 'inset-y-0 right-0 w-full sm:max-w-md h-[100dvh]',
    bottom: 'inset-x-0 bottom-0 max-h-[90dvh] rounded-t-2xl sm:inset-x-3 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:mx-auto sm:rounded-2xl',
  }[variant];
  const from = reduce ? { opacity: 0 } : variant === 'right' ? { x: 40, opacity: 0 } : { y: 24, opacity: 0 };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className={cx('absolute', panel, variant !== 'right' && widths[size], 'flex flex-col')}>
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              initial={from}
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={from}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className={cx('flex min-h-0 w-full flex-1 flex-col overflow-hidden border border-line bg-surface text-fg shadow-2xl', variant === 'right' ? '' : 'rounded-[inherit]')}
            >
              {title !== undefined && (
                <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
                  <h2 id={titleId} className="font-display text-lg font-semibold">{title}</h2>
                  <button data-close onClick={onClose} className="-mr-1 rounded-full p-1.5 text-muted hover:bg-sunken hover:text-fg" aria-label="Close">
                    <X size={20} />
                  </button>
                </div>
              )}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
              {footer && <div className="border-t border-line px-5 py-4">{footer}</div>}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
