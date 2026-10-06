import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, CalendarBlank, CalendarCheck, EnvelopeSimple, EnvelopeSimpleOpen, MagnifyingGlass, SignOut, Star, Tray, UserCheck,
  CheckCircle, XCircle, Clock, VideoCamera, SquaresFour,
} from '@phosphor-icons/react';
import { cx, fmtDate, fmtTime, isoDay } from '../../lib/format';
import { img } from '../../lib/asset';
import { Empty } from '../_shared/bits';
import Simulated from '../_shared/Simulated';
import { toast } from '../_shared/toast';
import { CLINIC, DOCTORS, STATUSES, deptById, doctorById, useClinic } from './data';

const STATUS_STYLE = {
  confirmed: 'bg-sunken text-fg',
  'checked-in': 'bg-accent-soft text-accent-ink',
  completed: 'bg-fg text-bg',
  'no-show': 'border border-dashed border-bad text-bad',
  cancelled: 'text-muted line-through',
};

function StatusPill({ s }) {
  return <span className={cx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', STATUS_STYLE[s])}>{s.replace('-', ' ')}</span>;
}

function SignIn() {
  const signIn = useClinic((s) => s.signIn);
  return (
    <div className="grid min-h-[calc(100dvh-var(--bar-h,0px)-6rem)] place-items-center px-4 py-12">
      <form onSubmit={(e) => { e.preventDefault(); signIn(); }} className="card w-full max-w-sm p-6 sm:p-8">
        <span className="grid size-11 place-items-center rounded-xl bg-accent text-on-accent"><Star size={20} weight="fill" /></span>
        <h1 className="mt-5 font-display text-2xl font-extrabold">Front desk sign in</h1>
        <p className="mt-1 text-sm text-muted">Demo credentials are filled in for you.</p>
        <div className="mt-6 grid gap-4">
          <div className="field"><label htmlFor="ad-email">Email</label><input id="ad-email" className="input" defaultValue={CLINIC.staff.email} readOnly /></div>
          <div className="field"><label htmlFor="ad-pass">Password</label><input id="ad-pass" className="input" type="password" defaultValue={CLINIC.staff.password} readOnly /></div>
          <button className="btn btn-primary mt-2" autoFocus>Sign in</button>
        </div>
        <Link to="/demos/clinic" className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeft size={14} /> Back to the clinic website</Link>
      </form>
    </div>
  );
}

function ApptRow({ a, showDate }) {
  const setStatus = useClinic((s) => s.setStatus);
  const d = doctorById(a.doctorId);
  const change = (status) => { setStatus(a.id, status); toast(`${a.patient.name}: ${status.replace('-', ' ')}`); };
  return (
    <li className="grid gap-3 px-4 py-4 sm:grid-cols-[80px_1fr_auto] sm:items-center sm:px-5">
      <div className="flex items-baseline gap-2 sm:block">
        <p className="font-mono text-sm font-semibold">{fmtTime(a.time)}</p>
        {showDate && <p className="text-xs text-muted">{fmtDate(a.date, { weekday: 'short', day: 'numeric', month: 'short' })}</p>}
      </div>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-semibold">
          {a.patient.name}
          {a.mode === 'video' && <VideoCamera size={16} className="text-muted" aria-label="Video call" />}
          {a.source === 'Website' && a.createdAt > Date.now() - 86400000 && <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-on-accent">New online</span>}
        </p>
        <p className="truncate text-sm text-muted">{d.name} · {a.patient.reason}</p>
        <p className="font-mono text-xs text-muted">{a.ref}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill s={a.status} />
        <label className="sr-only" htmlFor={`st-${a.id}`}>Change status for {a.patient.name}</label>
        <select id={`st-${a.id}`} className="input w-auto py-1.5 text-sm" value={a.status} onChange={(e) => change(e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
        </select>
      </div>
    </li>
  );
}

function Today() {
  const appointments = useClinic((s) => s.appointments);
  const list = appointments.filter((a) => a.date === isoDay(0)).sort((a, b) => a.time.localeCompare(b.time));
  const count = (s) => list.filter((a) => a.status === s).length;
  const kpis = [
    [CalendarCheck, 'Booked today', list.filter((a) => a.status !== 'cancelled').length],
    [UserCheck, 'Checked in', count('checked-in')],
    [CheckCircle, 'Completed', count('completed')],
    [XCircle, 'No-shows', count('no-show')],
  ];
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(([I, l, n]) => (
          <div key={l} className="card p-4">
            <I size={20} className="text-accent-ink" />
            <p className="mt-3 font-display text-3xl font-extrabold tabular-nums">{n}</p>
            <p className="text-sm text-muted">{l}</p>
          </div>
        ))}
      </div>
      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-bold">Today, {fmtDate(isoDay(0), { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
        </div>
        {list.length ? <ul className="divide-y divide-line">{list.map((a) => <ApptRow key={a.id} a={a} />)}</ul>
          : <Empty icon={CalendarBlank} title="No appointments today" text="Bookings made on the website appear here straight away." />}
      </div>
    </>
  );
}

function Upcoming() {
  const appointments = useClinic((s) => s.appointments);
  const [doc, setDoc] = useState('all');
  const [q, setQ] = useState('');
  const list = appointments
    .filter((a) => a.date > isoDay(0) && (doc === 'all' || a.doctorId === doc) && a.patient.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:px-5">
        <h2 className="font-display text-lg font-bold sm:mr-auto">Upcoming</h2>
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input py-2 pl-9 text-sm sm:w-56" placeholder="Search patient" aria-label="Search patient" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-auto py-2 text-sm" value={doc} onChange={(e) => setDoc(e.target.value)} aria-label="Filter by doctor">
          <option value="all">All doctors</option>
          {DOCTORS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      {list.length ? <ul className="divide-y divide-line">{list.map((a) => <ApptRow key={a.id} a={a} showDate />)}</ul>
        : <Empty icon={CalendarBlank} title="Nothing matches" text="Try another doctor or clear the search." />}
    </div>
  );
}

function Inbox() {
  const enquiries = useClinic((s) => s.enquiries);
  const markRead = useClinic((s) => s.markRead);
  const [sel, setSel] = useState(enquiries[0]?.id);
  const [reply, setReply] = useState(false);
  const cur = enquiries.find((e) => e.id === sel);
  return (
    <div className="card grid overflow-hidden md:grid-cols-[320px_1fr]">
      <ul className="max-h-[520px] divide-y divide-line overflow-y-auto border-b border-line md:border-b-0 md:border-r">
        {enquiries.map((e) => (
          <li key={e.id}>
            <button onClick={() => { setSel(e.id); markRead(e.id); }} className={cx('w-full px-4 py-3 text-left', sel === e.id ? 'bg-accent-soft' : 'hover:bg-sunken')}>
              <span className="flex items-center justify-between gap-2">
                <span className={cx('truncate', !e.read && 'font-bold')}>{e.name}</span>
                <span className="shrink-0 text-xs text-muted">{new Date(e.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</span>
              </span>
              <span className="mt-0.5 block truncate text-sm text-muted">{!e.read && <span className="mr-1.5 inline-block size-2 rounded-full bg-accent" aria-label="Unread" />}{e.topic}: {e.message}</span>
            </button>
          </li>
        ))}
      </ul>
      {cur ? (
        <div className="p-5 sm:p-6">
          <p className="text-sm text-muted">{cur.topic}</p>
          <h2 className="mt-1 font-display text-xl font-bold">{cur.name}</h2>
          <p className="mt-4 max-w-[60ch] leading-relaxed">{cur.message}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => setReply(true)}><EnvelopeSimple size={16} /> Reply</button>
            <button className="btn btn-ghost btn-sm" onClick={() => markRead(cur.id, false)}><EnvelopeSimpleOpen size={16} /> Mark unread</button>
          </div>
        </div>
      ) : <Empty icon={Tray} title="Inbox is empty" text="Messages sent from the website's contact form land here." />}
      <Simulated open={reply} onClose={() => setReply(false)} kind="info" title="Reply to enquiry">
        <p>In a real build, staff reply here and the patient gets the answer by email or SMS, with the thread saved against their record.</p>
      </Simulated>
    </div>
  );
}

function Schedule() {
  const appointments = useClinic((s) => s.appointments);
  const [date, setDate] = useState(isoDay(0));
  const days = Array.from({ length: 7 }, (_, i) => isoDay(i));
  const times = useMemo(() => [...new Set(DOCTORS.flatMap((d) => d.slots))].sort(), []);
  const day = new Date(date + 'T00:00').getDay();
  const booked = (docId, t) => appointments.find((a) => a.doctorId === docId && a.date === date && a.time === t && a.status !== 'cancelled');
  return (
    <div className="card overflow-hidden">
      <div className="flex gap-2 overflow-x-auto border-b border-line p-4 no-scrollbar">
        {days.map((d) => (
          <button key={d} onClick={() => setDate(d)} className={cx('chip px-3 py-1.5 text-sm', d === date && 'chip-on')}>
            {fmtDate(d, { weekday: 'short', day: 'numeric' })}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 bg-surface px-3 py-3 text-left font-semibold text-muted">Time</th>
              {DOCTORS.map((d) => (
                <th key={d.id} className="px-2 py-3 text-left font-semibold">
                  <span className="flex items-center gap-2"><img src={img('clinic', d.photo)} alt="" className="size-7 rounded-full object-cover object-top" />{d.name.replace('Dr. ', '')}</span>
                  <span className="block pl-9 text-xs font-normal text-muted">{deptById(d.dept).name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((t) => (
              <tr key={t} className="border-t border-line">
                <td className="sticky left-0 bg-surface px-3 py-1.5 font-mono text-xs text-muted">{fmtTime(t)}</td>
                {DOCTORS.map((d) => {
                  const works = d.days.includes(day) && d.slots.includes(t);
                  const a = works && booked(d.id, t);
                  return (
                    <td key={d.id} className="px-1.5 py-1">
                      {!works ? <span className="block h-8 rounded-md bg-sunken/60" />
                        : a ? <span className={cx('block truncate rounded-md px-2 py-1.5 text-xs font-semibold', a.status === 'checked-in' ? 'bg-accent text-on-accent' : 'bg-accent-soft text-accent-ink')} title={`${a.patient.name}, ${a.status}`}>{a.patient.name}</span>
                          : <span className="block h-8 rounded-md border border-dashed border-line" aria-label="Free" />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="flex flex-wrap gap-4 border-t border-line px-4 py-3 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-accent-soft" /> Booked</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-accent" /> Checked in</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded border border-dashed border-line" /> Free</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-sunken" /> Not in clinic</span>
      </p>
    </div>
  );
}

const TABS = [['today', 'Today', Clock], ['upcoming', 'Upcoming', CalendarBlank], ['inbox', 'Enquiries', Tray], ['schedule', 'Schedule', SquaresFour]];

export default function ClinicAdmin() {
  const signedIn = useClinic((s) => s.staffSignedIn);
  const signOut = useClinic((s) => s.signOut);
  const unread = useClinic((s) => s.enquiries.filter((e) => !e.read).length);
  const [tab, setTab] = useState('today');
  if (!signedIn) return <SignIn />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-accent text-on-accent"><Star size={18} weight="fill" /></span>
          <div><p className="font-display text-lg font-extrabold leading-tight">Northstar front desk</p><p className="text-sm text-muted">Signed in as reception</p></div>
        </div>
        <div className="flex gap-2">
          <Link to="/demos/clinic" className="btn btn-ghost btn-sm">View website</Link>
          <button className="btn btn-ghost btn-sm" onClick={signOut}><SignOut size={16} /> Sign out</button>
        </div>
      </div>
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-line no-scrollbar" role="tablist">
        {TABS.map(([k, l, I]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={cx('-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold', tab === k ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg')}>
            <I size={17} /> {l}
            {k === 'inbox' && unread > 0 && <span className="rounded-full bg-accent px-1.5 text-[11px] text-on-accent">{unread}</span>}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === 'today' && <Today />}
        {tab === 'upcoming' && <Upcoming />}
        {tab === 'inbox' && <Inbox />}
        {tab === 'schedule' && <Schedule />}
      </div>
    </div>
  );
}
