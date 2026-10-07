import { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, Minus, Plant, Plus, Sparkle } from '@phosphor-icons/react';
import Modal from '../_shared/Modal';
import { toast } from '../_shared/toast';
import { img } from '../../lib/asset';
import { money } from '../../lib/format';
import { FREE_REPOT, QUIZ, recommend, totals, useSprout } from './data';

export function Quiz({ open, onClose }) {
  const add = useSprout((s) => s.add);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  useEffect(() => { if (open) { setI(0); setAnswers({}); } }, [open]);

  const done = i >= QUIZ.length;
  const q = QUIZ[i];
  const picks = done ? recommend(answers) : [];

  return (
    <Modal open={open} onClose={onClose} title="Plant finder" size="lg"
      footer={done ? <button className="btn btn-ghost w-full" onClick={() => { setI(0); setAnswers({}); }}>Start over</button>
        : i > 0 ? <button className="btn btn-ghost btn-sm" onClick={() => setI(i - 1)}><ArrowLeft size={14} /> Back</button> : null}>
      <div className="p-5">
        <div className="h-3 overflow-hidden rounded-full border-2 border-fg bg-surface" role="progressbar" aria-valuemin={0} aria-valuemax={QUIZ.length} aria-valuenow={i}>
          <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${(Math.min(i, QUIZ.length) / QUIZ.length) * 100}%` }} />
        </div>
        {!done ? (
          <div className="mt-6">
            <p className="font-mono text-xs font-semibold uppercase">Question {i + 1} of {QUIZ.length}</p>
            <h3 className="mt-2 font-display text-3xl leading-tight">{q.q}</h3>
            <div className="mt-6 grid gap-3">
              {q.options.map(([value, label, hint]) => (
                <button key={label} onClick={() => { setAnswers({ ...answers, [q.id]: value }); setI(i + 1); }}
                  className="wiggle flex items-center justify-between gap-4 rounded-2xl border-2 border-fg bg-surface p-4 text-left shadow-[4px_4px_0_var(--fg)] transition-transform hover:-translate-y-0.5 hover:bg-accent-soft">
                  <span><span className="block text-lg font-bold">{label}</span><span className="text-sm text-muted">{hint}</span></span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-fg bg-sunken font-display">{['A', 'B', 'C'][q.options.findIndex((o) => o[1] === label)]}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase"><Sparkle size={14} weight="fill" className="text-accent" /> Your matches</p>
            <h3 className="mt-2 font-display text-3xl leading-tight">These will be happy with you.</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {picks.map((p, n) => (
                <div key={p.id} className="card overflow-hidden">
                  <div className="relative">
                    <img src={img('sprout', p.photo)} alt={p.name} className="aspect-square w-full border-b-2 border-fg object-cover" />
                    {n === 0 && <span className="absolute left-2 top-2 -rotate-6 rounded-full border-2 border-fg bg-accent px-2.5 py-0.5 text-xs font-bold text-on-accent">Best match</span>}
                  </div>
                  <div className="p-3">
                    <p className="font-bold leading-tight">{p.name}</p>
                    <p className="text-sm text-muted">{money(p.price)}</p>
                    <button className="btn btn-primary btn-sm mt-3 w-full" onClick={() => { add(p.id); toast(`${p.name} added to your cart`); }}>Add to cart</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export function Cart({ open, onClose }) {
  const { cart, setQty, checkout } = useSprout();
  const [step, setStep] = useState('cart');
  const [form, setForm] = useState({ name: '', phone: '', pin: '', address: '' });
  const [err, setErr] = useState('');
  const [paying, setPaying] = useState(false);
  const [order, setOrder] = useState(null);
  const t = totals(cart);
  useEffect(() => { if (open) { setErr(''); setStep(order ? 'done' : 'cart'); } }, [open]);

  function details(e) {
    e.preventDefault();
    if (form.name.trim().length < 2 || !/^[0-9+\s-]{7,}$/.test(form.phone)) return setErr('Add your name and a phone number (any digits work in this demo).');
    if (!/^\d{6}$/.test(form.pin) || form.address.trim().length < 5) return setErr('Add a 6-digit PIN code and a delivery address.');
    setErr('');
    setPaying(true);
  }

  function paid() {
    setPaying(false);
    setOrder(checkout(form));
    setStep('done');
  }

  const close = () => { if (step === 'done') { setOrder(null); setStep('cart'); } onClose(); };

  return (
    <>
      <Modal open={open} onClose={close} variant="right" title={step === 'done' ? 'Order placed' : step === 'details' ? 'Delivery' : 'Your cart'}
        footer={step === 'cart' && cart.length ? <button className="btn btn-primary w-full" onClick={() => setStep('details')}>Checkout · {money(t.total)}</button>
          : step === 'details' ? <div className="flex gap-2"><button className="btn btn-ghost" onClick={() => setStep('cart')}><ArrowLeft size={14} /></button><button className="btn btn-primary flex-1" form="sprout-details">Pay {money(t.total)}</button></div>
          : step === 'done' ? <button className="btn btn-primary w-full" onClick={close}>Keep shopping</button> : null}>
        {step === 'cart' && (cart.length ? (
          <div className="grid gap-5 p-5">
            <div className="rounded-2xl border-2 border-fg bg-sunken p-4">
              <p className="text-sm font-bold">{t.repot ? 'Free repotting unlocked. Nice.' : `Add ${money(t.toRepot)} for free repotting and delivery`}</p>
              <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-fg bg-surface">
                <div className="h-full bg-accent" style={{ width: `${Math.min(100, (t.subtotal / FREE_REPOT) * 100)}%` }} />
              </div>
            </div>
            <ul className="grid gap-3">
              {cart.map((l) => (
                <li key={l.key} className="flex gap-3 rounded-2xl border-2 border-fg bg-surface p-2.5">
                  <img src={img('sprout', l.photo)} alt="" className="size-20 rounded-xl border-2 border-fg object-cover" />
                  <div className="flex flex-1 flex-col">
                    <p className="font-bold leading-tight">{l.name}</p>
                    <p className="text-sm text-muted">{l.pot}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border-2 border-fg">
                        <button className="grid size-7 place-items-center" onClick={() => setQty(l.key, l.qty - 1)} aria-label="Decrease"><Minus size={12} weight="bold" /></button>
                        <span className="w-6 text-center text-sm font-bold">{l.qty}</span>
                        <button className="grid size-7 place-items-center" onClick={() => setQty(l.key, l.qty + 1)} aria-label="Increase"><Plus size={12} weight="bold" /></button>
                      </div>
                      <span className="font-bold">{money(l.unit * l.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="grid gap-1.5 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(t.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Delivery</dt><dd>{t.shipping ? money(t.shipping) : 'Free'}</dd></div>
              <div className="flex justify-between border-t-2 border-fg pt-2 text-base font-bold"><dt>Total</dt><dd>{money(t.total)}</dd></div>
            </dl>
          </div>
        ) : (
          <div className="grid place-items-center gap-3 px-6 py-16 text-center">
            <span className="grid size-16 place-items-center rounded-full border-2 border-fg bg-sunken"><Plant size={28} /></span>
            <p className="font-display text-xl">Nothing growing here yet</p>
            <p className="max-w-xs text-sm text-muted">Add a plant from the shop or take the plant finder quiz.</p>
          </div>
        ))}

        {step === 'details' && (
          <form id="sprout-details" onSubmit={details} noValidate className="grid gap-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="field"><label htmlFor="sp-name">Name</label><input id="sp-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label htmlFor="sp-phone">Phone</label><input id="sp-phone" className="input" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="field"><label htmlFor="sp-pin">PIN code</label><input id="sp-pin" className="input" inputMode="numeric" maxLength={6} value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '') })} /></div>
            <div className="field"><label htmlFor="sp-addr">Delivery address</label><textarea id="sp-addr" className="input min-h-20" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            {err && <p className="error" role="alert">{err}</p>}
            <p className="help">Plants ship in a padded box with a care card. Payment is simulated in this demo.</p>
          </form>
        )}

        {step === 'done' && order && (
          <div className="grid gap-4 p-5 text-center">
            <span className="mx-auto mt-4 grid size-20 -rotate-6 place-items-center rounded-full border-2 border-fg bg-accent shadow-[4px_4px_0_var(--fg)]"><Plant size={36} weight="fill" /></span>
            <p className="font-display text-3xl">Your plants are on the way</p>
            <p className="text-muted">Order <span className="font-mono font-bold text-fg">{order.id}</span> · {money(order.total)}</p>
            <p className="mx-auto max-w-xs text-sm text-muted">In a real build you would get tracking by SMS, and a care reminder a week after delivery.</p>
          </div>
        )}
      </Modal>
      <Modal open={paying} onClose={() => setPaying(false)} variant="bottom" size="sm" title={`Pay ${money(t.total)}`}
        footer={<div className="flex gap-2"><button className="btn btn-ghost" onClick={() => setPaying(false)}>Cancel</button><button className="btn btn-primary flex-1" onClick={paid}>Confirm payment</button></div>}>
        <div className="flex gap-4 p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-fg bg-accent-soft"><CreditCard size={22} /></span>
          <div className="space-y-2 text-[15px] leading-relaxed">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Simulated in this demo</p>
            <p>In a real build this opens a payment page for UPI or cards. Nothing is charged here.</p>
          </div>
        </div>
      </Modal>
    </>
  );
}
