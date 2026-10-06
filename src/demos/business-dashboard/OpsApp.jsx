import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import { useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  Anchor, Bell, CalendarCheck, ChartLineUp, Gear, House, Invoice, Package, Plus, UsersThree,
} from '@phosphor-icons/react';
import { cx } from '../../lib/format';
import DemoShell from '../_shared/DemoShell';
import { toast } from '../_shared/toast';
import StartProjectCTA from '../_shared/StartProjectCTA';
import { useOps } from './data';
import Dashboard from './Dashboard';
import Customers from './Customers';
import Tasks from './Tasks';
import { InvoiceList, InvoiceNew, InvoiceView } from './Invoices';
import { Analytics, Notifications, Products, Settings } from './More';

export const OPS = '/demos/business-dashboard';

const NAV = [
  ['', 'Dashboard', House], ['customers', 'Customers', UsersThree], ['tasks', 'Schedule', CalendarCheck], ['invoices', 'Invoices', Invoice],
  ['products', 'Products', Package], ['analytics', 'Analytics', ChartLineUp], ['notifications', 'Notifications', Bell], ['settings', 'Settings', Gear],
];

function Shell({ children }) {
  const unread = useOps((s) => s.notifications.filter((n) => !n.read).length);
  const owner = useOps((s) => s.team[0]);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [q, setQ] = useState('');
  const link = (to, l, I, compact) => (
    <NavLink key={l} end={!to} to={to ? `${OPS}/${to}` : OPS}
      className={({ isActive }) => cx('flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium', isActive ? 'bg-accent-soft text-accent-ink' : 'text-muted hover:bg-sunken hover:text-fg')}>
      <I size={18} />{!compact && l}{compact && <span>{l}</span>}
      {l === 'Notifications' && unread > 0 && <span className="ml-auto rounded-full bg-accent px-1.5 text-[11px] font-semibold text-on-accent">{unread}</span>}
    </NavLink>
  );
  return (
    <div className="lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="hidden border-r border-line bg-surface lg:block print:hidden">
        <div className="sticky flex h-[calc(100dvh-var(--bar-h,0px))] flex-col p-4" style={{ top: 'var(--bar-h, 0px)' }}>
          <Link to={OPS} className="flex items-center gap-2 px-2 py-1 text-lg font-semibold"><span className="grid size-8 place-items-center rounded-lg bg-accent text-on-accent"><Anchor size={18} weight="bold" /></span>Harbor Ops</Link>
          <nav className="mt-6 grid gap-0.5">{NAV.map(([to, l, I]) => link(to, l, I))}</nav>
          <div className="mt-auto flex items-center gap-3 rounded-lg border border-line p-3">
            <span className="grid size-9 place-items-center rounded-full bg-sunken text-sm font-semibold">{owner.name.split(' ').map((w) => w[0]).join('')}</span>
            <span className="min-w-0 text-sm"><span className="block truncate font-medium">{owner.name}</span><span className="text-muted">{owner.role}</span></span>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <div data-no-print className="sticky z-20 border-b border-line bg-bg/92 backdrop-blur-md" style={{ top: 'var(--bar-h, 0px)' }}>
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <Link to={OPS} className="flex items-center gap-2 font-semibold lg:hidden"><span className="grid size-7 place-items-center rounded-lg bg-accent text-on-accent"><Anchor size={16} weight="bold" /></span><span className="hidden sm:inline">Harbor Ops</span></Link>
            <form className="flex-1" onSubmit={(e) => { e.preventDefault(); navigate(`${OPS}/customers?q=${encodeURIComponent(q)}`); }}>
              <input className="input max-w-sm py-1.5 text-sm" placeholder="Search customers" aria-label="Search customers" value={q} onChange={(e) => setQ(e.target.value)} />
            </form>
            {!pathname.endsWith('/invoices/new') && <Link to={`${OPS}/invoices/new`} className="btn btn-primary btn-sm"><Plus size={16} weight="bold" /><span className="hidden sm:inline">New invoice</span></Link>}
            <Link to={`${OPS}/notifications`} className="relative grid size-9 place-items-center rounded-full hover:bg-sunken" aria-label={`Notifications, ${unread} unread`}>
              <Bell size={20} />{unread > 0 && <span className="absolute right-1 top-1 size-2.5 rounded-full border-2 border-bg bg-accent" />}
            </Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2 no-scrollbar lg:hidden">{NAV.map(([to, l, I]) => link(to, l, I, true))}</nav>
        </div>
        <main className="px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        <StartProjectCTA projectRef="business-app" title="Need software built around your workflow?"
          text="Customer records, scheduling, invoices and reports in one app, shaped around how your team actually works." />
      </div>
    </div>
  );
}

export default function OpsApp() {
  const reset = useOps((s) => s.reset);
  return (
    <DemoShell theme="ops" projectRef="business-app" name="Harbor Ops" title="Harbor Ops" onReset={() => { reset(); toast('Demo data reset'); }}>
      <Shell>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/new" element={<InvoiceNew />} />
          <Route path="invoices/:id" element={<InvoiceView />} />
          <Route path="products" element={<Products />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </Shell>
    </DemoShell>
  );
}
