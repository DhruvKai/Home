import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CalendarCheck, CheckCircle, Circle, Invoice, Package, UserPlus } from '@phosphor-icons/react';
import { cx, fmtDate, fmtTime, isoDay, money } from '../../lib/format';
import { ChartCard, TrendChart, inrShort } from '../_shared/charts';
import { Empty } from '../_shared/bits';
import { invoiceTotals, useOps } from './data';

export const OPS = '/demos/business-dashboard';
export const INV_TONE = { Draft: 'bg-sunken text-muted', Sent: 'bg-accent-soft text-accent-ink', Paid: 'bg-fg text-bg', Overdue: 'border border-bad text-bad' };
export const KIND_ICON = { invoice: Invoice, task: CalendarCheck, stock: Package, customer: UserPlus };

export function StatusPill({ s }) {
  return <span className={cx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', INV_TONE[s])}>{s}</span>;
}

export function ago(t) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}

// Complete months only (the current month is shown in the KPI above), so the line never ends on a partial month.
export function monthlyRevenue(invoices, months, skipCurrent = true) {
  const out = [];
  const now = new Date();
  const end = skipCurrent ? 1 : 0;
  for (let i = months - 1 + end; i >= end; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push({ month: d.getTime(), key, revenue: invoices.filter((x) => x.status === 'Paid' && x.issued.startsWith(key)).reduce((n, x) => n + invoiceTotals(x).total, 0) });
  }
  return out;
}

export default function Dashboard() {
  const { invoices, tasks, customers, notifications, setTaskStatus, team } = useOps();
  const month = isoDay(0).slice(0, 7);
  const paidThisMonth = invoices.filter((i) => i.status === 'Paid' && i.issued.startsWith(month)).reduce((n, i) => n + invoiceTotals(i).total, 0);
  const outstanding = invoices.filter((i) => i.status === 'Sent' || i.status === 'Overdue');
  const overdue = invoices.filter((i) => i.status === 'Overdue').length;
  const today = tasks.filter((t) => t.date === isoDay(0)).sort((a, b) => a.time.localeCompare(b.time));
  const newCustomers = customers.filter((c) => c.since >= isoDay(-30)).length;
  const series = useMemo(() => monthlyRevenue(invoices, 6), [invoices]);
  const name = (id) => customers.find((c) => c.id === id)?.name ?? 'Unknown';
  const person = (id) => team.find((m) => m.id === id)?.name.split(' ')[0];
  const mlabel = (t) => new Date(t).toLocaleDateString('en-IN', { month: 'short' });

  const kpis = [
    ['Paid this month', money(paidThisMonth), ((n) => `${n} invoice${n === 1 ? '' : 's'}`)(invoices.filter((i) => i.status === 'Paid' && i.issued.startsWith(month)).length)],
    ['Outstanding', money(outstanding.reduce((n, i) => n + invoiceTotals(i).total, 0)), `${overdue} overdue`],
    ['Jobs today', today.length, `${today.filter((t) => t.status === 'done').length} done`],
    ['New customers', newCustomers, 'Last 30 days'],
  ];

  return (
    <>
      <h1 className="text-2xl font-semibold">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, Maya</h1>
      <p className="mt-1 text-sm text-muted">{fmtDate(isoDay(0), { weekday: 'long', day: 'numeric', month: 'long' })}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map(([l, v, sub]) => (
          <div key={l} className="card p-4">
            <p className="text-sm text-muted">{l}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{v}</p>
            <p className="mt-0.5 text-xs text-muted">{sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard title="Revenue collected" sub="Paid invoices, last 6 full months, incl. GST" columns={['Month', 'Revenue']} rows={series.map((s) => [mlabel(s.month), money(s.revenue)])}>
          <TrendChart data={series} x="month" y="revenue" labelFormat={mlabel} format={(v, s) => (s ? inrShort(v) : money(v))} />
        </ChartCard>
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-semibold">Today's jobs</h2>
            <Link to={`${OPS}/tasks`} className="text-sm font-semibold text-accent-ink hover:underline">Schedule</Link>
          </div>
          {today.length ? (
            <ul className="divide-y divide-line">
              {today.map((t) => (
                <li key={t.id} className="flex items-start gap-3 px-5 py-3">
                  <button onClick={() => setTaskStatus(t.id, t.status === 'done' ? 'todo' : 'done')} aria-label={t.status === 'done' ? `Mark "${t.title}" not done` : `Mark "${t.title}" done`} className="mt-0.5 text-accent">
                    {t.status === 'done' ? <CheckCircle size={20} weight="fill" /> : <Circle size={20} className="text-muted" />}
                  </button>
                  <div className="min-w-0 text-sm">
                    <p className={cx('font-medium', t.status === 'done' && 'text-muted line-through')}>{t.title}</p>
                    <p className="text-muted">{fmtTime(t.time)}, {name(t.customerId)}, {person(t.assignee)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : <Empty icon={CalendarCheck} title="No jobs today" />}
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-semibold">Recent invoices</h2>
            <Link to={`${OPS}/invoices`} className="text-sm font-semibold text-accent-ink hover:underline">All invoices</Link>
          </div>
          <ul className="divide-y divide-line" data-testid="recent-invoices">
            {invoices.slice(0, 5).map((i) => (
              <li key={i.id}>
                <Link to={`${OPS}/invoices/${i.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-sunken">
                  <span className="min-w-0"><span className="font-mono font-medium">{i.number}</span> <span className="text-muted">{name(i.customerId)}</span></span>
                  <span className="flex shrink-0 items-center gap-3"><span className="tabular-nums">{money(invoiceTotals(i).total)}</span><StatusPill s={i.status} /></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-semibold">Activity</h2>
            <Link to={`${OPS}/notifications`} className="text-sm font-semibold text-accent-ink hover:underline">Notifications</Link>
          </div>
          <ul className="divide-y divide-line">
            {notifications.slice(0, 5).map((n) => {
              const I = KIND_ICON[n.kind] ?? Bell;
              return (
                <li key={n.id} className="flex items-start gap-3 px-5 py-3 text-sm">
                  <I size={18} className="mt-0.5 shrink-0 text-muted" />
                  <span className="flex-1">{n.text}</span>
                  <span className="shrink-0 text-xs text-muted">{ago(n.at)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
