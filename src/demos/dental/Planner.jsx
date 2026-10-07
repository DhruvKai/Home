import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, CheckCircle, Clock, Sparkle } from '@phosphor-icons/react';
import Modal from '../_shared/Modal';
import { Stepper } from '../_shared/bits';
import { cx, fmtDate, fmtTime, isoDay, money, toDate } from '../../lib/format';
import { TREATMENTS, estimate, freeTimes, useDental } from './data';

const STEPS = ['Treatments', 'Estimate', 'Time', 'Details', 'Done'];

// Treatment planner: pick treatments, see a transparent estimate, choose a slot, confirm.
export default function Planner({ open, onClose, preset }) {
  const bookings = useDental((s) => s.bookings);
  const book = useDental((s) => s.book);
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState([]);
  const [pay, setPay] = useState('full');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', nervous: false });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (!open) return;
    setPlan(preset ? [{ id: preset, option: 0 }] : []);
    setStep(0); setPay('full'); setDate(null); setTime(null); setDone(null); setErrors({});
  }, [open, preset]);

  const est = estimate(plan);
  const days = useMemo(() => Array.from({ length: 12 }, (_, i) => isoDay(i + 1)), []);
  const times = date ? freeTimes(date, bookings) : [];

  useEffect(() => {
    if (step === 2 && !date) setDate(days.find((d) => freeTimes(d, bookings).length) ?? days[0]);
  }, [step, date, days, bookings]);

  const toggle = (id) => setPlan((p) => (p.some((x) => x.id === id) ? p.filter((x) => x.id !== id) : [...p, { id, option: 0 }]));
  const setOption = (id, option) => setPlan((p) => p.map((x) => (x.id === id ? { ...x, option } : x)));

  function confirm(e) {
    e.preventDefault();
    const err = {};
    if (form.name.trim().length < 2) err.name = 'Enter your full name.';
    if (!/^[0-9+\s-]{7,}$/.test(form.phone)) err.phone = 'Enter a phone number (any digits work in this demo).';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = 'Check the email address.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setDone(book({ date, time, plan, total: est.total, pay, patient: form }));
    setStep(4);
  }

  const next = [
    <button key="0" className="btn btn-primary" disabled={!plan.length} onClick={() => setStep(1)}>See my estimate</button>,
    <button key="1" className="btn btn-primary" onClick={() => setStep(2)}>Choose a time</button>,
    <button key="2" className="btn btn-primary" disabled={!time} onClick={() => setStep(3)}>Continue</button>,
    <button key="3" className="btn btn-primary" form="dental-details">Confirm visit</button>,
  ][step];

  return (
    <Modal open={open} onClose={onClose} title="Plan your visit" size="lg"
      footer={step < 4 ? (
        <div className="flex items-center justify-between gap-3">
          {step > 0 ? <button className="btn btn-ghost btn-sm" onClick={() => setStep(step - 1)}><ArrowLeft size={14} /> Back</button> : <span className="text-sm text-muted">{plan.length ? `${plan.length} selected · from ${money(est.total)}` : 'Pick one or more'}</span>}
          {next}
        </div>
      ) : <button className="btn btn-primary w-full" onClick={onClose}>Done</button>}>
      <Stepper steps={STEPS} current={step} />
      <div className="p-5">
        {step === 0 && (
          <div className="grid gap-3">
            {TREATMENTS.map((t) => {
              const sel = plan.find((x) => x.id === t.id);
              return (
                <div key={t.id} className={cx('rounded-[20px] border p-4 transition-colors', sel ? 'border-accent bg-accent-soft/60' : 'border-line')}>
                  <button type="button" onClick={() => toggle(t.id)} aria-pressed={!!sel} className="flex w-full items-start gap-3 text-left">
                    <span className={cx('mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border', sel ? 'border-accent bg-accent text-on-accent' : 'border-line')}>{sel && <Check size={12} weight="bold" />}</span>
                    <span className="flex-1"><span className="block font-semibold">{t.name}</span><span className="mt-0.5 block text-sm text-muted">{t.blurb}</span></span>
                    <span className="shrink-0 text-sm font-semibold">from {money(t.price)}</span>
                  </button>
                  {sel && t.options.length > 1 && (
                    <div className="mt-3 flex flex-wrap gap-2 pl-8" role="radiogroup" aria-label={`${t.name} option`}>
                      {t.options.map(([label, extra], i) => (
                        <button key={label} type="button" role="radio" aria-checked={sel.option === i} onClick={() => setOption(t.id, i)}
                          className={cx('rounded-full border px-3 py-1.5 text-[13px] font-medium', sel.option === i ? 'border-accent bg-surface text-accent-ink' : 'border-line text-muted')}>
                          {label}{extra ? ` +${money(extra)}` : ''}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-5">
            <div className="rounded-[20px] bg-sunken p-5">
              <ul className="divide-y divide-line text-[15px]">
                {est.lines.map((l) => (
                  <li key={l.id} className="flex justify-between gap-4 py-2.5"><span><span className="font-semibold">{l.name}</span><span className="block text-sm text-muted">{l.label}</span></span><span className="font-semibold tabular-nums">{money(l.price)}</span></li>
                ))}
              </ul>
              <div className="mt-3 flex items-end justify-between border-t border-line pt-4">
                <span className="text-sm text-muted"><Clock size={14} className="mr-1 inline" />About {est.mins} minutes in the chair</span>
                <span className="font-display text-4xl leading-none">{money(est.total)}</span>
              </div>
            </div>
            {est.monthly ? (
              <fieldset>
                <legend className="label mb-2">How would you like to pay?</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[['full', 'In full', money(est.total)], ['6', '6 months', `${money(est.monthly[6])}/mo`], ['12', '12 months', `${money(est.monthly[12])}/mo`]].map(([v, l, p]) => (
                    <button key={v} type="button" onClick={() => setPay(v)} aria-pressed={pay === v}
                      className={cx('rounded-2xl border p-3 text-left', pay === v ? 'border-accent bg-accent-soft' : 'border-line')}>
                      <span className="block text-sm text-muted">{l}</span><span className="block font-semibold">{p}</span>
                    </button>
                  ))}
                </div>
                <p className="help mt-2">0% plans on treatments over ₹20,000. Shown for illustration, nothing is charged.</p>
              </fieldset>
            ) : <p className="flex items-center gap-2 text-sm text-muted"><Sparkle size={16} className="text-accent" /> Paid at the studio after your visit. No deposit.</p>}
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="label">Day</p>
            <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-2 no-scrollbar">
              {days.map((d) => {
                const n = freeTimes(d, bookings).length;
                const dt = toDate(d);
                return (
                  <button key={d} disabled={!n} onClick={() => { setDate(d); setTime(null); }} aria-pressed={date === d}
                    className={cx('flex w-16 shrink-0 flex-col items-center rounded-2xl border py-2.5 text-sm', date === d ? 'border-accent bg-accent text-on-accent' : 'border-line', !n && 'opacity-40')}>
                    <span className="text-xs">{dt.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                    <span className="font-display text-2xl leading-tight">{dt.getDate()}</span>
                    <span className="text-[11px]">{n ? `${n} free` : 'Closed'}</span>
                  </button>
                );
              })}
            </div>
            <p className="label mt-5">Time {date && <span className="font-normal text-muted">on {fmtDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}</span>}</p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {times.map((t) => (
                <button key={t} onClick={() => setTime(t)} aria-pressed={time === t}
                  className={cx('rounded-full border py-2 text-sm font-semibold', time === t ? 'border-accent bg-accent text-on-accent' : 'border-line')}>{fmtTime(t)}</button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <form id="dental-details" onSubmit={confirm} noValidate className="grid gap-4">
            <div className="rounded-2xl bg-sunken p-4 text-sm">
              <p className="font-semibold">{est.lines.map((l) => l.name).join(', ')}</p>
              <p className="text-muted">{fmtDate(date, { weekday: 'long', day: 'numeric', month: 'long' })} at {fmtTime(time)} · estimate {money(est.total)}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="field">
                <label htmlFor="dn-name">Full name</label>
                <input id="dn-name" className="input" value={form.name} aria-invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {errors.name && <p className="error">{errors.name}</p>}
              </div>
              <div className="field">
                <label htmlFor="dn-phone">Phone</label>
                <input id="dn-phone" className="input" inputMode="tel" value={form.phone} aria-invalid={!!errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                {errors.phone && <p className="error">{errors.phone}</p>}
              </div>
            </div>
            <div className="field">
              <label htmlFor="dn-email">Email <span className="font-normal text-muted">(optional)</span></label>
              <input id="dn-email" className="input" type="email" value={form.email} aria-invalid={!!errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p className="error">{errors.email}</p>}
            </div>
            <label className="flex items-start gap-3 rounded-2xl border border-line p-3 text-sm">
              <input type="checkbox" checked={form.nervous} onChange={(e) => setForm({ ...form, nervous: e.target.checked })} className="mt-0.5 size-4 accent-[var(--accent)]" />
              <span><span className="font-semibold">I get nervous at the dentist</span><span className="block text-muted">We add ten quiet minutes to talk it through first.</span></span>
            </label>
          </form>
        )}

        {step === 4 && done && (
          <div className="py-4 text-center">
            <CheckCircle size={52} weight="fill" className="mx-auto text-accent" />
            <h3 className="mt-3 font-display text-4xl">See you soon</h3>
            <p className="mt-1 text-muted">Reference <span className="font-mono font-semibold text-fg">{done.ref}</span></p>
            <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-line p-4 text-left text-sm">
              <p className="font-semibold">{fmtDate(done.date, { weekday: 'long', day: 'numeric', month: 'long' })}, {fmtTime(done.time)}</p>
              <p className="mt-1 text-muted">{est.lines.map((l) => l.name).join(', ')}</p>
              <p className="mt-1 text-muted">Estimate {money(done.total)}{done.pay !== 'full' ? `, ${done.pay} monthly payments` : ''}</p>
            </div>
            <p className="mx-auto mt-4 max-w-sm text-sm text-muted">In a real build you would get an SMS and email confirmation with a link to move or cancel.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
