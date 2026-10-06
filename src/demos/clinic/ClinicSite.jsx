import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CalendarPlus, ChatCircleDots, Clock, FileText, House, IdentificationCard, List, MapPin, Phone, Pill,
  ShieldCheck, Syringe, Star, VideoCamera, X, Heartbeat, Microscope, Ambulance,
} from '@phosphor-icons/react';
import { img } from '../../lib/asset';
import { cx, fmtTime, money } from '../../lib/format';
import { Accordion, StylisedMap } from '../_shared/bits';
import Modal from '../_shared/Modal';
import Simulated from '../_shared/Simulated';
import StartProjectCTA from '../_shared/StartProjectCTA';
import { toast } from '../_shared/toast';
import Booking from './Booking';
import { CLINIC, DAY_NAMES, DEPARTMENTS, DOCTORS, availableSlots, deptById, openStatus, useClinic } from './data';
import { isoDay } from '../../lib/format';

const NAV = [['Departments', '#departments'], ['Doctors', '#doctors'], ['Visiting', '#visit'], ['FAQ', '#faq']];

const SERVICES = [
  [Heartbeat, 'Health check-ups', 'Annual and pre-employment packages with a same-day doctor review.'],
  [Syringe, 'Vaccinations', 'Childhood schedule, flu and travel vaccines.'],
  [Microscope, 'Lab tests', 'In-house sample collection, reports by email.'],
  [Pill, 'Pharmacy', 'Prescriptions filled on the ground floor.'],
  [VideoCamera, 'Video consultations', 'Follow-ups and second opinions from home.'],
  [Ambulance, 'Minor procedures', 'Dressings, stitches and small procedures on site.'],
];

const FAQ = [
  ['Do I need a referral to see a specialist?', 'No. You can book any of our doctors directly. If you have a referral letter or earlier reports, bring them along.'],
  ['How do video consultations work?', 'Choose "Video call" when you book. You get a link by SMS 15 minutes before the appointment, and a prescription by email after the call if one is needed.'],
  ['Can I cancel or reschedule?', 'Yes, up to two hours before your slot, using the link in your confirmation message or by calling the front desk.'],
  ['Do you accept insurance?', 'We work with most major insurers for cashless claims. Bring your policy card and a photo ID, and the front desk will check eligibility.'],
  ['Is there parking?', 'Yes, the Meridian Arcade basement has visitor parking, and the first hour is free for patients.'],
];

