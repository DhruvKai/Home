import { useState } from 'react';
import { CalendarBlank, CaretLeft, CaretRight, Kanban, Plus } from '@phosphor-icons/react';
import { cx, fmtDate, fmtTime, isoDay, toDate } from '../../lib/format';
import Modal from '../_shared/Modal';
import { toast } from '../_shared/toast';
import { TASK_STATUSES, useOps } from './data';

const PRIORITY = { High: 'text-bad', Normal: 'text-muted', Low: 'text-muted' };

function TaskCard({ t, compact }) {
  const { customers, team } = useOps();
  return (
    <div className="rounded-[10px] border border-line bg-surface p-3 text-sm">
      <p className="font-medium">{t.title}</p>
      <p className="mt-0.5 text-muted">{customers.find((c) => c.id === t.customerId)?.name}</p>
      {!compact && (
        <p className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-muted">{fmtDate(t.date, { weekday: 'short', day: 'numeric', month: 'short' })}, {fmtTime(t.time)}</span>
          <span className={cx('font-semibold', PRIORITY[t.priority])}>{t.priority}</span>
        </p>
      )}
      {!compact && <p className="mt-1 text-xs text-muted">{team.find((m) => m.id === t.assignee)?.name}</p>}
    </div>
  );
}

function Board() {
  const { tasks, setTaskStatus } = useOps();
  const [drag, setDrag] = useState(null);
  const recent = tasks.filter((t) => t.date >= isoDay(-3)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      {TASK_STATUSES.map(([k, l]) => {
        const col = recent.filter((t) => t.status === k);
        return (
          <section key={k} className="rounded-2xl bg-sunken p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (drag) { setTaskStatus(drag, k); setDrag(null); } }}>
            <h2 className="flex items-center justify-between px-1 pb-3 text-sm font-semibold">{l}<span className="text-muted">{col.length}</span></h2>
            <ul className="grid gap-2">
              {col.map((t) => (
                <li key={t.id} draggable onDragStart={() => setDrag(t.id)} className="cursor-grab active:cursor-grabbing">
                  <TaskCard t={t} />
                  <label className="sr-only" htmlFor={`ts-${t.id}`}>Move {t.title}</label>
                  <select id={`ts-${t.id}`} className="input mt-1 py-1 text-xs" value={t.status} onChange={(e) => setTaskStatus(t.id, e.target.value)}>
                    {TASK_STATUSES.map(([sk, sl]) => <option key={sk} value={sk}>{sl}</option>)}
                  </select>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function Calendar() {
  const tasks = useOps((s) => s.tasks);
  const [offset, setOffset] = useState(0);
  const start = toDate(isoDay(0));
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) + offset * 7);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2">
        <button className="grid size-9 place-items-center rounded-full border border-line hover:bg-sunken" onClick={() => setOffset(offset - 1)} aria-label="Previous week"><CaretLeft size={16} /></button>
        <button className="grid size-9 place-items-center rounded-full border border-line hover:bg-sunken" onClick={() => setOffset(offset + 1)} aria-label="Next week"><CaretRight size={16} /></button>
        <p className="ml-2 font-medium">{fmtDate(days[0], { day: 'numeric', month: 'short' })} to {fmtDate(days[6], { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        {offset !== 0 && <button className="btn btn-ghost btn-sm ml-auto" onClick={() => setOffset(0)}>This week</button>}
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-7">
        {days.map((d) => {
          const list = tasks.filter((t) => t.date === d).sort((a, b) => a.time.localeCompare(b.time));
          const isToday = d === isoDay(0);
          return (
            <div key={d} className={cx('min-h-36 rounded-2xl border p-2', isToday ? 'border-accent bg-accent-soft/40' : 'border-line bg-surface')}>
              <p className={cx('px-1 text-sm', isToday ? 'font-semibold text-accent-ink' : 'text-muted')}>{fmtDate(d, { weekday: 'short', day: 'numeric' })}</p>
              <ul className="mt-2 grid gap-1.5">
                {list.map((t) => (
                  <li key={t.id} className={cx('rounded-lg px-2 py-1.5 text-xs', t.status === 'done' ? 'bg-sunken text-muted line-through' : 'bg-accent-soft text-accent-ink')}>
                    <span className="font-semibold">{fmtTime(t.time)}</span> {t.title}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NewTask({ open, onClose }) {
  const { customers, team, addTask } = useOps();
  const [v, setV] = useState({ title: '', customerId: customers[0]?.id, assignee: team[1]?.id, date: isoDay(1), time: '10:00', priority: 'Normal', status: 'todo' });
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const [err, setErr] = useState('');
  return (
    <Modal open={open} onClose={onClose} title="New job" size="md"
      footer={<div className="flex justify-end gap-2"><button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" form="new-task">Add job</button></div>}>
      <form id="new-task" className="grid gap-4 p-5 sm:grid-cols-2" onSubmit={(e) => {
        e.preventDefault();
        if (v.title.trim().length < 3) return setErr('Describe the job.');
        addTask(v); toast('Job scheduled'); setErr(''); setV({ ...v, title: '' }); onClose();
      }}>
        <div className="field sm:col-span-2"><label htmlFor="nt-title">Job</label><input id="nt-title" className="input" value={v.title} onChange={set('title')} placeholder="For example: replace filters in the server room" /></div>
        <div className="field"><label htmlFor="nt-cust">Customer</label><select id="nt-cust" className="input" value={v.customerId} onChange={set('customerId')}>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="field"><label htmlFor="nt-who">Assigned to</label><select id="nt-who" className="input" value={v.assignee} onChange={set('assignee')}>{team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
        <div className="field"><label htmlFor="nt-date">Date</label><input id="nt-date" type="date" className="input" value={v.date} onChange={set('date')} /></div>
        <div className="field"><label htmlFor="nt-time">Time</label><input id="nt-time" type="time" className="input" value={v.time} onChange={set('time')} /></div>
        <div className="field"><label htmlFor="nt-pri">Priority</label><select id="nt-pri" className="input" value={v.priority} onChange={set('priority')}>{['Low', 'Normal', 'High'].map((p) => <option key={p}>{p}</option>)}</select></div>
        {err && <p className="error sm:col-span-2">{err}</p>}
      </form>
    </Modal>
  );
}

export default function Tasks() {
  const [view, setView] = useState('board');
  const [adding, setAdding] = useState(false);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Schedule</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-line p-0.5" role="tablist">
            {[['board', 'Board', Kanban], ['calendar', 'Calendar', CalendarBlank]].map(([k, l, I]) => (
              <button key={k} role="tab" aria-selected={view === k} onClick={() => setView(k)} className={cx('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium', view === k ? 'bg-fg text-bg' : 'text-muted')}><I size={16} />{l}</button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><Plus size={16} weight="bold" /> New job</button>
        </div>
      </div>
      {view === 'board' ? <Board /> : <Calendar />}
      <NewTask open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
