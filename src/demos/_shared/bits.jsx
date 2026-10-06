import { useId, useState } from 'react';
import { CaretDown, MapPin } from '@phosphor-icons/react';
import { cx } from '../../lib/format';

export function Accordion({ items, className }) {
  const [open, setOpen] = useState(0);
  const base = useId();
  return (
    <div className={cx('divide-y divide-line border-y border-line', className)}>
      {items.map(([q, a], i) => (
        <div key={q}>
          <h3>
            <button
              className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-[17px] font-semibold"
              aria-expanded={open === i}
              aria-controls={`${base}-${i}`}
              onClick={() => setOpen(open === i ? -1 : i)}
            >
              {q}
              <CaretDown size={18} className={cx('shrink-0 text-muted transition-transform duration-300', open === i && 'rotate-180')} />
            </button>
          </h3>
          <div id={`${base}-${i}`} hidden={open !== i} className="max-w-[65ch] pb-5 leading-relaxed text-muted">{a}</div>
        </div>
      ))}
    </div>
  );
}

// Stylised, made-up street map. Deliberately not a real location.
export function StylisedMap({ label, className }) {
  return (
    <div className={cx('relative overflow-hidden rounded-2xl border border-line bg-sunken', className)} role="img" aria-label={`Illustrated map showing ${label}. Fictional location.`}>
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        <rect width="400" height="260" fill="var(--sunken)" />
        <path d="M-10 190 C 80 170, 140 210, 230 180 S 360 120, 420 140 L 420 270 L -10 270 Z" fill="var(--accent-soft)" opacity="0.9" />
        <g stroke="var(--surface)" strokeLinecap="round" fill="none">
          <path d="M-10 70 L 420 110" strokeWidth="14" />
          <path d="M120 -10 L 170 280" strokeWidth="10" />
          <path d="M290 -10 C 270 80, 300 150, 260 280" strokeWidth="8" />
          <path d="M-10 140 L 180 120" strokeWidth="6" />
          <path d="M200 30 L 400 40" strokeWidth="5" />
        </g>
        <g fill="var(--line)" opacity="0.8">
          <rect x="20" y="10" width="70" height="40" rx="6" />
          <rect x="190" y="50" width="60" height="38" rx="6" />
          <rect x="310" y="60" width="70" height="30" rx="6" />
          <rect x="30" y="90" width="60" height="30" rx="6" />
          <rect x="190" y="125" width="70" height="40" rx="6" />
        </g>
      </svg>
      <div className="absolute left-[44%] top-[34%] -translate-x-1/2 -translate-y-full">
        <div className="flex flex-col items-center">
          <span className="whitespace-nowrap rounded-full bg-fg px-3 py-1 text-xs font-semibold text-bg shadow-md">{label}</span>
          <MapPin size={34} weight="fill" className="-mt-0.5 text-accent drop-shadow" />
        </div>
      </div>
    </div>
  );
}

export function Stepper({ steps, current }) {
  return (
    <ol className="flex items-center gap-2 overflow-x-auto px-5 pt-4 no-scrollbar" aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s} className="flex shrink-0 items-center gap-2 text-[13px]" aria-current={i === current ? 'step' : undefined}>
          <span className={cx('grid size-6 place-items-center rounded-full text-[11px] font-bold',
            i < current ? 'bg-accent text-on-accent' : i === current ? 'bg-fg text-bg' : 'bg-sunken text-muted')}>{i + 1}</span>
          <span className={i === current ? 'font-semibold' : 'text-muted'}>{s}</span>
          {i < steps.length - 1 && <span className="mx-1 h-px w-5 bg-line" />}
        </li>
      ))}
    </ol>
  );
}

export function Qty({ value, onChange, min = 1, max = 20, label = 'Quantity' }) {
  return (
    <div className="inline-flex items-center rounded-full border border-line" role="group" aria-label={label}>
      <button type="button" className="grid size-9 place-items-center rounded-full text-lg hover:bg-sunken disabled:opacity-40" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease">-</button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className="grid size-9 place-items-center rounded-full text-lg hover:bg-sunken disabled:opacity-40" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase">+</button>
    </div>
  );
}

export function Empty({ icon: Icon, title, text, action }) {
  return (
    <div className="grid place-items-center gap-2 px-6 py-14 text-center">
      {Icon && <span className="grid size-12 place-items-center rounded-full bg-sunken text-muted"><Icon size={24} /></span>}
      <p className="mt-2 font-semibold">{title}</p>
      {text && <p className="max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