function Header({ onBook }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky z-30 border-b border-line bg-bg/90 backdrop-blur-md" style={{ top: 'var(--bar-h, 0px)' }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-on-accent"><Star size={18} weight="fill" /></span>
          Northstar Clinic
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(([l, h]) => <a key={h} href={h} className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:text-fg">{l}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <button className="btn btn-primary btn-sm" onClick={onBook}><CalendarPlus size={16} /> <span className="hidden sm:inline">Book appointment</span><span className="sm:hidden">Book</span></button>
          <button className="grid size-9 place-items-center rounded-full hover:bg-sunken md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X size={20} /> : <List size={20} />}</button>
        </div>
      </div>
      {open && (
        <nav className="grid gap-1 border-t border-line px-4 pb-4 pt-2 md:hidden">
          {NAV.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5">{l}</a>)}
        </nav>
      )}
    </header>
  );
}

function OpenBadge() {
  const [s, setS] = useState(() => openStatus());
  useEffect(() => { const t = setInterval(() => setS(openStatus()), 60000); return () => clearInterval(t); }, []);
  return (
    <span className={cx('inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold', s.open ? 'bg-accent-soft text-accent-ink' : 'bg-sunken text-muted')}>
      <span className={cx('size-2 rounded-full', s.open ? 'bg-accent' : 'bg-muted')} />
      {s.open ? `Open now, until ${fmtTime(s.until)}` : s.nextDay ? `Closed, opens ${s.nextDay} at ${fmtTime(s.at)}` : 'Closed'}
    </span>
  );
}

function DoctorSchedule({ doctor, onClose, onBook }) {
  const appointments = useClinic((s) => s.appointments);
  if (!doctor) return null;
  const days = Array.from({ length: 7 }, (_, i) => isoDay(i));
  return (
    <Modal open={!!doctor} onClose={onClose} title={doctor.name} size="lg"
      footer={<button className="btn btn-primary w-full sm:w-auto" onClick={() => onBook(doctor.id)}>Book with {doctor.name.replace('Dr. ', 'Dr ')}</button>}>
      <div className="grid gap-6 p-5 sm:grid-cols-[180px_1fr]">
        <img src={img('clinic', doctor.photo)} alt={doctor.name} className="aspect-[4/5] w-full rounded-2xl object-cover object-top" />
        <div>
          <p className="font-semibold text-accent-ink">{deptById(doctor.dept).name}</p>
          <p className="mt-1 text-sm text-muted">{doctor.title}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted">Experience</dt><dd className="font-semibold">{doctor.years} years</dd></div>
            <div><dt className="text-muted">Consultation</dt><dd className="font-semibold">{money(doctor.fee)}</dd></div>
            <div><dt className="text-muted">Languages</dt><dd className="font-semibold">{doctor.languages.join(', ')}</dd></div>
            <div><dt className="text-muted">Video visits</dt><dd className="font-semibold">{doctor.video ? 'Available' : 'In person only'}</dd></div>
          </dl>
          <p className="label mt-6">Next 7 days</p>
          <ul className="mt-2 grid gap-1.5 text-sm">
            {days.map((d) => {
              const free = availableSlots(doctor, d, appointments);
              const dt = new Date(d + 'T00:00');
              return (
                <li key={d} className="flex items-center justify-between rounded-[10px] bg-sunken px-3 py-2">
                  <span className="font-medium">{dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <span className={free.length ? 'text-accent-ink' : 'text-muted'}>
                    {doctor.days.includes(dt.getDay()) ? (free.length ? `${free.length} slots from ${fmtTime(free[0])}` : 'Fully booked') : 'Not in clinic'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Modal>
  );
}

function EnquiryForm() {
  const addEnquiry = useClinic((s) => s.addEnquiry);
  const [v, setV] = useState({ name: '', topic: 'Appointments', message: '' });
  const [err, setErr] = useState('');
  function submit(e) {
    e.preventDefault();
    if (!v.name.trim() || v.message.trim().length < 5) return setErr('Add your name and a short message.');
    addEnquiry(v);
    setV({ name: '', topic: 'Appointments', message: '' });
    setErr('');
    toast('Message sent. The front desk sees it in the admin inbox.');
  }
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field"><label htmlFor="enq-name">Your name</label><input id="enq-name" className="input" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></div>
        <div className="field"><label htmlFor="enq-topic">Topic</label>
          <select id="enq-topic" className="input" value={v.topic} onChange={(e) => setV({ ...v, topic: e.target.value })}>
            {['Appointments', 'Reports', 'Insurance', 'Other'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="field"><label htmlFor="enq-msg">Message</label><textarea id="enq-msg" className="input min-h-24" value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} /></div>
      {err && <p className="error">{err}</p>}
      <button className="btn btn-ghost justify-self-start">Send message</button>
    </form>
  );
}

export default function ClinicSite() {
  const [booking, setBooking] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sim, setSim] = useState(null);
  const openBooking = (preset = {}) => { setProfile(null); setBooking(preset); };
  const status = openStatus();
  const today = new Date().getDay();

  return (
    <div id="top">
      <Header onBook={() => openBooking()} />

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:pt-16">
        <div>
          <OpenBadge />
          <h1 className="mt-5 max-w-[15ch] font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">Specialist care, close to home.</h1>
          <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-muted">Five specialties under one roof. See a doctor today, in person or by video.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={() => openBooking()}><CalendarPlus size={18} /> Book appointment</button>
            <button className="btn btn-ghost" onClick={() => setSim('whatsapp')}><ChatCircleDots size={18} /> WhatsApp us</button>
          </div>
        </div>
        <div className="relative">
          <img src={img('clinic', 'consult')} alt="A doctor talking with a patient in a consultation room" className="aspect-[5/4] w-full rounded-[28px] object-cover" />
          <div className="absolute -bottom-6 left-4 right-4 grid grid-cols-3 gap-2 rounded-2xl border border-line bg-surface p-3 shadow-xl sm:left-8 sm:right-auto sm:w-[380px]">
            {[['5', 'specialties'], ['7 days', 'a week'], ['Same day', 'slots']].map(([a, b]) => (
              <div key={b} className="text-center"><p className="font-display text-lg font-extrabold">{a}</p><p className="text-xs text-muted">{b}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="departments" className="scroll-mt-32 bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">Departments</h2>
          <p className="mt-3 max-w-[55ch] text-muted">Pick a department to see its doctors and the next free slots.</p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {DEPARTMENTS.map((d) => (
              <button key={d.id} onClick={() => openBooking({ dept: d.id })}
                className="group flex flex-col rounded-2xl border border-line bg-bg p-5 text-left transition-colors hover:border-accent">
                <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-ink"><d.icon size={22} /></span>
                <span className="mt-5 font-display text-lg font-bold">{d.name}</span>
                <span className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{d.blurb}</span>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-ink">Book <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></span>
              </button>
            ))}
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <img src={img('clinic', 'reception')} alt="The clinic reception desk" loading="lazy" className="aspect-[4/3] w-full rounded-[28px] object-cover" />
            <div>
              <h3 className="font-display text-2xl font-extrabold tracking-tight">Also at Northstar</h3>
              <ul className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {SERVICES.map(([I, t, d]) => (
                  <li key={t} className="flex gap-3">
                    <I size={22} className="mt-0.5 shrink-0 text-accent-ink" />
                    <div><p className="font-semibold">{t}</p><p className="mt-0.5 text-sm leading-relaxed text-muted">{d}</p></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="doctors" className="mx-auto max-w-7xl scroll-mt-32 px-4 py-16 sm:px-6 md:py-24">
        <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">Our doctors</h2>
        <p className="mt-3 max-w-[55ch] text-muted">Open a profile to see qualifications, languages and the week's schedule.</p>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {DOCTORS.map((d) => (
            <button key={d.id} onClick={() => setProfile(d)} className="group text-left">
              <div className="overflow-hidden rounded-2xl bg-sunken">
                <img src={img('clinic', d.photo)} alt={d.name} loading="lazy" className="aspect-[4/5] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
              </div>
              <p className="mt-3 font-display font-bold">{d.name}</p>
              <p className="text-sm text-muted">{deptById(d.dept).name}, {d.years} yrs</p>
              <p className="mt-1 text-sm font-semibold text-accent-ink">View schedule</p>
            </button>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted">Doctors shown are fictional sample profiles.</p>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">Your consultation</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-line p-5">
                <House size={24} className="text-accent-ink" />
                <p className="mt-4 font-display text-lg font-bold">At the clinic</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">15 to 20 minutes with your doctor. Fees from {money(700)}, paid at the front desk by card or UPI.</p>
              </div>
              <div className="rounded-2xl border border-line p-5">
                <VideoCamera size={24} className="text-accent-ink" />
                <p className="mt-4 font-display text-lg font-bold">Video call</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">Same fee, from home. A link arrives by SMS, and prescriptions are emailed after the call.</p>
              </div>
            </div>
            <p className="label mt-8">What to bring</p>
            <ul className="mt-3 grid gap-3 text-[15px] sm:grid-cols-2">
              {[[IdentificationCard, 'Photo ID and insurance card'], [FileText, 'Earlier reports or scans'], [Pill, 'A list of current medicines'], [ShieldCheck, 'Your booking reference']].map(([I, t]) => (
                <li key={t} className="flex items-center gap-2.5"><I size={20} className="text-muted" />{t}</li>
              ))}
            </ul>
          </div>
          <img src={img('clinic', 'digital')} alt="A doctor using a phone" loading="lazy" className="aspect-[4/3] w-full rounded-[28px] object-cover lg:aspect-auto lg:h-full" />
        </div>
      </section>

      <section id="visit" className="mx-auto max-w-7xl scroll-mt-32 px-4 py-16 sm:px-6 md:py-24">
        <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">Visiting the clinic</h2>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid gap-6">
            <div>
              <div className="flex items-center gap-2"><Clock size={20} className="text-accent-ink" /><p className="font-semibold">Opening hours</p></div>
              <dl className="mt-3 grid gap-1 text-[15px]">
                {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                  const h = CLINIC.hours.find(([x]) => x === d);
                  return (
                    <div key={d} className={cx('flex justify-between rounded-lg px-3 py-1.5', d === today && 'bg-accent-soft font-semibold')}>
                      <dt>{DAY_NAMES[d]}{d === today && ' (today)'}</dt>
                      <dd>{fmtTime(h[1])} to {fmtTime(h[2])}</dd>
                    </div>
                  );
                })}
              </dl>
              <p className="mt-3 text-sm text-muted">{status.open ? 'We are open right now.' : 'We are closed right now.'}</p>
            </div>
            <div>
              <div className="flex items-center gap-2"><MapPin size={20} className="text-accent-ink" /><p className="font-semibold">Address</p></div>
              <p className="mt-2 text-muted">{CLINIC.address.join(', ')} <span className="text-xs">(fictional)</span></p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn btn-ghost btn-sm" onClick={() => setSim('call')}><Phone size={16} /> Call front desk</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setSim('whatsapp')}><ChatCircleDots size={16} /> WhatsApp</button>
              </div>
            </div>
          </div>
          <StylisedMap label="Northstar Clinic" className="min-h-72" />
        </div>
        <div className="mt-12 grid gap-8 rounded-2xl border border-line bg-surface p-5 sm:p-8 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h3 className="font-display text-xl font-extrabold">Send us a message</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">Questions about reports, insurance or appointments. The front desk replies within the day.</p>
          </div>
          <EnquiryForm />
        </div>
      </section>

      <section id="faq" className="scroll-mt-32 bg-surface py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_2fr]">
          <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">Questions patients ask</h2>
          <Accordion items={FAQ} />
        </div>
      </section>

      <StartProjectCTA projectRef="clinic" title="Need something like this for your clinic?"
        text="Online booking, doctor schedules and a front-desk admin, set up around how your clinic works." />

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2 font-display font-bold text-fg"><Star size={16} weight="fill" className="text-accent" /> Northstar Clinic</p>
          <div className="flex gap-5">
            <a href="#doctors" className="hover:text-fg">Doctors</a>
            <a href="#visit" className="hover:text-fg">Visiting</a>
            <Link to="/demos/clinic/admin" className="font-semibold text-accent-ink hover:underline">Staff admin</Link>
          </div>
        </div>
      </footer>

      <Booking open={!!booking} preset={booking} onClose={() => setBooking(null)} />
      <DoctorSchedule doctor={profile} onClose={() => setProfile(null)} onBook={(id) => openBooking({ doctor: id })} />
      <Simulated open={sim === 'whatsapp'} onClose={() => setSim(null)} kind="whatsapp" title="WhatsApp the clinic">
        <p>In a real build this opens a WhatsApp chat with the clinic's front desk, with a message like "Hi, I'd like to book an appointment" ready to send.</p>
        <p className="text-muted">No number is attached in this demo.</p>
      </Simulated>
      <Simulated open={sim === 'call'} onClose={() => setSim(null)} kind="call" title="Call the front desk">
        <p>In a real build this button dials the clinic's phone number on mobile.</p>
        <p className="text-muted">This demo has no real phone number.</p>
      </Simulated>
    </div>
  );
}
