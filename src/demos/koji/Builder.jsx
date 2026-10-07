import { useEffect, useState } from 'react';
import { Minus, Plus } from '@phosphor-icons/react';
import Modal from '../_shared/Modal';
import { toast } from '../_shared/toast';
import { cx, fmtTime, money } from '../../lib/format';
import { BROTHS, FIRMNESS, NOODLES, TICKET_STEPS, TOPPINGS, bowlPrice, describe, pickupSlots, ticketStep, useKoji } from './data';

const Head = ({ n, children }) => (
  <p className="flex items-baseline gap-3 border-b border-line pb-2 font-mono text-xs uppercase"><span className="text-accent">{n}</span>{children}</p>
);

// Build-your-bowl. `preset` loads a signature bowl into the builder.
export function Builder({ preset }) {
  const add = useKoji((s) => s.add);
  const [b, setB] = useState(preset.build);
  useEffect(() => setB(preset.build), [preset]);
  const price = bowlPrice(b);
  const d = describe(b);
  const toggle = (id) => setB({ ...b, toppings: b.toppings.includes(id) ? b.toppings.filter((x) => x !== id) : [...b.toppings, id] });

  function addBowl() {
    add({ kind: 'bowl', name: d.title, lines: d.lines, unit: price, qty: 1 });
    toast(`${d.title} added to your ticket`);
  }

  return (
    <div className="grid min-w-0 grid-cols-1 border-t border-line lg:grid-cols-[1fr_340px]">
      <div className="grid min-w-0 gap-10 py-8 lg:border-r lg:border-line lg:pr-8">
        <fieldset>
          <legend className="w-full"><Head n="A">Broth</Head></legend>
          <div className="mt-3 grid grid-cols-2 border-l border-t border-line sm:grid-cols-3">
            {BROTHS.map((x) => (
              <button key={x.id} type="button" onClick={() => setB({ ...b, broth: x.id })} aria-pressed={b.broth === x.id}
                className={cx('border-b border-r border-line p-3 text-left transition-colors', b.broth === x.id ? 'bg-fg text-bg' : 'hover:bg-sunken')}>
                <span className="block text-lg font-semibold leading-tight">{x.name}</span>
                <span className={cx('block text-xs', b.broth === x.id ? 'opacity-70' : 'text-muted')}>{x.note}</span>
                <span className="mt-2 block font-mono text-xs">{money(x.price)}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-10 sm:grid-cols-2">
          <fieldset>
            <legend className="w-full"><Head n="B">Noodles</Head></legend>
            <div className="mt-3 grid">
              {NOODLES.map(([id, label]) => (
                <button key={id} type="button" onClick={() => setB({ ...b, noodle: id })} aria-pressed={b.noodle === id}
                  className="flex items-center gap-3 border-b border-line py-2.5 text-left">
                  <span className={cx('size-3 shrink-0 border border-fg', b.noodle === id && 'bg-accent border-accent')} />{label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="w-full"><Head n="C">Firmness</Head></legend>
            <div className="mt-3 grid grid-cols-4 border-l border-t border-line">
              {FIRMNESS.map((f, i) => (
                <button key={f} type="button" onClick={() => setB({ ...b, firm: i })} aria-pressed={b.firm === i} title={f}
                  className={cx('border-b border-r border-line px-1 py-3 text-center text-xs font-semibold', b.firm === i ? 'bg-fg text-bg' : 'hover:bg-sunken')}>{f}</button>
              ))}
            </div>
            <div className="mt-8"><Head n="D">Spice <span className="ml-auto text-fg">{b.spice}/5</span></Head></div>
            <input type="range" min="0" max="5" value={b.spice} onChange={(e) => setB({ ...b, spice: Number(e.target.value) })} aria-label="Spice level"
              className="mt-4 w-full accent-[var(--accent)]" />
            <div className="flex justify-between font-mono text-[10px] text-muted"><span>NONE</span><span>VOLCANIC</span></div>
          </fieldset>
        </div>

        <fieldset>
          <legend className="w-full"><Head n="E">Toppings</Head></legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {TOPPINGS.map((t) => {
              const on = b.toppings.includes(t.id);
              return (
                <button key={t.id} type="button" onClick={() => toggle(t.id)} aria-pressed={on}
                  className={cx('border px-3 py-2 text-sm', on ? 'border-accent bg-accent text-on-accent' : 'border-line hover:bg-sunken')}>
                  {t.name} <span className="font-mono text-xs opacity-75">+{t.price}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <aside className="py-8 lg:pl-8">
        <div className="sticky top-[calc(var(--bar-h,0px)+5rem)] border border-line bg-surface p-5 font-mono text-sm">
          <p className="flex justify-between text-xs uppercase"><span>Your bowl</span><span className="text-muted">Draft</span></p>
          <p className="mt-4 font-sans text-2xl font-bold leading-tight">{d.title}</p>
          <ul className="mt-3 grid gap-1 border-t border-dashed border-line pt-3 text-xs">
            {d.lines.map((l) => <li key={l} className="flex gap-2"><span className="text-accent">+</span>{l}</li>)}
          </ul>
          <p className="mt-5 flex items-end justify-between border-t border-dashed border-line pt-3">
            <span className="text-xs uppercase">Total</span><span className="font-sans text-3xl font-bold tabular-nums">{money(price)}</span>
          </p>
          <button className="btn btn-primary mt-5 w-full" onClick={addBowl}>Add to ticket</button>
        </div>
      </aside>
    </div>
  );
}

export function Ticket({ open, onClose }) {
  const { ticket, orders, setQty, send } = useKoji();
  const [slot, setSlot] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(null);
  const [, tick] = useState(0);
  const slots = pickupSlots();
  const total = ticket.reduce((n, l) => n + l.unit * l.qty, 0);
  const live = sent ? orders.find((o) => o.id === sent) : null;

  useEffect(() => { if (open) { setErr(''); if (!ticket.length && !live) setSent(null); } }, [open]);
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => tick((n) => n + 1), 2000);
    return () => clearInterval(t);
  }, [live]);

  function submit(e) {
    e.preventDefault();
    if (!slot) return setErr('Pick a pickup time.');
    if (form.name.trim().length < 2 || !/^[0-9+\s-]{7,}$/.test(form.phone)) return setErr('Add a name and phone number (any digits work in this demo).');
    setErr('');
    setSent(send({ slot, ...form }).id);
  }

  return (
    <Modal open={open} onClose={onClose} variant="right" title={live ? `Ticket ${live.number}` : `Ticket (${ticket.reduce((n, l) => n + l.qty, 0)})`}
      footer={live ? <button className="btn btn-ghost w-full" onClick={() => { setSent(null); onClose(); }}>Start a new ticket</button>
        : ticket.length ? <button className="btn btn-primary w-full" form="koji-send">Send to counter · {money(total)}</button> : null}>
      {live ? (
        <div className="p-5 font-mono">
          <p className="text-xs uppercase text-muted">Pickup at {fmtTime(live.slot)}</p>
          <p className="mt-2 font-sans text-8xl font-bold leading-none tracking-tighter text-accent">{live.number}</p>
          <ol className="mt-8 border-t border-line">
            {TICKET_STEPS.map((s, i) => {
              const at = ticketStep(live);
              return (
                <li key={s} className={cx('flex items-center justify-between border-b border-line py-3 text-sm', i > at && 'text-muted')}>
                  <span>{String(i + 1).padStart(2, '0')} {s}</span>
                  <span className={cx('size-3', i < at ? 'bg-fg' : i === at ? 'animate-pulse bg-accent' : 'border border-line')} />
                </li>
              );
            })}
          </ol>
          <p className="mt-6 font-sans text-sm text-muted">Status moves on its own in this demo. In a real build the kitchen screen would update it and send an SMS when it is ready.</p>
        </div>
      ) : ticket.length ? (
        <form id="koji-send" onSubmit={submit} noValidate className="grid gap-6 p-5">
          <ul className="border-t border-line">
            {ticket.map((l) => (
              <li key={l.key} className="flex gap-3 border-b border-line py-3">
                <div className="flex-1">
                  <p className="font-semibold">{l.name}</p>
                  {l.lines && <p className="font-mono text-xs text-muted">{l.lines.join(' · ')}</p>}
                  <p className="mt-1 font-mono text-sm">{money(l.unit * l.qty)}</p>
                </div>
                <div className="flex h-9 items-center border border-line">
                  <button type="button" className="grid size-8 place-items-center" onClick={() => setQty(l.key, l.qty - 1)} aria-label="Decrease"><Minus size={12} /></button>
                  <span className="w-6 text-center font-mono text-sm">{l.qty}</span>
                  <button type="button" className="grid size-8 place-items-center" onClick={() => setQty(l.key, l.qty + 1)} aria-label="Increase"><Plus size={12} /></button>
                </div>
              </li>
            ))}
          </ul>
          <fieldset>
            <legend className="label mb-2">Pickup time</legend>
            <div className="grid grid-cols-4 border-l border-t border-line">
              {slots.map((s) => (
                <button key={s} type="button" onClick={() => setSlot(s)} aria-pressed={slot === s}
                  className={cx('border-b border-r border-line py-2.5 font-mono text-xs', slot === s ? 'bg-fg text-bg' : 'hover:bg-sunken')}>{s}</button>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field"><label htmlFor="kj-name">Name</label><input id="kj-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="kj-phone">Phone</label><input id="kj-phone" className="input" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          {err && <p className="error" role="alert">{err}</p>}
          <p className="help">Pay at the counter when you collect. Nothing is charged in this demo.</p>
        </form>
      ) : (
        <div className="grid place-items-center gap-2 px-6 py-16 text-center">
          <p className="font-mono text-xs uppercase text-muted">Empty ticket</p>
          <p className="max-w-xs text-sm text-muted">Build a bowl or add a side, then send it to the counter.</p>
        </div>
      )}
    </Modal>
  );
}
