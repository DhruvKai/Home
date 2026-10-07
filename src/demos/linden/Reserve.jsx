import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CaretLeft, CaretRight, Check, Minus, Plus } from '@phosphor-icons/react';
import { img } from '../../lib/asset';
import { cx, fmtDate, isoDay, money } from '../../lib/format';
import { ADDONS, ROOMS, quote, roomById, roomFree, useLinden } from './data';

const STEPS = ['Dates', 'Room', 'Extras', 'Guest'];
const ROMAN = ['I', 'II', 'III', 'IV'];
const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Month grid with two-tap range selection.
function RangeCalendar({ checkIn, checkOut, onChange }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const today = isoDay(0);
  const cells = useMemo(() => {
    const first = (cursor.getDay() + 6) % 7;
    const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => iso(new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)))];
  }, [cursor]);
  const thisMonth = new Date().getMonth() === cursor.getMonth() && new Date().getFullYear() === cursor.getFullYear();

  function pick(d) {
    if (!checkIn || checkOut || d <= checkIn) onChange({ checkIn: d, checkOut: null });
    else onChange({ checkIn, checkOut: d });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <button type="button" className="grid size-10 place-items-center border border-line disabled:opacity-30" disabled={thisMonth} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month"><CaretLeft size={16} /></button>
        <p className="font-display text-2xl italic">{cursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        <button type="button" className="grid size-10 place-items-center border border-line" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month"><CaretRight size={16} /></button>
      </div>
      <div className="mt-4 grid grid-cols-7 text-center text-[11px] uppercase tracking-[0.16em] text-muted">{WEEK.map((w, i) => <span key={i} className="py-2">{w}</span>)}</div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const past = d < today;
          const edge = d === checkIn || d === checkOut;
          const inside = checkIn && checkOut && d > checkIn && d < checkOut;
          return (
            <button key={d} type="button" disabled={past} onClick={() => pick(d)} aria-pressed={edge}
              aria-label={fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' })}
              className={cx('aspect-square text-sm tabular-nums transition-colors', past && 'text-muted/40', edge && 'bg-accent font-semibold text-on-accent', inside && 'bg-accent-soft text-accent-ink', !past && !edge && !inside && 'hover:bg-sunken')}>
              {Number(d.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Reserve({ presetRoom }) {
  const stays = useLinden((s) => s.stays);
  const reserve = useLinden((s) => s.reserve);
  const [step, setStep] = useState(0);
  const [v, setV] = useState({ checkIn: isoDay(7), checkOut: isoDay(9), guests: 2, room: null, addons: ['breakfast'] });
  const [form, setForm] = useState({ name: '', email: '', arrival: '' });
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);

  useEffect(() => { if (presetRoom) setV((x) => ({ ...x, room: presetRoom.id })); }, [presetRoom]);

  const q = quote(v);
  const room = roomById(v.room);
  const fits = (r) => r.sleeps >= v.guests && v.checkOut && roomFree(r.id, v.checkIn, v.checkOut, stays);

  function go(n) {
    setErr('');
    if (n === 1 && (!v.checkOut || q.n < 1)) return setErr('Choose a check-out date.');
    if (n === 1 && q.n > 14) return setErr('For stays over 14 nights, write to reservations.');
    if (n === 2 && (!room || !fits(room))) return setErr('Choose a room that is free for these dates.');
    setStep(n);
  }

  function submit(e) {
    e.preventDefault();
    if (form.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(form.email)) return setErr('Add your name and an email address.');
    setErr('');
    setDone(reserve({ ...v, guest: form, total: q.total }));
  }

  if (done) {
    return (
      <div className="border border-line p-8 text-center sm:p-14">
        <p className="text-[11px] uppercase tracking-[0.2em] text-accent">Reservation held</p>
        <h3 className="mt-4 font-display text-4xl italic sm:text-5xl">We will keep the lights low.</h3>
        <p className="mt-4 text-muted">{room.name}, {fmtDate(done.checkIn, { day: 'numeric', month: 'long' })} to {fmtDate(done.checkOut, { day: 'numeric', month: 'long' })}, {done.guests} guest{done.guests > 1 ? 's' : ''}</p>
        <p className="mt-1 text-muted">Reference <span className="font-mono text-fg">{done.ref}</span> · {money(done.total)} on arrival</p>
        <button className="btn btn-ghost mt-8" onClick={() => { setDone(null); setStep(0); setV({ ...v, room: null }); }}>Make another reservation</button>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-1 border border-line lg:grid-cols-[1.5fr_1fr]">
      <div className="min-w-0 p-5 sm:p-8">
        <ol className="flex flex-wrap gap-x-6 gap-y-2 border-b border-line pb-5" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? 'step' : undefined} className={cx('flex items-baseline gap-2 text-[11px] uppercase tracking-[0.18em]', i === step ? 'text-fg' : 'text-muted')}>
              <span className={cx('font-display text-lg normal-case italic tracking-normal', i <= step && 'text-accent')}>{ROMAN[i]}</span>{s}
            </li>
          ))}
        </ol>

        <div className="pt-6">
          {step === 0 && (
            <div className="grid gap-8 md:grid-cols-[1fr_auto]">
              <RangeCalendar checkIn={v.checkIn} checkOut={v.checkOut} onChange={(r) => setV({ ...v, ...r })} />
              <div className="md:w-44">
                <p className="label">Guests</p>
                <div className="mt-3 flex items-center justify-between border border-line">
                  <button type="button" className="grid size-11 place-items-center disabled:opacity-30" disabled={v.guests <= 1} onClick={() => setV({ ...v, guests: v.guests - 1 })} aria-label="Fewer guests"><Minus size={14} /></button>
                  <span className="font-display text-2xl tabular-nums" aria-live="polite">{v.guests}</span>
                  <button type="button" className="grid size-11 place-items-center disabled:opacity-30" disabled={v.guests >= 4} onClick={() => setV({ ...v, guests: v.guests + 1 })} aria-label="More guests"><Plus size={14} /></button>
                </div>
                <p className="label mt-6">Stay</p>
                <p className="mt-2 font-display text-2xl">{v.checkOut ? `${q.n} night${q.n > 1 ? 's' : ''}` : 'Pick check-out'}</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3">
              {ROOMS.map((r) => {
                const ok = fits(r);
                return (
                  <button key={r.id} type="button" disabled={!ok} onClick={() => setV({ ...v, room: r.id })} aria-pressed={v.room === r.id}
                    className={cx('grid grid-cols-[96px_1fr] gap-4 border p-3 text-left transition-colors sm:grid-cols-[140px_1fr_auto] sm:items-center', v.room === r.id ? 'border-accent' : 'border-line hover:border-muted', !ok && 'opacity-40')}>
                    <img src={img('linden', r.photo)} alt="" className="aspect-[4/3] w-full object-cover" />
                    <span>
                      <span className="block font-display text-xl">{r.name}</span>
                      <span className="block text-sm text-muted">{r.size} m² · sleeps {r.sleeps} · {r.view}</span>
                      {!ok && <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-accent">{r.sleeps < v.guests ? 'Too small for your party' : 'Not free on these dates'}</span>}
                    </span>
                    <span className="col-span-2 text-sm sm:col-span-1 sm:text-right"><span className="font-display text-xl">{money(r.rate)}</span><span className="text-muted"> / night</span></span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-2">
              {ADDONS.map((a) => {
                const on = v.addons.includes(a.id);
                return (
                  <button key={a.id} type="button" aria-pressed={on} onClick={() => setV({ ...v, addons: on ? v.addons.filter((x) => x !== a.id) : [...v.addons, a.id] })}
                    className={cx('flex items-center gap-4 border p-4 text-left', on ? 'border-accent' : 'border-line')}>
                    <span className={cx('grid size-5 shrink-0 place-items-center border', on ? 'border-accent bg-accent text-on-accent' : 'border-muted')}>{on && <Check size={12} weight="bold" />}</span>
                    <span className="flex-1">{a.name}</span>
                    <span className="text-sm text-muted">{money(a.price)}{a.per === 'guest-night' ? ' per guest, per night' : ''}</span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <form id="linden-guest" onSubmit={submit} noValidate className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="field"><label htmlFor="ln-name">Full name</label><input id="ln-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="field"><label htmlFor="ln-email">Email</label><input id="ln-email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="field">
                <label htmlFor="ln-arr">Arriving around</label>
                <select id="ln-arr" className="input" value={form.arrival} onChange={(e) => setForm({ ...form, arrival: e.target.value })}>
                  <option value="">Not sure yet</option>{['Before noon', 'Afternoon', 'Evening', 'After midnight'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <p className="help">Nothing is charged now. The room is held and paid on arrival in this demo.</p>
            </form>
          )}

          {err && <p className="error mt-5" role="alert">{err}</p>}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
            {step > 0 ? <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setErr(''); setStep(step - 1); }}><ArrowLeft size={14} /> Back</button> : <span />}
            {step < 3
              ? <button type="button" className="btn btn-primary" onClick={() => go(step + 1)}>Continue <ArrowRight size={14} /></button>
              : <button className="btn btn-primary" form="linden-guest">Hold my room</button>}
          </div>
        </div>
      </div>

      <aside className="border-t border-line bg-surface p-5 sm:p-8 lg:border-l lg:border-t-0">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Your stay</p>
        {room ? <img src={img('linden', room.photo)} alt="" className="mt-4 aspect-[16/10] w-full object-cover" /> : <div className="mt-4 grid aspect-[16/10] place-items-center border border-dashed border-line text-sm text-muted">Room not chosen</div>}
        <p className="mt-4 font-display text-2xl">{room?.name ?? 'Any room'}</p>
        <p className="text-sm text-muted">{fmtDate(v.checkIn, { day: 'numeric', month: 'short' })} to {v.checkOut ? fmtDate(v.checkOut, { day: 'numeric', month: 'short' }) : '...'} · {v.guests} guest{v.guests > 1 ? 's' : ''}</p>
        <dl className="mt-6 grid gap-2 text-sm">
          {room && <div className="flex justify-between"><dt className="text-muted">{q.n} night{q.n > 1 ? 's' : ''} × {money(room.rate)}</dt><dd>{money(q.roomTotal)}</dd></div>}
          {q.extras.map((a) => <div key={a.id} className="flex justify-between gap-4"><dt className="text-muted">{a.name}</dt><dd>{money(a.total)}</dd></div>)}
          {room && <div className="flex justify-between"><dt className="text-muted">Taxes, 18%</dt><dd>{money(q.tax)}</dd></div>}
        </dl>
        <div className="mt-5 flex items-end justify-between border-t border-line pt-5">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Total</span>
          <span className="font-display text-3xl text-accent">{room ? money(q.total) : '...'}</span>
        </div>
      </aside>
    </div>
  );
}
