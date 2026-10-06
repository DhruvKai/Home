import { useEffect, useState } from 'react';
import { CheckCircle } from '@phosphor-icons/react';
import Modal from '../_shared/Modal';
import { fmtDate, isoDay, money } from '../../lib/format';
import { ROOMS, TAX_RATE, isAvailable, nightsBetween, roomById, useHotel } from './data';

export function StaySummary({ roomId, checkIn, checkOut, guests }) {
  const room = roomById(roomId);
  const nights = nightsBetween(checkIn, checkOut);
  if (!room || !nights) return <p className="text-sm text-muted">Choose a room and dates to see the total.</p>;
  const sub = room.rate * nights;
  const tax = sub * TAX_RATE;
  return (
    <dl className="grid gap-1.5 text-sm">
      <div className="flex justify-between"><dt className="text-muted">{room.name}, {guests} guest{guests > 1 ? 's' : ''}</dt><dd /></div>
      <div className="flex justify-between"><dt className="text-muted">{fmtDate(checkIn)} to {fmtDate(checkOut)}</dt><dd>{nights} night{nights > 1 ? 's' : ''}</dd></div>
      <div className="flex justify-between"><dt className="text-muted">{money(room.rate)} x {nights}</dt><dd>{money(sub)}</dd></div>
      <div className="flex justify-between"><dt className="text-muted">Taxes (12%)</dt><dd>{money(tax)}</dd></div>
      <div className="mt-1 flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>Estimated total</dt><dd>{money(sub + tax)}</dd></div>
    </dl>
  );
}

export function EnquiryForm({ initial, onDone, compact }) {
  const booked = useHotel((s) => s.booked);
  const addEnquiry = useHotel((s) => s.addEnquiry);
  const [v, setV] = useState({ roomId: ROOMS[0].id, checkIn: isoDay(7), checkOut: isoDay(9), guests: 2, name: '', email: '', notes: '', ...initial });
  const [errors, setErrors] = useState({});
  useEffect(() => { if (initial) setV((s) => ({ ...s, ...initial })); }, [initial]);
  const set = (k) => (e) => setV({ ...v, [k]: k === 'guests' ? Number(e.target.value) : e.target.value });
  const room = roomById(v.roomId);
  const nights = nightsBetween(v.checkIn, v.checkOut);
  const free = room && isAvailable(room, v.checkIn, v.checkOut, v.guests, booked);

  function submit(e) {
    e.preventDefault();
    const err = {};
    if (nights < 1) err.dates = 'Check-out must be after check-in.';
    else if (!free) err.dates = v.guests > room.guests ? `${room.name} sleeps up to ${room.guests}.` : `${room.name} is booked on some of these nights. Try other dates or another room.`;
    if (v.name.trim().length < 2) err.name = 'Add your name.';
    if (!/^\S+@\S+\.\S+$/.test(v.email)) err.email = 'Add a valid email.';
    setErrors(err);
    if (Object.keys(err).length) return;
    onDone(addEnquiry({ ...v, nights, total: room.rate * nights * (1 + TAX_RATE) }));
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div className={`grid gap-4 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <div className="field sm:col-span-2">
          <label htmlFor="hq-room">Room</label>
          <select id="hq-room" className="input" value={v.roomId} onChange={set('roomId')}>
            {ROOMS.map((r) => <option key={r.id} value={r.id}>{r.name}, from {money(r.rate)} / night</option>)}
          </select>
        </div>
        <div className="field"><label htmlFor="hq-in">Check-in</label><input id="hq-in" type="date" className="input" min={isoDay(0)} value={v.checkIn} onChange={set('checkIn')} /></div>
        <div className="field"><label htmlFor="hq-out">Check-out</label><input id="hq-out" type="date" className="input" min={v.checkIn} value={v.checkOut} onChange={set('checkOut')} /></div>
        {errors.dates && <p className="error sm:col-span-2">{errors.dates}</p>}
        <div className="field"><label htmlFor="hq-guests">Guests</label>
          <select id="hq-guests" className="input" value={v.guests} onChange={set('guests')}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</select>
        </div>
        <div className="field"><label htmlFor="hq-name">Full name</label><input id="hq-name" className="input" autoComplete="name" value={v.name} onChange={set('name')} aria-invalid={!!errors.name} />{errors.name && <p className="error">{errors.name}</p>}</div>
        <div className="field sm:col-span-2"><label htmlFor="hq-email">Email</label><input id="hq-email" type="email" className="input" autoComplete="email" value={v.email} onChange={set('email')} aria-invalid={!!errors.email} />{errors.email && <p className="error">{errors.email}</p>}</div>
        <div className="field sm:col-span-2"><label htmlFor="hq-notes">Requests <span className="font-normal text-muted">(optional)</span></label><textarea id="hq-notes" className="input min-h-20" value={v.notes} onChange={set('notes')} placeholder="Arrival time, dietary needs, a special occasion" /></div>
      </div>
      <div className="rounded-2xl bg-sunken p-4">
        <StaySummary {...v} />
        {nights > 0 && room && <p className={`mt-3 text-sm font-semibold ${free ? 'text-accent-ink' : 'text-bad'}`}>{free ? 'Available for these dates' : 'Not available for these dates'}</p>}
      </div>
      <button className="btn btn-primary">Send booking enquiry</button>
      <p className="help">No payment now. The reservations team confirms by email within a day.</p>
    </form>
  );
}

export function EnquiryDone({ enquiry, onClose }) {
  const room = roomById(enquiry.roomId);
  return (
    <div className="p-6 text-center">
      <CheckCircle size={52} weight="fill" className="mx-auto text-accent" />
      <h3 className="mt-3 font-display text-3xl font-semibold">Enquiry received</h3>
      <p className="mt-1 text-muted">Reference <span className="font-mono font-semibold text-fg">{enquiry.ref}</span></p>
      <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-line p-4 text-left"><StaySummary {...enquiry} /></div>
      <p className="mx-auto mt-4 max-w-sm text-sm text-muted">In a real build, {enquiry.name.split(' ')[0]} would get a confirmation email and the hotel would see this in its booking inbox. Nothing is reserved in this demo.</p>
      {onClose && <button className="btn btn-primary mt-6" onClick={onClose}>Close</button>}
      {room && <span className="sr-only">{room.name}</span>}
    </div>
  );
}

export default function EnquiryModal({ open, onClose, initial }) {
  const [done, setDone] = useState(null);
  useEffect(() => { if (open) setDone(null); }, [open]);
  return (
    <Modal open={open} onClose={onClose} title={done ? undefined : 'Booking enquiry'} size="md" variant="bottom">
      <div className={done ? '' : 'p-5'}>
        {done ? <EnquiryDone enquiry={done} onClose={onClose} /> : <EnquiryForm initial={initial} onDone={setDone} compact />}
      </div>
    </Modal>
  );
}
