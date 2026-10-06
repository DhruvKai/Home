import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bag, CheckCircle, Gift, Motorcycle, Storefront, Trash } from '@phosphor-icons/react';
import Modal from '../_shared/Modal';
import { Empty, Qty, Stepper } from '../_shared/bits';
import Simulated from '../_shared/Simulated';
import { toast } from '../_shared/toast';
import { img } from '../../lib/asset';
import { cx, fmtTime, money } from '../../lib/format';
import { ORDER_STEPS, cartTotals, orderStep, useRestaurant } from './data';

export function DishModal({ item, onClose }) {
  const addToCart = useRestaurant((s) => s.addToCart);
  const [choice, setChoice] = useState({});
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!item) return;
    const init = {};
    item.options.forEach((o) => { init[o.name] = o.type === 'one' ? null : []; });
    setChoice(init); setQty(1); setNotes(''); setError('');
  }, [item]);

  if (!item) return <Modal open={false} />;
  const extra = item.options.reduce((n, o) => {
    const c = choice[o.name];
    if (o.type === 'one') return n + (o.choices.find(([l]) => l === c)?.[1] ?? 0);
    return n + (c ?? []).reduce((m, l) => m + o.choices.find(([x]) => x === l)[1], 0);
  }, 0);
  const unit = item.price + extra;

  function add() {
    const missing = item.options.find((o) => o.required && !choice[o.name]);
    if (missing) return setError(`Choose an option for "${missing.name}".`);
    const summary = item.options.flatMap((o) => (o.type === 'one' ? [choice[o.name]] : choice[o.name])).filter(Boolean);
    addToCart({ key: item.id + '|' + summary.join(',') + '|' + notes, itemId: item.id, name: item.name, photo: item.photo, summary, notes, unit, qty });
    toast(`${qty} x ${item.name} added`);
    onClose();
  }

  return (
    <Modal open={!!item} onClose={onClose} variant="bottom" size="md" title={item.name}
      footer={
        <div className="flex items-center justify-between gap-3">
          <Qty value={qty} onChange={setQty} />
          <button className="btn btn-primary" onClick={add}>Add to order, {money(unit * qty)}</button>
        </div>
      }>
      <img src={img('restaurant', item.photo)} alt={item.name} className="aspect-[16/9] w-full object-cover" />
      <div className="p-5">
        <p className="leading-relaxed text-muted">{item.desc}</p>
        <p className="mt-2 font-semibold">{money(item.price)}</p>
        {item.options.map((o) => (
          <fieldset key={o.name} className="mt-6">
            <legend className="flex w-full items-center justify-between font-semibold">
              {o.name}
              <span className="text-xs font-normal text-muted">{o.required ? 'Required, choose 1' : 'Optional'}</span>
            </legend>
            <div className="mt-3 grid gap-2">
              {o.choices.map(([label, price]) => {
                const on = o.type === 'one' ? choice[o.name] === label : (choice[o.name] ?? []).includes(label);
                return (
                  <label key={label} className={cx('flex cursor-pointer items-center justify-between rounded-[10px] border px-3 py-2.5 text-[15px]', on ? 'border-accent bg-accent-soft' : 'border-line')}>
                    <span className="flex items-center gap-3">
                      <input
                        type={o.type === 'one' ? 'radio' : 'checkbox'} name={o.name} checked={on} className="accent-[var(--accent)]"
                        onChange={() => {
                          setError('');
                          setChoice((c) => ({ ...c, [o.name]: o.type === 'one' ? label : on ? c[o.name].filter((x) => x !== label) : [...c[o.name], label] }));
                        }}
                      />
                      {label}
                    </span>
                    <span className="text-sm text-muted">{price ? `+${money(price)}` : ''}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
        <div className="field mt-6"><label htmlFor="dish-notes">Notes for the kitchen <span className="font-normal text-muted">(optional)</span></label><input id="dish-notes" className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="No onions, sauce on the side" /></div>
        {error && <p className="error mt-4" role="alert">{error}</p>}
      </div>
    </Modal>
  );
}

export function CartDrawer({ open, onClose, onCheckout }) {
  const cart = useRestaurant((s) => s.cart);
  const setQty = useRestaurant((s) => s.setQty);
  const t = cartTotals(cart, 'pickup');
  return (
    <Modal open={open} onClose={onClose} variant="right" title="Your order"
      footer={cart.length ? (
        <div className="grid gap-3">
          <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span className="font-semibold">{money(t.subtotal)}</span></div>
          {t.freeDessert
            ? <p className="flex items-center gap-2 rounded-[10px] bg-accent-soft px-3 py-2 text-sm font-semibold text-accent-ink"><Gift size={18} /> Free sundae added at checkout</p>
            : <p className="text-sm text-muted">Add {money(1500 - t.subtotal)} more for a free dessert.</p>}
          <button className="btn btn-primary w-full" onClick={onCheckout}>Checkout</button>
        </div>
      ) : null}>
      {cart.length ? (
        <ul className="divide-y divide-line">
          {cart.map((l) => (
            <li key={l.key} className="flex gap-3 p-4">
              <img src={img('restaurant', l.photo)} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{l.name}</p>
                {l.summary.length > 0 && <p className="text-sm text-muted">{l.summary.join(', ')}</p>}
                {l.notes && <p className="text-sm italic text-muted">"{l.notes}"</p>}
                <div className="mt-2 flex items-center justify-between">
                  <Qty value={l.qty} onChange={(q) => setQty(l.key, q)} min={0} label={`Quantity of ${l.name}`} />
                  <span className="font-semibold">{money(l.unit * l.qty)}</span>
                </div>
              </div>
              <button className="self-start p-1 text-muted hover:text-bad" onClick={() => setQty(l.key, 0)} aria-label={`Remove ${l.name}`}><Trash size={18} /></button>
            </li>
          ))}
        </ul>
      ) : <Empty icon={Bag} title="Your order is empty" text="Add dishes from the menu to start an order." action={<button className="btn btn-ghost btn-sm" onClick={onClose}>Browse the menu</button>} />}
    </Modal>
  );
}

function slotsToday() {
  const now = new Date();
  const start = now.getHours() * 60 + now.getMinutes() + 40;
  const out = [];
  for (let m = Math.ceil(start / 15) * 15; out.length < 8; m += 15) {
    const h = Math.floor(m / 60) % 24;
    out.push(`${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  return out;
}

export function OrderTracker({ order }) {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 2000); return () => clearInterval(t); }, []);
  const step = orderStep(order);
  const steps = ORDER_STEPS[order.mode];
  return (
    <ol className="grid gap-0">
      {steps.map((s, i) => (
        <li key={s} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className={cx('grid size-7 place-items-center rounded-full text-xs font-bold transition-colors', i <= step ? 'bg-accent text-on-accent' : 'bg-sunken text-muted')}>{i + 1}</span>
            {i < steps.length - 1 && <span className={cx('h-6 w-0.5', i < step ? 'bg-accent' : 'bg-line')} />}
          </div>
          <p className={cx('pt-0.5 text-[15px]', i === step ? 'font-bold' : i < step ? 'text-fg' : 'text-muted')}>{s}{i === step && step < 3 && <span className="ml-2 text-xs font-normal text-muted">now</span>}</p>
        </li>
      ))}
    </ol>
  );
}

const STEPS = ['Pickup or delivery', 'Time', 'Details', 'Pay'];

export function Checkout({ open, onClose }) {
  const cart = useRestaurant((s) => s.cart);
  const placeOrder = useRestaurant((s) => s.placeOrder);
  const [step, setStep] = useState(0);
  const [v, setV] = useState({ mode: 'pickup', address: '', slot: 'asap', name: '', phone: '', pay: 'counter' });
  const [err, setErr] = useState('');
  const [order, setOrder] = useState(null);
  const [paySheet, setPaySheet] = useState(false);
  const slots = useMemo(slotsToday, [open]);
  useEffect(() => { if (open) { setStep(0); setOrder(null); setErr(''); } }, [open]);
  const t = cartTotals(cart, v.mode);

  function next() {
    setErr('');
    if (step === 0 && v.mode === 'delivery' && v.address.trim().length < 6) return setErr('Add a delivery address.');
    if (step === 2 && (v.name.trim().length < 2 || !/^[0-9+\s-]{7,}$/.test(v.phone))) return setErr('Add your name and a phone number (any digits work in this demo).');
    if (step < 3) return setStep(step + 1);
    if (v.pay === 'online') return setPaySheet(true);
    finish();
  }
  function finish() { setPaySheet(false); setOrder(placeOrder(v)); }

  const body = order ? (
    <div className="p-6">
      <div className="text-center">
        <CheckCircle size={52} weight="fill" className="mx-auto text-accent" />
        <h3 className="mt-3 font-display text-2xl font-bold">Order #{order.number} placed</h3>
        <p className="mt-1 text-muted">{order.mode === 'pickup' ? 'Pickup' : 'Delivery'} {order.slot === 'asap' ? 'as soon as possible' : `at ${fmtTime(order.slot)}`}. Total {money(order.total)}.</p>
      </div>
      <div className="mx-auto mt-6 max-w-xs"><OrderTracker order={order} /></div>
      <p className="mt-6 text-center text-sm text-muted">Status updates every few seconds in this demo. In a real build the customer would get SMS updates too.</p>
    </div>
  ) : (
    <>
      <Stepper steps={STEPS} current={step} />
      <div className="grid gap-4 p-5">
        {step === 0 && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {[['pickup', 'Pickup', Storefront, 'Ready in about 25 min'], ['delivery', 'Delivery', Motorcycle, `${money(49)} fee, about 40 min`]].map(([k, l, I, d]) => (
                <button key={k} type="button" onClick={() => setV({ ...v, mode: k })} aria-pressed={v.mode === k}
                  className={cx('rounded-2xl border p-4 text-left', v.mode === k ? 'border-accent bg-accent-soft' : 'border-line')}>
                  <I size={24} className="text-accent-ink" /><p className="mt-3 font-semibold">{l}</p><p className="text-sm text-muted">{d}</p>
                </button>
              ))}
            </div>
            {v.mode === 'delivery' && <div className="field"><label htmlFor="co-addr">Delivery address</label><textarea id="co-addr" className="input min-h-20" value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} placeholder="Flat, street and area" /></div>}
          </>
        )}
        {step === 1 && (
          <div>
            <p className="label">When?</p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {['asap', ...slots].map((s) => (
                <button key={s} type="button" onClick={() => setV({ ...v, slot: s })} aria-pressed={v.slot === s}
                  className={cx('rounded-[10px] border py-2.5 text-sm font-semibold', v.slot === s ? 'border-accent bg-accent text-on-accent' : 'border-line')}>{s === 'asap' ? 'ASAP' : fmtTime(s)}</button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field"><label htmlFor="co-name">Name</label><input id="co-name" className="input" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="co-phone">Phone</label><input id="co-phone" className="input" inputMode="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} /></div>
          </div>
        )}
        {step === 3 && (
          <>
            <div className="grid gap-2">
              {[['counter', v.mode === 'pickup' ? 'Pay at the counter' : 'Pay on delivery'], ['online', 'Pay online now (simulated)']].map(([k, l]) => (
                <label key={k} className={cx('flex cursor-pointer items-center gap-3 rounded-[10px] border p-3 font-semibold', v.pay === k ? 'border-accent bg-accent-soft' : 'border-line')}>
                  <input type="radio" name="pay" checked={v.pay === k} onChange={() => setV({ ...v, pay: k })} className="accent-[var(--accent)]" />{l}
                </label>
              ))}
            </div>
            <dl className="grid gap-1.5 rounded-2xl bg-sunken p-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(t.subtotal)}</dd></div>
              {t.delivery > 0 && <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{money(t.delivery)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">GST (5%)</dt><dd>{money(t.tax)}</dd></div>
              {t.freeDessert && <div className="flex justify-between text-accent-ink"><dt>Salted caramel sundae</dt><dd>Free</dd></div>}
              <div className="mt-1 flex justify-between border-t border-line pt-2 text-base font-bold"><dt>Total</dt><dd>{money(t.total)}</dd></div>
            </dl>
          </>
        )}
        {err && <p className="error" role="alert">{err}</p>}
      </div>
    </>
  );

  return (
    <>
      <Modal open={open} onClose={onClose} title={order ? 'Order status' : 'Checkout'} size="md" variant="bottom"
        footer={order ? <button className="btn btn-primary w-full" onClick={onClose}>Done</button> : (
          <div className="flex items-center justify-between gap-3">
            {step > 0 ? <button className="btn btn-ghost btn-sm" onClick={() => setStep(step - 1)}><ArrowLeft size={14} /> Back</button> : <span className="text-sm text-muted">{cart.reduce((n, l) => n + l.qty, 0)} items</span>}
            <button className="btn btn-primary" onClick={next} disabled={!cart.length}>{step < 3 ? 'Continue' : `Place order, ${money(t.total)}`}</button>
          </div>
        )}>
        {body}
      </Modal>
      <Simulated open={paySheet} onClose={finish} kind="pay" title="Online payment">
        <p>In a real build this opens the payment gateway (UPI, cards, wallets). Nothing is charged in this demo.</p>
        <p className="text-muted">Press "Got it" to continue as if the payment went through.</p>
      </Simulated>
    </>
  );
}
