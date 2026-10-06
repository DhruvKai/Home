import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarCheck, CheckCircle, House, VideoCamera } from '@phosphor-icons/react';
import Modal from '../_shared/Modal';
import { Stepper } from '../_shared/bits';
import { cx, fmtDate, fmtTime, isoDay, money, toDate } from '../../lib/format';
import { img } from '../../lib/asset';
import { DEPARTMENTS, DOCTORS, availableSlots, deptById, doctorById, useClinic } from './data';

const STEPS = ['Department', 'Doctor', 'Time', 'Your details', 'Done'];

export default function Booking({ open, onClose, preset }) {
  const appointments = useClinic((s) => s.appointments);
  const book = useClinic((s) => s.book);
  const [step, setStep] = useState(0);
  const [dept, setDept] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', reason: '', mode: 'in-person' });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (!open) return;
    const d = preset?.doctor ? doctorById(preset.doctor) : null;
    setDept(d?.dept ?? preset?.dept ?? null);
    setDoctorId(d?.id ?? null);
    setStep(d ? 2 : preset?.dept ? 1 : 0);
    setDate(null); setTime(null); setDone(null); setErrors({});
  }, [open, preset]);

  const doctor = doctorById(doctorId);
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => isoDay(i)), []);
  const slots = doctor && date ? availableSlots(doctor, date, appointments) : [];

  // Pick the first day with free slots when a doctor is chosen.
  useEffect(() => {
    if (step === 2 && doctor && !date) setDate(days.find((d) => availableSlots(doctor, d, appointments).length) ?? days[0]);
  }, [step, doctor, date, days, appointments]);

  function confirm(e) {
    e.preventDefault();
    const err = {};
    if (form.name.trim().length < 2) err.name = 'Enter the patient\'s full name.';
    if (!/^[0-9+\s-]{7,}$/.test(form.phone)) err.phone = 'Enter a phone number (any digits, this is a demo).';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = 'Check the email address.';
    setErrors(err);
    if (Object.keys(err).length) return;
    const appt = book({ doctorId, date, time, mode: form.mode, patient: { name: form.name, phone: form.phone, email: form.email, reason: form.reason || 'Consultation' } });
    setDone(appt);
    setStep(4);
  }

  const back = step > 0 && step < 4 && <button className="btn btn-ghost btn-sm" onClick={() => setStep(step - 1)}><ArrowLeft size={14} /> Back</button>;

  return (
    <Modal open={open} onClose={onClose} title="Book an appointment" size="lg"
      footer={step < 4 ? (
        <div className="flex items-center justify-between gap-3">
          {back || <span />}
          {step === 2 && <button className="btn btn-primary" disabled={!time} onClick={() => setStep(3)}>Continue</button>}
          {step === 3 && <button className="btn btn-primary" form="clinic-details">Confirm booking</button>}
        </div>
      ) : (
        <button className="btn btn-primary w-full" onClick={onClose}>Done</button>
      )}>
      <Stepper steps={STEPS} current={step} />
      <div className="p-5">
        {step === 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {DEPARTMENTS.map((d) => (
              <button key={d.id} onClick={() => { setDept(d.id); setDoctorId(null); setStep(1); }}
                className={cx('flex gap-3 rounded-2xl border p-4 text-left transition-colors hover:border-accent', dept === d.id ? 'border-accent bg-accent-soft' : 'border-line')}>
                <d.icon size={24} className="shrink-0 text-accent-ink" />
                <span><span className="block font-semibold">{d.name}</span><span className="mt-0.5 block text-sm text-muted">{d.blurb}</span></span>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3">
            <p className="text-sm text-muted">{deptById(dept)?.name}</p>
            {DOCTORS.filter((d) => d.dept === dept).map((d) => (
              <button key={d.id} onClick={() => { setDoctorId(d.id); setDate(null); setTime(null); setStep(2); }}
                className="flex items-center gap-4 rounded-2xl border border-line p-3 text-left hover:border-accent">
                <img src={img('clinic', d.photo)} alt="" className="size-16 rounded-xl object-cover object-top" />
                <span className="flex-1">
                  <span className="block font-semibold">{d.name}</span>
                  <span className="block text-sm text-muted">{d.title} · {d.years} years</span>
                  <span className="mt-1 block text-sm">Consultation {money(d.fee)}{d.video ? ', video available' : ''}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && doctor && (
          <div>
            <div className="flex items-center gap-3">
              <img src={img('clinic', doctor.photo)} alt="" className="size-11 rounded-full object-cover object-top" />
              <div><p className="font-semibold">{doctor.name}</p><p className="text-sm text-muted">{deptById(doctor.dept).name}</p></div>
            </div>
            <p className="label mt-6">Date</p>
            <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-2 no-scrollbar">
              {days.map((d) => {
                const n = availableSlots(doctor, d, appointments).length;
                const dt = toDate(d);
                return (
                  <button key={d} disabled={!n} onClick={() => { setDate(d); setTime(null); }}
                    className={cx('flex w-16 shrink-0 flex-col items-center rounded-xl border py-2 text-sm', date === d ? 'border-accent bg-accent text-on-accent' : 'border-line hover:border-fg/40', !n && 'opacity-40')}>
                    <span className="text-xs">{dt.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                    <span className="text-lg font-bold">{dt.getDate()}</span>
                    <span className="text-[11px]">{n ? `${n} free` : 'Off'}</span>
                  </button>
                );
              })}
            </div>
            <p className="label mt-5">Time {date && <span className="font-normal text-muted">on {fmtDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}</span>}</p>
            {slots.length ? (
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {slots.map((t) => (
                  <button key={t} onClick={() => setTime(t)} aria-pressed={time === t}
                    className={cx('rounded-[10px] border py-2 text-sm font-semibold', time === t ? 'border-accent bg-accent text-on-accent' : 'border-line hover:border-fg/40')}>{fmtTime(t)}</button>
                ))}
              </div>
            ) : <p className="mt-2 text-sm text-muted">No free slots on this day. Try another date.</p>}
          </div>
        )}

        {step === 3 && doctor && (
          <form id="clinic-details" onSubmit={confirm} noValidate className="grid gap-4">
            <div className="rounded-2xl bg-sunken p-4 text-sm">
              <p className="font-semibold">{doctor.name}</p>
              <p className="text-muted">{fmtDate(date, { weekday: 'long', day: 'numeric', month: 'long' })} at {fmtTime(time)} · {money(doctor.fee)}</p>
            </div>
            <fieldset className="grid gap-2">
              <legend className="label mb-2">Visit type</legend>
              <div className="grid grid-cols-2 gap-2">
                {[['in-person', 'At the clinic', House], ['video', 'Video call', VideoCamera]].map(([v, l, I]) => (
                  <label key={v} className={cx('flex cursor-pointer items-center gap-2 rounded-[10px] border p-3 text-sm font-semibold', form.mode === v ? 'border-accent bg-accent-soft' : 'border-line', v === 'video' && !doctor.video && 'pointer-events-none opacity-45')}>
                    <input type="radio" name="mode" value={v} checked={form.mode === v} disabled={v === 'video' && !doctor.video} onChange={() => setForm({ ...form, mode: v })} className="sr-only" />
                    <I size={18} /> {l}
                  </label>
                ))}
              </div>
              {!doctor.video && <p className="help">{doctor.name} sees patients in person only.</p>}
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="field">
                <label htmlFor="bk-name">Patient name</label>
                <input id="bk-name" className="input" value={form.name} aria-invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {errors.name && <p className="error">{errors.name}</p>}
              </div>
              <div className="field">
                <label htmlFor="bk-phone">Phone</label>
                <input id="bk-phone" className="input" inputMode="tel" value={form.phone} aria-invalid={!!errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                {errors.phone && <p className="error">{errors.phone}</p>}
              </div>
            </div>
            <div className="field">
              <label htmlFor="bk-email">Email <span className="font-normal text-muted">(optional)</span></label>
              <input id="bk-email" className="input" type="email" value={form.email} aria-invalid={!!errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p className="error">{errors.email}</p>}
            </div>
            <div className="field">
              <label htmlFor="bk-reason">Reason for visit <span className="font-normal text-muted">(optional)</span></label>
              <textarea id="bk-reason" className="input min-h-20" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </div>
          </form>
        )}

        {step === 4 && done && (
          <div className="py-4 text-center">
            <CheckCircle size={52} weight="fill" className="mx-auto text-accent" />
            <h3 className="mt-3 font-display text-2xl font-bold">You're booked</h3>
            <p className="mt-1 text-muted">Reference <span className="font-mono font-semibold text-fg">{done.ref}</span></p>
            <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-line p-4 text-left text-sm">
              <p className="flex items-center gap-2 font-semibold"><CalendarCheck size={18} className="text-accent-ink" />{fmtDate(done.date, { weekday: 'long', day: 'numeric', month: 'long' })}, {fmtTime(done.time)}</p>
              <p className="mt-2 text-muted">{doctor.name}, {deptById(doctor.dept).name}</p>
              <p className="text-muted">{done.mode === 'video' ? 'Video call: a link would be sent by SMS before the visit.' : 'At the clinic: please arrive 10 minutes early.'}</p>
            </div>
            <p className="mx-auto mt-4 max-w-sm text-sm text-muted">This booking now appears in the clinic admin. In a real build, the patient would also get an SMS and email confirmation.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
