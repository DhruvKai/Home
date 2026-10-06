import { useMemo, useState } from 'react';
import { Bell, Checks, Desktop, Moon, Sun, UserPlus, Warning } from '@phosphor-icons/react';
import { cx, isoDay, money } from '../../lib/format';
import { getTheme, setTheme } from '../../lib/theme';
import Modal from '../_shared/Modal';
import { Bars, ChartCard, TrendChart, inrShort } from '../_shared/charts';
import { Empty } from '../_shared/bits';
import { toast } from '../_shared/toast';
import { KIND_ICON, ago } from './Dashboard';
import { invoiceTotals, useOps } from './data';

export function Products() {
  const { products, updateProduct } = useOps();
  const [type, setType] = useState('All');
  const list = products.filter((p) => type === 'All' || p.type === type);
  return (
    <>
      <h1 className="text-2xl font-semibold">Products and services</h1>
      <div className="mt-5 flex gap-2">{['All', 'Service', 'Plan', 'Part'].map((t) => <button key={t} onClick={() => setType(t)} className={cx('chip py-1.5', type === t && 'chip-on')}>{t}</button>)}</div>
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-muted"><tr>{['Name', 'SKU', 'Type', 'Price', 'Unit', 'Stock'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-4 py-2.5 font-medium">{p.name}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted">{p.sku}</td>
                <td className="px-4 py-2.5 text-muted">{p.type}</td>
                <td className="px-4 py-2.5">
                  <label className="sr-only" htmlFor={`pp-${p.id}`}>Price of {p.name}</label>
                  <input id={`pp-${p.id}`} type="number" min="0" className="input w-28 py-1.5 text-sm tabular-nums" value={p.price} onChange={(e) => updateProduct(p.id, { price: Number(e.target.value) })} />
                </td>
                <td className="px-4 py-2.5 text-muted">per {p.unit}</td>
                <td className="px-4 py-2.5">
                  {p.stock === undefined ? <span className="text-muted">Not tracked</span> : (
                    <span className="flex items-center gap-2">
                      <label className="sr-only" htmlFor={`ps-${p.id}`}>Stock of {p.name}</label>
                      <input id={`ps-${p.id}`} type="number" min="0" className="input w-20 py-1.5 text-sm tabular-nums" value={p.stock} onChange={(e) => updateProduct(p.id, { stock: Number(e.target.value) })} />
                      {p.stock <= 5 && <span className="flex items-center gap-1 text-xs font-semibold text-warn"><Warning size={14} /> Low</span>}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const RANGES = [['30', 'Last 30 days'], ['90', 'Last 90 days'], ['365', 'Last 12 months']];

export function Analytics() {
  const { invoices, tasks, customers } = useOps();
  const [range, setRange] = useState('90');
  const days = Number(range);
  const from = isoDay(-days);
  const paid = invoices.filter((i) => i.status === 'Paid' && i.issued >= from);

  const trend = useMemo(() => {
    // Weekly buckets up to 90 days, monthly for 12 months.
    const out = [];
    if (days > 90) {
      const now = new Date();
      for (let m = 11; m >= 0; m--) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        out.push({ t: d.getTime(), label: d.toLocaleDateString('en-IN', { month: 'short' }), revenue: paid.filter((i) => i.issued.startsWith(key)).reduce((n, i) => n + invoiceTotals(i).total, 0) });
      }
    } else {
      for (let w = Math.ceil(days / 7) - 1; w >= 0; w--) {
        const a = isoDay(-(w + 1) * 7 + 1), b = isoDay(-w * 7);
        out.push({ t: a, label: new Date(a + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), revenue: paid.filter((i) => i.issued >= a && i.issued <= b).reduce((n, i) => n + invoiceTotals(i).total, 0) });
      }
    }
    return out;
  }, [paid, days]);

  const byService = useMemo(() => {
    const m = {};
    paid.forEach((i) => i.lines.forEach((l) => { m[l.name] = (m[l.name] ?? 0) + l.qty * l.price; }));
    return Object.entries(m).map(([name, value]) => ({ name: name.length > 18 ? name.slice(0, 17) + '...' : name, full: name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [paid]);

  const topCustomers = customers.map((c) => ({ c, v: paid.filter((i) => i.customerId === c.id).reduce((n, i) => n + invoiceTotals(i).total, 0) })).filter((x) => x.v).sort((a, b) => b.v - a.v).slice(0, 5);
  const done = tasks.filter((t) => t.status === 'done' && t.date >= from).length;
  const revenue = paid.reduce((n, i) => n + invoiceTotals(i).total, 0);
  const label = RANGES.find(([k]) => k === range)[1];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="flex rounded-full border border-line p-0.5" role="tablist" aria-label="Date range">
          {RANGES.map(([k, l]) => <button key={k} role="tab" aria-selected={range === k} onClick={() => setRange(k)} className={cx('rounded-full px-3 py-1.5 text-sm font-medium', range === k ? 'bg-fg text-bg' : 'text-muted')}>{l}</button>)}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[['Revenue collected', money(revenue)], ['Paid invoices', paid.length], ['Average invoice', money(revenue / Math.max(1, paid.length))], ['Jobs completed', done]].map(([l, v]) => (
          <div key={l} className="card p-4"><p className="text-sm text-muted">{l}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{v}</p><p className="text-xs text-muted">{label}</p></div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <ChartCard title="Revenue collected" sub={days > 90 ? 'By month' : 'By week'} columns={['Period', 'Revenue']} rows={trend.map((d) => [d.label, money(d.revenue)])}>
          <TrendChart data={trend} x="label" y="revenue" format={(v, s) => (s ? inrShort(v) : money(v))} height={260} />
        </ChartCard>
        <ChartCard title="Top services" sub="Revenue by line item" columns={['Service', 'Revenue']} rows={byService.map((d) => [d.full, money(d.value)])}>
          {byService.length ? <Bars data={byService} x="name" y="value" horizontal height={260} format={(v, s) => (s ? inrShort(v) : money(v))} /> : <Empty title="No paid invoices in this range" />}
        </ChartCard>
      </div>
      <section className="card mt-4 overflow-hidden">
        <h2 className="border-b border-line px-5 py-4 font-semibold">Top customers, {label.toLowerCase()}</h2>
        {topCustomers.length ? (
          <ol className="divide-y divide-line">
            {topCustomers.map(({ c, v }, i) => (
              <li key={c.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                <span className="w-5 font-mono text-muted">{i + 1}</span>
                <span className="flex-1 font-medium">{c.name}<span className="ml-2 font-normal text-muted">{c.sector}</span></span>
                <span className="tabular-nums">{money(v)}</span>
              </li>
            ))}
          </ol>
        ) : <Empty title="No paid invoices in this range" />}
      </section>
    </>
  );
}

export function Notifications() {
  const { notifications, markAllRead, toggleRead } = useOps();
  const [filter, setFilter] = useState('all');
  const list = notifications.filter((n) => filter === 'all' || !n.read);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <div className="flex gap-2">
          {[['all', 'All'], ['unread', 'Unread']].map(([k, l]) => <button key={k} onClick={() => setFilter(k)} className={cx('chip py-1.5', filter === k && 'chip-on')}>{l}</button>)}
          <button className="btn btn-ghost btn-sm" onClick={() => { markAllRead(); toast('All caught up'); }}><Checks size={16} /> Mark all read</button>
        </div>
      </div>
      <div className="card mt-5 overflow-hidden">
        {list.length ? (
          <ul className="divide-y divide-line">
            {list.map((n) => {
              const I = KIND_ICON[n.kind] ?? Bell;
              return (
                <li key={n.id} className={cx('flex items-start gap-3 px-5 py-4', !n.read && 'bg-accent-soft/40')}>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sunken text-muted"><I size={18} /></span>
                  <div className="flex-1 text-sm"><p className={cx(!n.read && 'font-semibold')}>{n.text}</p><p className="mt-0.5 text-xs text-muted">{ago(n.at)}</p></div>
                  <button className="shrink-0 text-xs font-semibold text-accent-ink hover:underline" onClick={() => toggleRead(n.id)}>{n.read ? 'Mark unread' : 'Mark read'}</button>
                </li>
              );
            })}
          </ul>
        ) : <Empty icon={Bell} title="You're all caught up" text="New invoices, payments and jobs show up here." />}
      </div>
    </>
  );
}

function Toggle({ checked, onChange, label, help }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span><span className="block text-sm font-medium">{label}</span>{help && <span className="text-sm text-muted">{help}</span>}</span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-accent" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export function Settings() {
  const { settings, updateSettings, team, invite } = useOps();
  const [profile, setProfile] = useState({ company: settings.company, email: settings.email, taxRate: settings.taxRate, terms: settings.terms });
  const [theme, setT] = useState(getTheme);
  const [inviting, setInviting] = useState(false);
  const [m, setM] = useState({ name: '', email: '', role: 'Field technician' });
  const [err, setErr] = useState('');
  return (
    <>
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <form className="card p-5 sm:p-6" onSubmit={(e) => { e.preventDefault(); updateSettings(profile); toast('Business profile saved'); }}>
          <h2 className="font-semibold">Business profile</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="field sm:col-span-2"><label htmlFor="st-co">Company name</label><input id="st-co" className="input" value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} /></div>
            <div className="field sm:col-span-2"><label htmlFor="st-em">Billing email</label><input id="st-em" type="email" className="input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
            <div className="field"><label htmlFor="st-tax">Default GST %</label><input id="st-tax" type="number" className="input" value={profile.taxRate} onChange={(e) => setProfile({ ...profile, taxRate: Number(e.target.value) })} /></div>
            <div className="field"><label htmlFor="st-terms">Payment terms (days)</label><input id="st-terms" type="number" className="input" value={profile.terms} onChange={(e) => setProfile({ ...profile, terms: Number(e.target.value) })} /></div>
          </div>
          <button className="btn btn-primary btn-sm mt-5">Save profile</button>
        </form>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Team</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setInviting(true)}><UserPlus size={16} /> Invite</button>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {team.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="grid size-9 place-items-center rounded-full bg-sunken text-xs font-semibold">{p.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
                <span className="flex-1"><span className="block font-medium">{p.name}</span><span className="text-muted">{p.email}</span></span>
                <span className="text-muted">{p.role}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="font-semibold">Notifications</h2>
          <div className="mt-2 divide-y divide-line">
            <Toggle label="Email me when an invoice is paid" checked={settings.notifyEmail} onChange={(v) => updateSettings({ notifyEmail: v })} />
            <Toggle label="SMS reminders for today's jobs" help="Sent to technicians at 8 am" checked={settings.notifySms} onChange={(v) => updateSettings({ notifySms: v })} />
            <Toggle label="Weekly summary report" checked={settings.weeklyReport} onChange={(v) => updateSettings({ weeklyReport: v })} />
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="font-semibold">Appearance</h2>
          <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme">
            {[['system', 'System', Desktop], ['light', 'Light', Sun], ['dark', 'Dark', Moon]].map(([k, l, I]) => (
              <button key={k} role="radio" aria-checked={theme === k} onClick={() => { setTheme(k); setT(k); }}
                className={cx('flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium', theme === k ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line')}>
                <I size={22} />{l}
              </button>
            ))}
          </div>
          <p className="help mt-3">Applies across this site in this browser.</p>
        </section>
      </div>

      <Modal open={inviting} onClose={() => setInviting(false)} title="Invite a team member" size="sm"
        footer={<div className="flex justify-end gap-2"><button className="btn btn-ghost btn-sm" onClick={() => setInviting(false)}>Cancel</button><button className="btn btn-primary btn-sm" form="invite">Send invite</button></div>}>
        <form id="invite" className="grid gap-4 p-5" onSubmit={(e) => {
          e.preventDefault();
          if (m.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(m.email)) return setErr('Add a name and a valid email.');
          invite(m); toast(`Invite sent to ${m.email}`); setM({ name: '', email: '', role: 'Field technician' }); setErr(''); setInviting(false);
        }}>
          <div className="field"><label htmlFor="iv-name">Name</label><input id="iv-name" className="input" value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="iv-email">Email</label><input id="iv-email" type="email" className="input" value={m.email} onChange={(e) => setM({ ...m, email: e.target.value })} /></div>
          <div className="field"><label htmlFor="iv-role">Role</label><select id="iv-role" className="input" value={m.role} onChange={(e) => setM({ ...m, role: e.target.value })}>{['Field technician', 'Office manager', 'Accountant'].map((r) => <option key={r}>{r}</option>)}</select></div>
          {err && <p className="error">{err}</p>}
        </form>
      </Modal>
    </>
  );
}
