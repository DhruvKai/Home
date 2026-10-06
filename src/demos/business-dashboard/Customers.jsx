import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MagnifyingGlass, Plus, UsersThree } from '@phosphor-icons/react';
import { fmtDate, money } from '../../lib/format';
import Modal from '../_shared/Modal';
import { Empty } from '../_shared/bits';
import { toast } from '../_shared/toast';
import { OPS, StatusPill } from './Dashboard';
import { invoiceTotals, useOps } from './data';

function Drawer({ id, onClose }) {
  const { customers, invoices, tasks, updateCustomer } = useOps();
  const c = customers.find((x) => x.id === id);
  const [notes, setNotes] = useState('');
  useEffect(() => setNotes(c?.notes ?? ''), [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const inv = c ? invoices.filter((i) => i.customerId === c.id) : [];
  const jobs = c ? tasks.filter((t) => t.customerId === c.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4) : [];
  const billed = inv.filter((i) => i.status === 'Paid').reduce((n, i) => n + invoiceTotals(i).total, 0);
  return (
    <Modal open={!!c} onClose={onClose} variant="right" title={c?.name}
      footer={c && <Link to={`${OPS}/invoices/new?customer=${c.id}`} className="btn btn-primary w-full">New invoice for {c.name}</Link>}>
      {c && (
        <div className="grid gap-6 p-5">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted">Contact</dt><dd className="font-medium">{c.contact}</dd></div>
            <div><dt className="text-muted">Sector</dt><dd className="font-medium">{c.sector}</dd></div>
            <div className="col-span-2"><dt className="text-muted">Email</dt><dd className="font-medium">{c.email}</dd></div>
            <div><dt className="text-muted">City</dt><dd className="font-medium">{c.city}</dd></div>
            <div><dt className="text-muted">Plan</dt><dd className="font-medium">{c.plan}</dd></div>
            <div><dt className="text-muted">Customer since</dt><dd className="font-medium">{fmtDate(c.since, { month: 'short', year: 'numeric' })}</dd></div>
            <div><dt className="text-muted">Paid to date</dt><dd className="font-medium tabular-nums">{money(billed)}</dd></div>
          </dl>
          <div>
            <p className="label">Invoices</p>
            {inv.length ? (
              <ul className="mt-2 divide-y divide-line rounded-[10px] border border-line text-sm">
                {inv.slice(0, 5).map((i) => (
                  <li key={i.id}><Link to={`${OPS}/invoices/${i.id}`} className="flex items-center justify-between px-3 py-2 hover:bg-sunken"><span className="font-mono">{i.number}</span><span className="flex items-center gap-2 tabular-nums">{money(invoiceTotals(i).total)} <StatusPill s={i.status} /></span></Link></li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm text-muted">No invoices yet.</p>}
          </div>
          <div>
            <p className="label">Recent jobs</p>
            {jobs.length ? (
              <ul className="mt-2 grid gap-1 text-sm">{jobs.map((t) => <li key={t.id} className="flex justify-between"><span>{t.title}</span><span className="text-muted">{fmtDate(t.date)}</span></li>)}</ul>
            ) : <p className="mt-2 text-sm text-muted">No jobs yet.</p>}
          </div>
          <div className="field">
            <label htmlFor="cust-notes">Notes</label>
            <textarea id="cust-notes" className="input min-h-24" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Access codes, preferred times, who to call" />
            <button className="btn btn-ghost btn-sm justify-self-start" onClick={() => { updateCustomer(c.id, { notes }); toast('Notes saved'); }}>Save notes</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function AddCustomer({ open, onClose }) {
  const addCustomer = useOps((s) => s.addCustomer);
  const [v, setV] = useState({ name: '', contact: '', email: '', sector: 'Office', city: 'Riverton', plan: 'Pay per visit' });
  const [err, setErr] = useState('');
  function submit(e) {
    e.preventDefault();
    if (v.name.trim().length < 2 || v.contact.trim().length < 2) return setErr('Add a business name and a contact person.');
    addCustomer(v); toast(`${v.name} added`); onClose();
    setV({ ...v, name: '', contact: '', email: '' }); setErr('');
  }
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  return (
    <Modal open={open} onClose={onClose} title="Add customer" size="md"
      footer={<div className="flex justify-end gap-2"><button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" form="add-cust">Add customer</button></div>}>
      <form id="add-cust" onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2">
        <div className="field sm:col-span-2"><label htmlFor="ac-name">Business name</label><input id="ac-name" className="input" value={v.name} onChange={set('name')} /></div>
        <div className="field"><label htmlFor="ac-contact">Contact person</label><input id="ac-contact" className="input" value={v.contact} onChange={set('contact')} /></div>
        <div className="field"><label htmlFor="ac-email">Email</label><input id="ac-email" type="email" className="input" value={v.email} onChange={set('email')} /></div>
        <div className="field"><label htmlFor="ac-sector">Sector</label><select id="ac-sector" className="input" value={v.sector} onChange={set('sector')}>{['Office', 'Retail', 'Food and drink', 'Healthcare', 'Residential', 'Hospitality', 'Education', 'Warehouse', 'Fitness'].map((s) => <option key={s}>{s}</option>)}</select></div>
        <div className="field"><label htmlFor="ac-plan">Plan</label><select id="ac-plan" className="input" value={v.plan} onChange={set('plan')}>{['Pay per visit', 'Monthly plan'].map((s) => <option key={s}>{s}</option>)}</select></div>
        {err && <p className="error sm:col-span-2">{err}</p>}
      </form>
    </Modal>
  );
}

export default function Customers() {
  const { customers, invoices } = useOps();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [sector, setSector] = useState('All');
  const [open, setOpen] = useState(null);
  const [adding, setAdding] = useState(false);
  useEffect(() => setQ(params.get('q') ?? ''), [params]);
  const sectors = ['All', ...new Set(customers.map((c) => c.sector))];
  const list = customers.filter((c) => (sector === 'All' || c.sector === sector) && (c.name + c.contact + c.email).toLowerCase().includes(q.toLowerCase()));
  const spent = (id) => invoices.filter((i) => i.customerId === id && i.status === 'Paid').reduce((n, i) => n + invoiceTotals(i).total, 0);
  const owed = (id) => invoices.filter((i) => i.customerId === id && (i.status === 'Sent' || i.status === 'Overdue')).reduce((n, i) => n + invoiceTotals(i).total, 0);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Customers <span className="text-base font-normal text-muted">{customers.length}</span></h1>
        <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><Plus size={16} weight="bold" /> Add customer</button>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input w-64 py-2 pl-9 text-sm" placeholder="Name, contact or email" aria-label="Search customers" value={q} onChange={(e) => { setQ(e.target.value); setParams(e.target.value ? { q: e.target.value } : {}, { replace: true }); }} />
        </div>
        <select className="input w-auto py-2 text-sm" value={sector} onChange={(e) => setSector(e.target.value)} aria-label="Filter by sector">{sectors.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-muted"><tr>{['Customer', 'Contact', 'Sector', 'Plan', 'Paid', 'Owed'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="cursor-pointer border-t border-line hover:bg-sunken" onClick={() => setOpen(c.id)}>
                <td className="px-4 py-3"><button className="text-left font-medium hover:underline" onClick={(e) => { e.stopPropagation(); setOpen(c.id); }}>{c.name}</button><span className="block text-xs text-muted">{c.city}</span></td>
                <td className="px-4 py-3">{c.contact}<span className="block text-xs text-muted">{c.email}</span></td>
                <td className="px-4 py-3 text-muted">{c.sector}</td>
                <td className="px-4 py-3 text-muted">{c.plan}</td>
                <td className="px-4 py-3 tabular-nums">{money(spent(c.id))}</td>
                <td className="px-4 py-3 tabular-nums">{owed(c.id) ? <span className="font-medium text-warn">{money(owed(c.id))}</span> : <span className="text-muted">None</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <Empty icon={UsersThree} title="No customers match" text="Try another name or sector." />}
      </div>
      <Drawer id={open} onClose={() => setOpen(null)} />
      <AddCustomer open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
