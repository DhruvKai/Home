import { useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import {
  ArrowLeft, ChartLine, Cube, MagnifyingGlass, Package, Receipt, SignOut, Storefront, Users, Warning, WarningCircle,
} from '@phosphor-icons/react';
import { img } from '../../lib/asset';
import { cx, fmtDate, money } from '../../lib/format';
import { Empty } from '../_shared/bits';
import { Bars, ChartCard, TrendChart, inrShort } from '../_shared/charts';
import { toast } from '../_shared/toast';
import { CATEGORIES, ORDER_STATUSES, PRODUCTS, STORE, totalStock, useShop, variantsOf } from './data';

const BASE = '/demos/ecommerce/admin';
const STATUS_TONE = { Paid: 'bg-accent-soft text-accent-ink', Packed: 'bg-sunken text-fg', Shipped: 'bg-sunken text-fg', Delivered: 'bg-fg text-bg', Cancelled: 'text-muted line-through' };

function SignIn() {
  const signIn = useShop((s) => s.signIn);
  return (
    <div className="grid min-h-[70dvh] place-items-center px-4 py-12">
      <form onSubmit={(e) => { e.preventDefault(); signIn(); }} className="card w-full max-w-sm p-6 sm:p-8">
        <p className="font-display text-xl font-semibold">North &amp; Co. admin</p>
        <p className="mt-1 text-sm text-muted">Demo credentials are filled in for you.</p>
        <div className="mt-6 grid gap-4">
          <div className="field"><label htmlFor="sa-email">Email</label><input id="sa-email" className="input" defaultValue="owner@northco.demo" readOnly /></div>
          <div className="field"><label htmlFor="sa-pass">Password</label><input id="sa-pass" className="input" type="password" defaultValue="demo-1234" readOnly /></div>
          <button className="btn btn-primary mt-2" autoFocus>Sign in</button>
        </div>
        <Link to="/demos/ecommerce" className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeft size={14} /> Back to the store</Link>
      </form>
    </div>
  );
}

function Overview() {
  const orders = useShop((s) => s.orders);
  const stock = useShop((s) => s.stock);
  const live = orders.filter((o) => o.status !== 'Cancelled');
  const days = useMemo(() => {
    const out = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const end = d.getTime() + 86400000;
      out.push({ day: d.getTime(), revenue: live.filter((o) => o.placedAt >= d.getTime() && o.placedAt < end).reduce((n, o) => n + o.total, 0) });
    }
    return out;
  }, [live]);
  const byCat = CATEGORIES.map(([k, l]) => ({ cat: l, sales: live.flatMap((o) => o.items).filter((it) => PRODUCTS.find((p) => p.id === it.productId)?.cat === k).reduce((n, it) => n + it.price * it.qty, 0) }))
    .sort((a, b) => b.sales - a.sales);
  const revenue = live.reduce((n, o) => n + o.total, 0);
  const lowStock = PRODUCTS.flatMap((p) => variantsOf(p).filter((k) => (stock[p.id][k] ?? 0) <= STORE.lowStock).map((k) => ({ p, k, n: stock[p.id][k] })));
  const toShip = orders.filter((o) => o.status === 'Paid' || o.status === 'Packed').length;
  const kpis = [
    ['Revenue, 30 days', money(revenue)],
    ['Orders', live.length],
    ['Average order', money(revenue / Math.max(1, live.length))],
    ['To ship', toShip],
  ];
  const short = (t) => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(([l, v]) => (
          <div key={l} className="card p-4"><p className="text-sm text-muted">{l}</p><p className="mt-2 font-display text-2xl font-semibold tabular-nums">{v}</p></div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <ChartCard title="Daily revenue" sub="Last 30 days, excluding cancelled orders" columns={['Day', 'Revenue']} rows={days.map((d) => [short(d.day), money(d.revenue)])}>
          <TrendChart data={days} x="day" y="revenue" format={(v, s) => (s ? inrShort(v) : money(v))} labelFormat={short} />
        </ChartCard>
        <ChartCard title="Sales by category" sub="Last 30 days" columns={['Category', 'Sales']} rows={byCat.map((c) => [c.cat, money(c.sales)])}>
          <Bars data={byCat} x="cat" y="sales" horizontal format={(v, s) => (s ? inrShort(v) : money(v))} />
        </ChartCard>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4"><h2 className="font-semibold">Latest orders</h2><Link to={`${BASE}/orders`} className="text-sm font-semibold text-accent-ink hover:underline">All orders</Link></div>
          <ul className="divide-y divide-line">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span><span className="font-mono font-semibold">{o.number}</span> <span className="text-muted">{o.customer.name}</span>{o.mine && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-on-accent">From you</span>}</span>
                <span className="tabular-nums">{money(o.total)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4"><h2 className="font-semibold">Low stock</h2><Link to={`${BASE}/inventory`} className="text-sm font-semibold text-accent-ink hover:underline">Inventory</Link></div>
          {lowStock.length ? (
            <ul className="divide-y divide-line">
              {lowStock.slice(0, 6).map(({ p, k, n }) => (
                <li key={p.id + k} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span>{p.name} <span className="text-muted">{k.replace('|-', '').replace('|', ', ')}</span></span>
                  <span className={cx('flex items-center gap-1 font-semibold', n === 0 ? 'text-bad' : 'text-warn')}>{n === 0 ? <WarningCircle size={16} /> : <Warning size={16} />}{n === 0 ? 'Sold out' : `${n} left`}</span>
                </li>
              ))}
            </ul>
          ) : <Empty title="All variants are well stocked" />}
        </section>
      </div>
    </>
  );
}

function Orders() {
  const orders = useShop((s) => s.orders);
  const setStatus = useShop((s) => s.setOrderStatus);
  const [q, setQ] = useState('');
  const [status, setFilter] = useState('All');
  const list = orders.filter((o) => (status === 'All' || o.status === status) && (o.number + o.customer.name).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Orders</h1>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input w-60 py-2 pl-9 text-sm" placeholder="Order number or customer" aria-label="Search orders" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {['All', ...ORDER_STATUSES].map((s) => <button key={s} onClick={() => setFilter(s)} className={cx('chip py-1.5', status === s && 'chip-on')}>{s}</button>)}
      </div>
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-muted"><tr>{['Order', 'Date', 'Customer', 'Items', 'Total', 'Status'].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id} className={cx('border-t border-line', o.mine && 'bg-accent-soft/50')}>
                <td className="px-4 py-3 font-mono font-semibold">{o.number}</td>
                <td className="px-4 py-3 text-muted">{fmtDate(o.placedAt)}</td>
                <td className="px-4 py-3">{o.customer.name}<span className="block text-xs text-muted">{o.customer.city}</span></td>
                <td className="px-4 py-3">{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                <td className="px-4 py-3 tabular-nums">{money(o.total)}</td>
                <td className="px-4 py-3">
                  <label className="sr-only" htmlFor={`os-${o.id}`}>Status of {o.number}</label>
                  <select id={`os-${o.id}`} value={o.status} onChange={(e) => { setStatus(o.id, e.target.value); toast(`${o.number} marked ${e.target.value.toLowerCase()}`); }}
                    className={cx('rounded-full border-0 px-2.5 py-1 text-xs font-semibold', STATUS_TONE[o.status])}>
                    {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <Empty icon={Receipt} title="No orders match" />}
      </div>
    </>
  );
}

function Products() {
  const stock = useShop((s) => s.stock);
  const orders = useShop((s) => s.orders);
  const sold = (id) => orders.filter((o) => o.status !== 'Cancelled').flatMap((o) => o.items).filter((i) => i.productId === id).reduce((n, i) => n + i.qty, 0);
  return (
    <>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Products</h1>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="text-left text-muted"><tr>{['Product', 'Category', 'Price', 'Variants', 'In stock', 'Sold, 30 days'].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {PRODUCTS.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-4 py-2.5"><span className="flex items-center gap-3"><img src={img('store', p.photo)} alt="" className="size-10 rounded-lg object-cover" /><Link to={`/demos/ecommerce/p/${p.id}`} className="font-medium hover:underline">{p.name}</Link></span></td>
                <td className="px-4 py-2.5 text-muted">{CATEGORIES.find(([k]) => k === p.cat)[1]}</td>
                <td className="px-4 py-2.5 tabular-nums">{money(p.price)}</td>
                <td className="px-4 py-2.5">{variantsOf(p).length}</td>
                <td className="px-4 py-2.5 tabular-nums">{totalStock(p, stock)}</td>
                <td className="px-4 py-2.5 tabular-nums">{sold(p.id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Inventory() {
  const stock = useShop((s) => s.stock);
  const setStock = useShop((s) => s.setStock);
  const [lowOnly, setLowOnly] = useState(false);
  const rows = PRODUCTS.flatMap((p) => variantsOf(p).map((k) => ({ p, k, n: stock[p.id][k] ?? 0 }))).filter((r) => !lowOnly || r.n <= STORE.lowStock);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Inventory</h1>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} className="size-4 accent-[var(--accent)]" /> Low stock only ({STORE.lowStock} or fewer)</label>
      </div>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="text-left text-muted"><tr>{['Product', 'Variant', 'Stock', ''].map((h, i) => <th key={i} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map(({ p, k, n }) => (
              <tr key={p.id + k} className="border-t border-line">
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2 text-muted">{k.replace('|-', '').replace('|', ', ')}</td>
                <td className="px-4 py-2">
                  <label className="sr-only" htmlFor={`stk-${p.id}-${k}`}>Stock for {p.name} {k}</label>
                  <input id={`stk-${p.id}-${k}`} type="number" min="0" className="input w-24 py-1.5 text-sm tabular-nums" value={n} onChange={(e) => setStock(p.id, k, Number(e.target.value))} />
                </td>
                <td className="px-4 py-2">
                  {n === 0 ? <span className="flex items-center gap-1 font-semibold text-bad"><WarningCircle size={16} /> Sold out</span>
                    : n <= STORE.lowStock ? <span className="flex items-center gap-1 font-semibold text-warn"><Warning size={16} /> Low</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty icon={Cube} title="No low-stock variants" />}
      </div>
    </>
  );
}

function Customers() {
  const customers = useShop((s) => s.customers);
  const orders = useShop((s) => s.orders);
  const mine = orders.filter((o) => o.mine);
  const list = [
    ...(mine.length ? [{ id: 'you', name: mine[0].customer.name, city: mine[0].customer.city, email: mine[0].customer.email, joined: mine[mine.length - 1].placedAt }] : []),
    ...customers,
  ].map((c) => {
    const os = orders.filter((o) => o.customerId === c.id && o.status !== 'Cancelled');
    return { ...c, count: os.length, spent: os.reduce((n, o) => n + o.total, 0), last: os[0]?.placedAt };
  }).sort((a, b) => b.spent - a.spent);
  return (
    <>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Customers</h1>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-muted"><tr>{['Customer', 'City', 'Orders', 'Spent', 'Last order'].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-4 py-2.5"><span className="font-medium">{c.name}</span><span className="block text-xs text-muted">{c.email}</span></td>
                <td className="px-4 py-2.5 text-muted">{c.city}</td>
                <td className="px-4 py-2.5 tabular-nums">{c.count}</td>
                <td className="px-4 py-2.5 tabular-nums">{money(c.spent)}</td>
                <td className="px-4 py-2.5 text-muted">{c.last ? fmtDate(c.last) : 'None'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const NAV = [['', 'Overview', ChartLine], ['orders', 'Orders', Receipt], ['products', 'Products', Package], ['inventory', 'Inventory', Cube], ['customers', 'Customers', Users]];

export default function StoreAdmin() {
  const signedIn = useShop((s) => s.adminSignedIn);
  const signOut = useShop((s) => s.signOut);
  const toShip = useShop((s) => s.orders.filter((o) => o.status === 'Paid').length);
  if (!signedIn) return <SignIn />;
  return (
    <div className="mx-auto grid max-w-[90rem] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-[calc(var(--bar-h,0px)+1.5rem)] lg:h-fit">
        <p className="hidden px-3 font-display text-lg font-semibold lg:block">North &amp; Co.</p>
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 no-scrollbar lg:mx-0 lg:mt-4 lg:grid lg:px-0">
          {NAV.map(([to, l, I]) => (
            <NavLink key={l} end to={to ? `${BASE}/${to}` : BASE}
              className={({ isActive }) => cx('flex shrink-0 items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm font-medium', isActive ? 'bg-fg text-bg' : 'text-muted hover:bg-sunken hover:text-fg')}>
              <I size={18} />{l}{l === 'Orders' && toShip > 0 && <span className="ml-auto rounded-full bg-accent px-1.5 text-[11px] font-bold text-on-accent">{toShip}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 hidden gap-1 border-t border-line pt-4 lg:grid">
          <Link to="/demos/ecommerce" className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm text-muted hover:bg-sunken hover:text-fg"><Storefront size={18} /> View store</Link>
          <button onClick={signOut} className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-sm text-muted hover:bg-sunken hover:text-fg"><SignOut size={18} /> Sign out</button>
        </div>
      </aside>
      <main className="min-w-0">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customers" element={<Customers />} />
        </Routes>
      </main>
    </div>
  );
}
