import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Link, NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, ArrowsCounterClockwise, Bag, Check, CheckCircle, FadersHorizontal, Leaf, List, Lock, Package, Truck, User, X,
} from '@phosphor-icons/react';
import { img } from '../../lib/asset';
import { cx, fmtDate, money } from '../../lib/format';
import { Empty, Qty, Stepper } from '../_shared/bits';
import Modal from '../_shared/Modal';
import Simulated from '../_shared/Simulated';
import StartProjectCTA from '../_shared/StartProjectCTA';
import { toast } from '../_shared/toast';
import { CATEGORIES, PRODUCTS, STORE, cartTotals, productById, totalStock, unitPrice, useShop, variantKey } from './data';

const BASE = '/demos/ecommerce';

export function StoreHeader() {
  const count = useShop((s) => s.cart.reduce((n, l) => n + l.qty, 0));
  const [open, setOpen] = useState(false);
  const links = [['Shop all', `${BASE}/c/all`], ...CATEGORIES.map(([k, l]) => [l, `${BASE}/c/${k}`])];
  return (
    <header className="sticky z-30 border-b border-line bg-bg/92 backdrop-blur-md" style={{ top: 'var(--bar-h, 0px)' }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button className="grid size-9 place-items-center rounded-full hover:bg-sunken md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X size={20} /> : <List size={20} />}</button>
          <Link to={BASE} className="font-display text-xl font-semibold tracking-tight">North &amp; Co.</Link>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([l, to]) => <NavLink key={to} to={to} className={({ isActive }) => cx('px-3 py-2 text-sm', isActive ? 'font-semibold text-fg' : 'text-muted hover:text-fg')}>{l}</NavLink>)}
        </nav>
        <div className="flex items-center gap-1">
          <Link to={`${BASE}/account`} className="grid size-10 place-items-center rounded-full hover:bg-sunken" aria-label="Account"><User size={20} /></Link>
          <Link to={`${BASE}/cart`} className="relative grid size-10 place-items-center rounded-full hover:bg-sunken" aria-label={`Cart, ${count} items`}>
            <Bag size={20} />
            {count > 0 && <span className="absolute right-0.5 top-0.5 grid size-[18px] place-items-center rounded-full bg-accent text-[10px] font-bold text-on-accent">{count}</span>}
          </Link>
        </div>
      </div>
      {open && (
        <nav className="grid gap-1 border-t border-line px-4 pb-4 pt-2 md:hidden">
          {links.map(([l, to]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5">{l}</Link>)}
        </nav>
      )}
    </header>
  );
}

export function StoreFooter() {
  return (
    <>
      <StartProjectCTA projectRef="ecommerce" title="Need something like this for your store?"
        text="A fast storefront with variants, checkout and an admin for orders and stock, built for how you sell." />
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-display font-semibold text-fg">North &amp; Co.</p>
          <div className="flex flex-wrap gap-5">
            <Link to={`${BASE}/c/all`} className="hover:text-fg">Shop</Link>
            <Link to={`${BASE}/account`} className="hover:text-fg">Orders</Link>
            <Link to={`${BASE}/admin`} className="font-semibold text-accent-ink hover:underline">Store admin</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

export function ProductCard({ p }) {
  const stock = useShop((s) => s.stock);
  const out = totalStock(p, stock) === 0;
  return (
    <Link to={`${BASE}/p/${p.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-sunken">
        <img src={img('store', p.photo)} alt={p.name} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{p.name}</p>
          <div className="mt-1.5 flex gap-1">{p.colours.map(([n, hex]) => <span key={n} className="size-3 rounded-full border border-line" style={{ background: hex }} title={n} />)}</div>
        </div>
        <p className="shrink-0 text-right">
          <span className="font-semibold">{money(p.price)}</span>
          {p.compareAt && <span className="block text-sm text-muted line-through">{money(p.compareAt)}</span>}
        </p>
      </div>
      {(p.badge || out) && <p className={cx('mt-1 text-xs font-semibold', out ? 'text-muted' : 'text-accent-ink')}>{out ? 'Sold out' : p.badge}</p>}
    </Link>
  );
}

export function StoreHome() {
  const best = PRODUCTS.filter((p) => p.badge === 'Bestseller' || p.compareAt).slice(0, 4);
  const fresh = [...PRODUCTS].sort((a, b) => a.added - b.added).slice(0, 4);
  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-8 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:pt-12">
        <div>
          <h1 className="max-w-[13ch] font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl">Well-made things for every day.</h1>
          <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-muted">Furniture, kitchenware and clothing, made to be used often and kept for years.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={`${BASE}/c/all`} className="btn btn-primary">Shop all <ArrowRight size={16} /></Link>
            <Link to={`${BASE}/c/living`} className="btn btn-ghost">Living</Link>
          </div>
        </div>
        <img src={img('store', 'hero')} alt="Folded knitwear, jeans and a beanie laid out on a bed" className="aspect-[4/3] w-full rounded-[24px] object-cover" />
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-5 text-sm sm:grid-cols-3 sm:px-6">
          {[[Truck, `Free shipping over ${money(STORE.freeShippingOver)}`], [ArrowsCounterClockwise, '30-day returns'], [Leaf, 'Natural and recycled materials']].map(([I, t]) => (
            <p key={t} className="flex items-center gap-2.5"><I size={20} className="text-accent" />{t}</p>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight">Shop by category</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CATEGORIES.map(([k, l, photo]) => (
            <Link key={k} to={`${BASE}/c/${k}`} className="group relative overflow-hidden rounded-2xl">
              <img src={img('store', photo)} alt="" loading="lazy" className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              <span className="absolute bottom-3 left-3 rounded-full bg-surface px-4 py-2 text-sm font-semibold">{l}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Bestsellers</h2>
          <Link to={`${BASE}/c/all`} className="text-sm font-semibold text-accent-ink hover:underline">View all</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">{best.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      <section className="bg-accent text-on-accent">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center">
          <img src={img('store', 'armchair')} alt="A yellow lounge chair in a bright living room" loading="lazy" className="aspect-[4/3] w-full rounded-[24px] object-cover" />
          <div>
            <h2 className="font-display text-4xl font-semibold leading-tight">The lounge chair, now in three colours.</h2>
            <p className="mt-4 max-w-[42ch] opacity-85">Solid oak, a sprung seat and a cover that comes off for washing.</p>
            <Link to={`${BASE}/p/lounge-chair`} className="btn mt-8 bg-surface text-fg hover:bg-bg">Shop the chair <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight">Just in</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">{fresh.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>
    </>
  );
}

const SORTS = [['featured', 'Featured'], ['new', 'Newest'], ['price-asc', 'Price, low to high'], ['price-desc', 'Price, high to low']];
const PRICE_BANDS = [['all', 'Any price'], ['0-2000', 'Under ₹2,000'], ['2000-10000', '₹2,000 to ₹10,000'], ['10000-', 'Over ₹10,000']];

function Filters({ f, setF, colours, sizes }) {
  const toggle = (k, v) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] });
  return (
    <div className="grid gap-8">
      <div>
        <p className="label">Category</p>
        <div className="mt-3 grid gap-1">
          {[['all', 'All products'], ...CATEGORIES].map(([k, l]) => (
            <Link key={k} to={`${BASE}/c/${k}`} className={cx('rounded-lg px-2 py-1.5 text-[15px]', f.cat === k ? 'bg-sunken font-semibold' : 'text-muted hover:text-fg')}>{l}</Link>
          ))}
        </div>
      </div>
      <fieldset>
        <legend className="label">Price</legend>
        <div className="mt-3 grid gap-2">
          {PRICE_BANDS.map(([k, l]) => (
            <label key={k} className="flex cursor-pointer items-center gap-2.5 text-[15px]"><input type="radio" name="price" checked={f.price === k} onChange={() => setF({ ...f, price: k })} className="accent-[var(--accent)]" />{l}</label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label">Colour</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {colours.map(([n, hex]) => (
            <button key={n} type="button" onClick={() => toggle('colours', n)} aria-pressed={f.colours.includes(n)} className={cx('chip py-1.5', f.colours.includes(n) && 'chip-on')}>
              <span className="size-3 rounded-full border border-line" style={{ background: hex }} />{n}
            </button>
          ))}
        </div>
      </fieldset>
      {sizes.length > 0 && (
        <fieldset>
          <legend className="label">Size</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((s) => <button key={s} type="button" onClick={() => toggle('sizes', s)} aria-pressed={f.sizes.includes(s)} className={cx('chip py-1.5', f.sizes.includes(s) && 'chip-on')}>{s}</button>)}
          </div>
        </fieldset>
      )}
      <label className="flex cursor-pointer items-center gap-2.5 text-[15px]">
        <input type="checkbox" checked={f.inStock} onChange={(e) => setF({ ...f, inStock: e.target.checked })} className="size-4 accent-[var(--accent)]" /> In stock only
      </label>
    </div>
  );
}

export function Listing() {
  const { cat = 'all' } = useParams();
  const stock = useShop((s) => s.stock);
  const [f, setF] = useState({ cat, price: 'all', colours: [], sizes: [], inStock: false, sort: 'featured' });
  const [drawer, setDrawer] = useState(false);
  useEffect(() => setF((s) => ({ ...s, cat, colours: [], sizes: [] })), [cat]);

  const inCat = PRODUCTS.filter((p) => cat === 'all' || p.cat === cat);
  const colours = [...new Map(inCat.flatMap((p) => p.colours).map((c) => [c[0], c])).values()];
  const sizes = [...new Set(inCat.flatMap((p) => p.sizes ?? []))];
  const list = useMemo(() => {
    const [lo, hi] = f.price === 'all' ? [0, Infinity] : f.price.split('-').map((x, i) => (x ? Number(x) : i ? Infinity : 0));
    const out = inCat.filter((p) => p.price >= lo && p.price < hi
      && (!f.colours.length || p.colours.some(([n]) => f.colours.includes(n)))
      && (!f.sizes.length || (p.sizes ?? []).some((s) => f.sizes.includes(s)))
      && (!f.inStock || totalStock(p, stock) > 0));
    const by = { new: (a, b) => a.added - b.added, 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price }[f.sort];
    return by ? [...out].sort(by) : out;
  }, [inCat, f, stock]);
  const title = cat === 'all' ? 'All products' : CATEGORIES.find(([k]) => k === cat)?.[1] ?? 'Products';
  const activeCount = f.colours.length + f.sizes.length + (f.price !== 'all') + f.inStock;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      <h1 className="font-display text-4xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-6 flex items-center justify-between gap-3 border-b border-line pb-4">
        <button className="btn btn-ghost btn-sm lg:hidden" onClick={() => setDrawer(true)}><FadersHorizontal size={16} /> Filters{activeCount > 0 && ` (${activeCount})`}</button>
        <p className="hidden text-sm text-muted lg:block">{list.length} products</p>
        <label className="flex items-center gap-2 text-sm"><span className="hidden text-muted sm:inline">Sort</span>
          <select className="input w-auto py-1.5 text-sm" value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value })}>
            {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block"><Filters f={f} setF={setF} colours={colours} sizes={sizes} /></aside>
        <div>
          {list.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          ) : (
            <Empty icon={Package} title="Nothing matches these filters" text="Try another colour or price range."
              action={<button className="btn btn-ghost btn-sm" onClick={() => setF({ ...f, price: 'all', colours: [], sizes: [], inStock: false })}>Clear filters</button>} />
          )}
        </div>
      </div>
      <Modal open={drawer} onClose={() => setDrawer(false)} variant="right" title="Filters"
        footer={<button className="btn btn-primary w-full" onClick={() => setDrawer(false)}>Show {list.length} products</button>}>
        <div className="p-5"><Filters f={f} setF={setF} colours={colours} sizes={sizes} /></div>
      </Modal>
    </div>
  );
}

export function ProductPage() {
  const { id } = useParams();
  const p = productById(id);
  const stock = useShop((s) => s.stock);
  const addToCart = useShop((s) => s.addToCart);
  const [colour, setColour] = useState(p?.colours[0][0]);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [shotIdx, setShotIdx] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => { setColour(p?.colours[0][0]); setSize(null); setQty(1); setShotIdx(0); setError(''); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) return <div className="mx-auto max-w-7xl px-4 py-24 text-center"><h1 className="font-display text-3xl font-semibold">Product not found</h1><Link to={`${BASE}/c/all`} className="btn btn-ghost mt-6">Shop all</Link></div>;

  const left = (c, s) => stock[p.id]?.[variantKey(c, s)] ?? 0;
  const available = p.sizes ? (size ? left(colour, size) : null) : left(colour, null);
  const price = unitPrice(p, size);
  // Three views of the product photo: full, detail crop and close crop.
  const shots = [['object-center', 'scale-100'], ['object-center', 'scale-[1.45]'], ['object-bottom', 'scale-[1.9]']];
  const related = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);

  function add() {
    if (p.sizes && !size) return setError('Choose a size.');
    if (!available) return setError('This option is sold out.');
    if (qty > available) return setError(`Only ${available} left in this option.`);
    addToCart({ key: p.id + variantKey(colour, size), productId: p.id, name: p.name, photo: p.photo, colour, size, qty, price });
    toast(`${p.name} added to your cart`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10">
      <Link to={`${BASE}/c/${p.cat}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeft size={14} /> {CATEGORIES.find(([k]) => k === p.cat)[1]}</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
          <div className="order-2 flex gap-2 sm:order-1 sm:flex-col">
            {shots.map(([pos, sc], i) => (
              <button key={i} onClick={() => setShotIdx(i)} className={cx('size-20 overflow-hidden rounded-xl border-2', shotIdx === i ? 'border-fg' : 'border-transparent')} aria-label={`View ${i + 1}`}>
                <img src={img('store', p.photo)} alt="" className={cx('size-full object-cover', pos, sc)} />
              </button>
            ))}
          </div>
          <div className="order-1 overflow-hidden rounded-[24px] bg-sunken sm:order-2">
            <img src={img('store', p.photo)} alt={p.name} className={cx('aspect-[4/5] w-full object-cover transition-transform duration-500', shots[shotIdx][0], shots[shotIdx][1])} />
          </div>
        </div>

        <div>
          {p.badge && <p className="text-sm font-semibold text-accent-ink">{p.badge}</p>}
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">{p.name}</h1>
          <p className="mt-3 text-2xl">{money(price)}{p.compareAt && <span className="ml-3 text-lg text-muted line-through">{money(p.compareAt)}</span>}</p>
          <p className="mt-5 max-w-[50ch] leading-relaxed text-muted">{p.desc}</p>

          <fieldset className="mt-8">
            <legend className="label">Colour: <span className="font-normal text-muted">{colour}</span></legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.colours.map(([n, hex]) => {
                const soldOut = (p.sizes ?? [null]).every((s) => left(n, s) === 0);
                return (
                  <button key={n} onClick={() => { setColour(n); setError(''); }} aria-pressed={colour === n} aria-label={`${n}${soldOut ? ', sold out' : ''}`} title={n}
                    className={cx('relative grid size-11 place-items-center rounded-full border-2', colour === n ? 'border-fg' : 'border-transparent')}>
                    <span className={cx('size-8 rounded-full border border-line', soldOut && 'opacity-40')} style={{ background: hex }} />
                  </button>
                );
              })}
            </div>
          </fieldset>

          {p.sizes && (
            <fieldset className="mt-6">
              <legend className="label">Size</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.sizes.map((s) => {
                  const n = left(colour, s);
                  return (
                    <button key={s} onClick={() => { setSize(s); setError(''); }} aria-pressed={size === s} disabled={n === 0}
                      className={cx('min-w-14 rounded-[10px] border px-3 py-2.5 text-sm font-semibold', size === s ? 'border-fg bg-fg text-bg' : 'border-line hover:border-fg/50', n === 0 && 'line-through opacity-40')}>{s}</button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <p className="mt-6 text-sm" aria-live="polite">
            {available === null ? <span className="text-muted">Choose a size to see stock.</span>
              : available === 0 ? <span className="font-semibold text-bad">Sold out in this option</span>
                : available <= STORE.lowStock ? <span className="font-semibold text-warn">Only {available} left</span>
                  : <span className="flex items-center gap-1.5 font-semibold text-ok"><Check size={16} weight="bold" /> In stock, ships in 1 to 2 days</span>}
          </p>

          <div className="mt-6 flex gap-3">
            <Qty value={qty} onChange={setQty} max={Math.max(1, available ?? 10)} />
            <button className="btn btn-primary flex-1" onClick={add}>Add to cart, {money(price * qty)}</button>
          </div>
          {error && <p className="error mt-3" role="alert">{error}</p>}

          <ul className="mt-8 grid gap-2 border-t border-line pt-6 text-[15px]">
            {p.details.map((d) => <li key={d} className="flex gap-2.5"><Check size={18} className="mt-0.5 shrink-0 text-muted" />{d}</li>)}
            <li className="flex gap-2.5"><Truck size={18} className="mt-0.5 shrink-0 text-muted" />Free shipping over {money(STORE.freeShippingOver)}</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold">You might also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">{related.map((x) => <ProductCard key={x.id} p={x} />)}</div>
        </section>
      )}
    </div>
  );
}

export function Cart() {
  const cart = useShop((s) => s.cart);
  const setQty = useShop((s) => s.setQty);
  const stock = useShop((s) => s.stock);
  const t = cartTotals(cart);
  if (!cart.length) {
    return <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6"><Empty icon={Bag} title="Your cart is empty" text="Have a look around the shop." action={<Link to={`${BASE}/c/all`} className="btn btn-primary btn-sm">Shop all</Link>} /></div>;
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <ul className="divide-y divide-line border-y border-line">
          {cart.map((l) => {
            const max = stock[l.productId]?.[variantKey(l.colour, l.size)] ?? 0;
            return (
              <li key={l.key} className="flex gap-4 py-5">
                <Link to={`${BASE}/p/${l.productId}`}><img src={img('store', l.photo)} alt="" className="aspect-[4/5] w-24 rounded-xl object-cover" /></Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3"><p className="font-medium">{l.name}</p><p className="font-semibold">{money(l.price * l.qty)}</p></div>
                  <p className="text-sm text-muted">{l.colour}{l.size && `, ${l.size}`}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <Qty value={l.qty} onChange={(q) => setQty(l.key, q)} min={0} max={max} label={`Quantity of ${l.name}`} />
                    <button className="text-sm text-muted underline-offset-2 hover:text-fg hover:underline" onClick={() => setQty(l.key, 0)}>Remove</button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="h-fit rounded-2xl border border-line bg-surface p-6">
          <Summary t={t} />
          {t.shipping > 0 && <p className="mt-3 text-sm text-muted">Add {money(STORE.freeShippingOver - t.subtotal)} more for free shipping.</p>}
          <Link to={`${BASE}/checkout`} className="btn btn-primary mt-6 w-full"><Lock size={16} /> Checkout</Link>
        </div>
      </div>
    </div>
  );
}

function Summary({ t }) {
  return (
    <dl className="grid gap-2 text-[15px]">
      <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(t.subtotal)}</dd></div>
      <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{t.shipping ? money(t.shipping) : 'Free'}</dd></div>
      <div className="mt-1 flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>Total</dt><dd>{money(t.total)}</dd></div>
      <p className="text-xs text-muted">Prices include GST.</p>
    </dl>
  );
}

const CO_STEPS = ['Address', 'Delivery', 'Payment', 'Review'];

export function Checkout() {
  const cart = useShop((s) => s.cart);
  const placeOrder = useShop((s) => s.placeOrder);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [v, setV] = useState({ name: '', email: '', phone: '', line1: '', city: '', pin: '', delivery: 'standard', pay: 'upi' });
  const [errors, setErrors] = useState({});
  const [paySheet, setPaySheet] = useState(false);
  const t = cartTotals(cart);
  const express = v.delivery === 'express' ? 199 : 0;

  if (!cart.length) return <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6"><Empty icon={Bag} title="Nothing to check out" action={<Link to={`${BASE}/c/all`} className="btn btn-primary btn-sm">Shop all</Link>} /></div>;

  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  function next() {
    if (step === 0) {
      const err = {};
      if (v.name.trim().length < 2) err.name = 'Add your name.';
      if (!/^\S+@\S+\.\S+$/.test(v.email)) err.email = 'Add a valid email.';
      if (!/^[0-9+\s-]{7,}$/.test(v.phone)) err.phone = 'Add a phone number (any digits work in this demo).';
      if (v.line1.trim().length < 4) err.line1 = 'Add a street address.';
      if (v.city.trim().length < 2) err.city = 'Add a city.';
      if (!/^\d{6}$/.test(v.pin)) err.pin = 'PIN codes have 6 digits.';
      setErrors(err);
      if (Object.keys(err).length) return;
    }
    if (step < 3) return setStep(step + 1);
    setPaySheet(true);
  }
  function finish() {
    setPaySheet(false);
    const order = placeOrder(v);
    navigate(`${BASE}/order/${order.id}`);
  }
  const F = ({ k, label, ...rest }) => (
    <div className="field">
      <label htmlFor={`co-${k}`}>{label}</label>
      <input id={`co-${k}`} className="input" value={v[k]} onChange={set(k)} aria-invalid={!!errors[k]} {...rest} />
      {errors[k] && <p className="error">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      <Link to={`${BASE}/cart`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeft size={14} /> Cart</Link>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">Checkout</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-line bg-surface">
          <Stepper steps={CO_STEPS} current={step} />
          <div className="p-5 sm:p-6">
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {F({ k: 'name', label: 'Full name', autoComplete: 'name' })}
                {F({ k: 'email', label: 'Email', type: 'email', autoComplete: 'email' })}
                {F({ k: 'phone', label: 'Phone', inputMode: 'tel', autoComplete: 'tel' })}
                {F({ k: 'pin', label: 'PIN code', inputMode: 'numeric', maxLength: 6 })}
                <div className="sm:col-span-2">{F({ k: 'line1', label: 'Address', autoComplete: 'street-address' })}</div>
                {F({ k: 'city', label: 'City', autoComplete: 'address-level2' })}
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-2">
                {[['standard', 'Standard delivery', '3 to 5 working days', t.shipping ? money(t.shipping) : 'Free'], ['express', 'Express delivery', 'Next working day', `+${money(199)}`]].map(([k, l, d, p]) => (
                  <label key={k} className={cx('flex cursor-pointer items-center gap-3 rounded-xl border p-4', v.delivery === k ? 'border-accent bg-accent-soft' : 'border-line')}>
                    <input type="radio" name="delivery" checked={v.delivery === k} onChange={() => setV({ ...v, delivery: k })} className="accent-[var(--accent)]" />
                    <span className="flex-1"><span className="block font-semibold">{l}</span><span className="text-sm text-muted">{d}</span></span>
                    <span className="font-semibold">{p}</span>
                  </label>
                ))}
              </div>
            )}
            {step === 2 && (
              <div className="grid gap-2">
                {[['upi', 'UPI'], ['card', 'Credit or debit card'], ['cod', 'Cash on delivery']].map(([k, l]) => (
                  <label key={k} className={cx('flex cursor-pointer items-center gap-3 rounded-xl border p-4 font-semibold', v.pay === k ? 'border-accent bg-accent-soft' : 'border-line')}>
                    <input type="radio" name="pay" checked={v.pay === k} onChange={() => setV({ ...v, pay: k })} className="accent-[var(--accent)]" />{l}
                  </label>
                ))}
                <p className="help mt-2">Payment is simulated. No card details are asked for or stored.</p>
              </div>
            )}
            {step === 3 && (
              <div className="grid gap-4 text-[15px]">
                <div><p className="label">Deliver to</p><p className="mt-1 text-muted">{v.name}, {v.line1}, {v.city} {v.pin}</p></div>
                <div><p className="label">Delivery</p><p className="mt-1 text-muted">{v.delivery === 'express' ? 'Express, next working day' : 'Standard, 3 to 5 working days'}</p></div>
                <div><p className="label">Payment</p><p className="mt-1 text-muted">{{ upi: 'UPI', card: 'Card', cod: 'Cash on delivery' }[v.pay]}</p></div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-line px-5 py-4 sm:px-6">
            {step > 0 ? <button className="btn btn-ghost btn-sm" onClick={() => setStep(step - 1)}><ArrowLeft size={14} /> Back</button> : <span />}
            <button className="btn btn-primary" onClick={next}>{step < 3 ? 'Continue' : `Place order, ${money(t.total + express)}`}</button>
          </div>
        </div>
        <aside className="h-fit rounded-2xl border border-line bg-surface p-6">
          <ul className="grid gap-3">
            {cart.map((l) => (
              <li key={l.key} className="flex items-center gap-3 text-sm">
                <img src={img('store', l.photo)} alt="" className="size-14 rounded-lg object-cover" />
                <span className="flex-1"><span className="block font-medium">{l.name} x {l.qty}</span><span className="text-muted">{l.colour}{l.size && `, ${l.size}`}</span></span>
                <span>{money(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-line pt-5"><Summary t={{ ...t, shipping: t.shipping + express, total: t.total + express }} /></div>
        </aside>
      </div>
      <Simulated open={paySheet} onClose={finish} kind="pay" title={v.pay === 'cod' ? 'Confirm order' : 'Payment'}>
        <p>{v.pay === 'cod' ? 'In a real build the order is confirmed by SMS and paid on delivery.' : 'In a real build this opens the payment gateway for UPI or cards. Nothing is charged in this demo.'}</p>
        <p className="text-muted">Press "Got it" to place the order. Stock goes down and the order appears in the store admin.</p>
      </Simulated>
    </div>
  );
}

export function OrderConfirmation() {
  const { id } = useParams();
  const order = useShop((s) => s.orders.find((o) => o.id === id));
  if (!order) return <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6"><Empty icon={Package} title="Order not found" action={<Link to={`${BASE}/account`} className="btn btn-ghost btn-sm">Your orders</Link>} /></div>;
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6 md:py-16">
      <CheckCircle size={56} weight="fill" className="mx-auto text-accent" />
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">Thank you, {order.customer.name.split(' ')[0]}</h1>
      <p className="mt-2 text-muted">Order <span className="font-mono font-semibold text-fg">{order.number}</span> is confirmed. A receipt would go to {order.customer.email}.</p>
      <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-surface text-left">
        {order.items.map((l, i) => (
          <li key={i} className="flex items-center gap-3 p-4 text-sm">
            <img src={img('store', l.photo)} alt="" className="size-14 rounded-lg object-cover" />
            <span className="flex-1"><span className="block font-medium">{l.name} x {l.qty}</span><span className="text-muted">{l.colour}{l.size && `, ${l.size}`}</span></span>
            <span>{money(l.price * l.qty)}</span>
          </li>
        ))}
        <li className="flex justify-between p-4 font-semibold"><span>Total</span><span>{money(order.total)}</span></li>
      </ul>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to={`${BASE}/account`} className="btn btn-primary">View your orders</Link>
        <Link to={`${BASE}/admin`} className="btn btn-ghost">See it in the admin</Link>
      </div>
    </div>
  );
}

export function Account() {
  const orders = useShop(useShallow((s) => s.orders.filter((o) => o.mine)));
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Your orders</h1>
      <p className="mt-2 text-muted">Demo account. Orders you place in this browser show up here.</p>
      {orders.length ? (
        <ul className="mt-8 grid gap-4">
          {orders.map((o) => (
            <li key={o.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono font-semibold">{o.number}</p>
                  <p className="text-sm text-muted">{fmtDate(o.placedAt, { day: 'numeric', month: 'long', year: 'numeric' })}, {money(o.total)}</p>
                </div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent-ink">{o.status}</span>
              </div>
              <div className="mt-4 flex gap-2">
                {o.items.map((l, i) => <img key={i} src={img('store', l.photo)} alt={l.name} title={l.name} className="size-14 rounded-lg object-cover" />)}
              </div>
              <Link to={`${BASE}/order/${o.id}`} className="mt-4 inline-flex text-sm font-semibold text-accent-ink hover:underline">Order details</Link>
            </li>
          ))}
        </ul>
      ) : <Empty icon={Package} title="No orders yet" text="Place an order and it appears here, with its status from the store admin." action={<Link to={`${BASE}/c/all`} className="btn btn-primary btn-sm">Start shopping</Link>} />}
    </div>
  );
}
