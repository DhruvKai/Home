import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle, Flask } from '@phosphor-icons/react';
import { cx } from '../lib/format';

export function Reveal({ children, delay = 0, className, as = 'div' }) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </M>
  );
}

// Real projects only.
export function RealBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-ink">
      <CheckCircle size={14} weight="fill" /> Real project
    </span>
  );
}

// Concept demos only.
export function ConceptBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted/60 px-2.5 py-1 text-xs font-semibold text-muted">
      <Flask size={14} /> Concept Demo
    </span>
  );
}

// Screenshot in a light browser-style frame. `ratio` keeps layout stable before the image loads.
export function Shot({ src, alt, ratio = '16/10', className, eager }) {
  return (
    <div className={cx('overflow-hidden rounded-xl border border-line bg-sunken', className)} style={{ aspectRatio: ratio }}>
      <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className="size-full object-cover object-top" />
    </div>
  );
}
