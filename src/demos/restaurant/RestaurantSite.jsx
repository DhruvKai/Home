import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bag, CalendarCheck, CheckCircle, Clock, Fire, ForkKnife, Leaf, MagnifyingGlass, MapPin, Phone, Receipt, Tag, Users,
} from '@phosphor-icons/react';
import { img } from '../../lib/asset';
import { cx, fmtDate, fmtTime, isoDay, money } from '../../lib/format';
import { Empty, StylisedMap } from '../_shared/bits';
import Lightbox from '../_shared/Lightbox';
import Simulated from '../_shared/Simulated';
import StartProjectCTA from '../_shared/StartProjectCTA';
import { CartDrawer, Checkout, DishModal, OrderTracker } from './Ordering';
import { CATEGORIES, DIETS, MENU, OFFERS, PLACE, orderStep, useRestaurant } from './data';

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const GALLERY = [['room', 'The dining room'], ['chef', 'Head chef at the pass'], ['bar', 'The bar'], ['hall', 'The mezzanine'], ['table', 'Weekend brunch']];
const TIMES = ['12:30', '13:00', '13:30', '14:00', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

function Header({ onCart }) {
  const count = useRestaurant((s) => s.cart.reduce((n, l) => n + l.qty, 0));
  return (
    <header className="sticky z-30 border-b border-line bg-bg/92 backdrop-blur-md" style={{ top: 'var(--bar-h, 0px)' }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
          <Fire size={24} weight="fill" className="text-accent" /> Ember &amp; Plate
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {[['Menu', '#menu'], ['Offers', '#offers'], ['Reserve', '#reserve'], ['Visit', '#visit']].map(([l, h]) => <a key={h} href={h} className="px-3 py-2 text-sm font-medium text-muted hover:text-fg">{l}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#reserve" className="btn btn-ghost btn-sm hidden sm:inline-flex">Book a table</a>
          <button className="btn btn-primary btn-sm relative" onClick={onCart} aria-label={`Your order, ${count} items`}>
            <Bag size={17} /> Order
            {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-surface text-[11px] font-bold text-accent-ink">{count}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

function Menu({ onPick }) {
  const [cat, setCat] = useState(CATEGORIES[0][0]);
  const [diets, setDiets] = useState([]);
  const [q, setQ] = useState('');
  const refs = useRef({});
  const filtered = MENU.filter((m) => diets.every((d) => m.diets.includes(d)) && (m.name + ' ' + m.desc).toLowerCase().includes(q.toLowerCase()));
  const filtering = diets.length > 0 || q;

  // Highlight the category in view while scrolling (IntersectionObserver, no scroll listeners).
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (vis) setCat(vis.target.dataset.cat);
    }, { rootMargin: '-35% 0px -55% 0px' });
    Object.values(refs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [filtering]);

  const jump = (k) => { setCat(k); refs.current[k]?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return (
    <section id="menu" className="scroll-mt-28 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Menu</h2>
        <p className="mt-3 text-muted">Order for pickup or delivery, or come in and eat it hot off the grill.</p>
      </div>

      <div className="sticky z-20 mt-8 border-y border-line bg-bg/95 backdrop-blur-md" style={{ top: 'calc(var(--bar-h, 0px) + 4rem)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {!filtering && (
            <div className="-mx-4 flex gap-1 overflow-x-auto px-4 py-2 no-scrollbar sm:mx-0 sm:px-0" role="tablist" aria-label="Menu categories">
              {CATEGORIES.map(([k, l]) => (
                <button key={k} role="tab" aria-selected={cat === k} onClick={() => jump(k)}
                  className={cx('shrink-0 rounded-full px-4 py-2 text-sm font-semibold', cat === k ? 'bg-fg text-bg' : 'text-muted hover:text-fg')}>{l}</button>
              ))}
            </div>
          )}
          <div className={cx('flex flex-wrap items-center gap-2 pb-3', filtering && 'pt-3')}>
            <div className="relative mr-1">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input className="input w-48 rounded-full py-1.5 pl-9 text-sm sm:w-60" placeholder="Search dishes" aria-label="Search dishes" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            {DIETS.map(([k, l]) => (
              <button key={k} onClick={() => setDiets(diets.includes(k) ? diets.filter((d) => d !== k) : [...diets, k])} aria-pressed={diets.includes(k)}
                className={cx('chip py-1.5', diets.includes(k) && 'chip-on')}>{l}</button>
            ))}
            {filtering && <button className="text-sm font-semibold text-accent-ink" onClick={() => { setDiets([]); setQ(''); }}>Clear</button>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {filtering ? (
          <div className="mt-8">
            <p className="text-sm text-muted">{filtered.length} dish{filtered.length === 1 ? '' : 'es'}</p>
            {filtered.length ? <Grid items={filtered} onPick={onPick} /> : <Empty icon={ForkKnife} title="No dishes match" text="Try fewer filters or another search." />}
          </div>
        ) : CATEGORIES.map(([k, l]) => (
          <div key={k} ref={(el) => { refs.current[k] = el; }} data-cat={k} className="scroll-mt-52 pt-10">
            <h3 className="font-display text-2xl font-bold">{l}</h3>
            <Grid items={MENU.filter((m) => m.cat === k)} onPick={onPick} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Grid({ items, onPick }) {
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m) => (
        <button key={m.id} onClick={() => onPick(m)} className="group flex gap-4 rounded-2xl border border-line bg-surface p-3 text-left transition-colors hover:border-fg/30">
          <div className="min-w-0 flex-1 p-1">
            <p className="flex items-center gap-2 font-bold">{m.name}{m.popular && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent-ink">Popular</span>}</p>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{m.desc}</p>
            <p className="mt-2 flex items-center gap-2 text-sm">
              <span className="font-semibold">{money(m.price)}</span>
              {m.diets.includes('vegan') ? <Leaf size={15} weight="fill" className="text-ok" aria-label="Vegan" /> : m.diets.includes('veg') && <Leaf size={15} className="text-ok" aria-label="Vegetarian" />}
              {m.diets.includes('spicy') && <Fire size={15} className="text-accent" aria-label="Spicy" />}
              {m.diets.includes('gf') && <span className="text-xs font-semibold text-muted">GF</span>}
            </p>
          </div>
          <img src={img('restaurant', m.photo)} alt="" loading="lazy" className="size-24 shrink-0 rounded-xl object-cover sm:size-28" />
        </button>
      ))}
    </div>
  );
}

function Reserve() {
  const reserve = useRestaurant((s) => s.reserve);
  const [v, setV] = useState({ size: 2, date: isoDay(1), time: '', name: '', phone: '' });
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);
  const days = Array.from({ length: 10 }, (_, i) => isoDay(i));
  // A few seeded "full" slots so the picker looks real.
  const full = (d, t) => (d.charCodeAt(9) + t.charCodeAt(1) + v.size) % 5 === 0;
  function submit(e) {
    e.preventDefault();
    if (!v.time) return setErr('Pick a time.');
    if (v.name.trim().length < 2 || !/^[0-9+\s-]{7,}$/.test(v.phone)) return setErr('Add your name and a phone number (any digits work in this demo).');
    setErr('');
    setDone(reserve(v));
  }
  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-center sm:p-10">
        <CheckCircle size={52} weight="fill" className="mx-auto text-accent" />
        <h3 className="mt-3 font-display text-2xl font-bold">Table booked</h3>
        <p className="mt-1 text-muted">{done.size} people, {fmtDate(done.date, { weekday: 'long', day: 'numeric', month: 'long' })} at {fmtTime(done.time)}</p>
        <p className="mt-1 text-sm text-muted">Reference <span className="font-mono font-semibold text-fg">{done.ref}</span></p>
        <button className="btn btn-ghost mt-6" onClick={() => { setDone(null); setV({ ...v, time: '' }); }}>Make another booking</button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} noValidate className="grid gap-6 rounded-2xl border border-line bg-surface p-5 sm:p-8">
      <div>
        <p className="label">Party size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <button type="button" key={n} onClick={() => setV({ ...v, size: n, time: '' })} aria-pressed={v.size === n}
              className={cx('grid size-11 place-items-center rounded-full border text-sm font-bold', v.size === n ? 'border-accent bg-accent text-on-accent' : 'border-line')}>{n}</button>
          ))}
        </div>
        <p className="help mt-2">For 9 or more, call us for the private room.</p>
      </div>
      <div>
        <p className="label">Date</p>
        <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 no-scrollbar sm:mx-0 sm:px-0">
          {days.map((d) => (
            <button type="button" key={d} onClick={() => setV({ ...v, date: d, time: '' })} aria-pressed={v.date === d}
              className={cx('flex w-16 shrink-0 flex-col items-center rounded-xl border py-2', v.date === d ? 'border-accent bg-accent text-on-accent' : 'border-line')}>
              <span className="text-xs">{d === isoDay(0) ? 'Today' : DAY[new Date(d + 'T00:00').getDay()]}</span>
              <span className="text-lg font-bold">{new Date(d + 'T00:00').getDate()}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="label">Time</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {TIMES.map((t) => {
            const isFull = full(v.date, t);
            return (
              <button type="button" key={t} disabled={isFull} onClick={() => setV({ ...v, time: t })} aria-pressed={v.time === t}
                className={cx('rounded-[10px] border py-2 text-sm font-semibold', v.time === t ? 'border-accent bg-accent text-on-accent' : 'border-line', isFull && 'line-through opacity-40')}>
                {fmtTime(t)}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field"><label htmlFor="rs-name">Name</label><input id="rs-name" className="input" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></div>
        <div className="field"><label htmlFor="rs-phone">Phone</label><input id="rs-phone" className="input" inputMode="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} /></div>
      </div>
      {err && <p className="error" role="alert">{err}</p>}
      <button className="btn btn-primary justify-self-start"><CalendarCheck size={18} /> Book a table</button>
    </form>
  );
}

function LatestOrder() {
  const order = useRestaurant((s) => s.orders[0]);
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 5000); return () => clearInterval(t); }, []);
  if (!order || orderStep(order) >= 3) return null;
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-accent bg-accent-soft p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 font-semibold"><Receipt size={20} className="text-accent-ink" /> Order #{order.number} is on its way through the kitchen</p>
        <OrderTracker order={order} />
      </div>
    </div>
  );
}

export default function RestaurantSite() {
  const [dish, setDish] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [lb, setLb] = useState(null);
  const [sim, setSim] = useState(false);
  const today = new Date().getDay();
  const photos = useMemo(() => GALLERY.map(([k, alt]) => ({ src: img('restaurant', k), alt })), []);

  return (
    <div id="top">
      <Header onCart={() => setCartOpen(true)} />
      <LatestOrder />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:pt-14">
        <div>
          <h1 className="max-w-[14ch] font-display text-5xl font-extrabold leading-[1] tracking-tight md:text-6xl lg:text-7xl">Cooked over fire.</h1>
          <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-muted">A neighbourhood grill for steaks, small plates and long dinners. Order online or book a table.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#menu" className="btn btn-primary"><Bag size={18} /> Order online</a>
            <a href="#reserve" className="btn btn-ghost"><CalendarCheck size={18} /> Book a table</a>
          </div>
        </div>
        <div className="grid grid-cols-[1.4fr_1fr] gap-3">
          <img src={img('restaurant', 'steak')} alt="Sliced steak on a board" className="row-span-2 h-full min-h-80 w-full rounded-[22px] object-cover" />
          <img src={img('restaurant', 'chef')} alt="A chef plating a dish" className="aspect-square w-full rounded-[22px] object-cover" />
          <img src={img('restaurant', 'skewers')} alt="Grilled skewers" className="aspect-square w-full rounded-[22px] object-cover" />
        </div>
      </section>

      <section id="offers" className="scroll-mt-28 border-y border-line bg-surface">
        <div className="mx-auto grid max-w-7xl md:grid-cols-3">
          {OFFERS.map(([t, d], i) => (
            <div key={t} className={cx('flex gap-4 px-4 py-6 sm:px-6', i > 0 && 'border-t border-line md:border-l md:border-t-0')}>
              <Tag size={22} className="shrink-0 text-accent" />
              <div><p className="font-bold">{t}</p><p className="mt-1 text-sm leading-relaxed text-muted">{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      <Menu onPick={setDish} />

      <section id="reserve" className="scroll-mt-28 bg-surface py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Book a table</h2>
            <p className="mt-3 max-w-[40ch] text-muted">Tables are held for 15 minutes. Walk-ins welcome at the bar.</p>
            <img src={img('restaurant', 'room')} alt="The dining room" loading="lazy" className="mt-8 hidden aspect-[4/3] w-full rounded-[22px] object-cover lg:block" />
          </div>
          <Reserve />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <h2 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Inside Ember</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
          {photos.map((p, i) => (
            <button key={p.src} onClick={() => setLb(i)} className={cx('overflow-hidden rounded-2xl', i === 0 && 'col-span-2 row-span-2')} aria-label={`Open photo: ${p.alt}`}>
              <img src={p.src} alt={p.alt} loading="lazy" className="size-full min-h-40 object-cover transition-transform duration-500 hover:scale-[1.03]" />
            </button>
          ))}
        </div>
        <Lightbox images={photos} index={lb} onChange={setLb} onClose={() => setLb(null)} />
      </section>

      <section id="visit" className="scroll-mt-28 border-t border-line bg-surface py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Visit</h2>
            <p className="mt-6 flex gap-3"><MapPin size={22} className="shrink-0 text-accent" /><span>{PLACE.address.join(', ')} <span className="text-xs text-muted">(fictional)</span></span></p>
            <div className="mt-6 flex gap-3">
              <Clock size={22} className="shrink-0 text-accent" />
              <dl className="grid flex-1 gap-1 text-[15px]">
                {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                  const h = PLACE.hours.find(([x]) => x === d);
                  return <div key={d} className={cx('flex justify-between', d === today && 'font-bold')}><dt>{DAY[d]}{d === today && ', today'}</dt><dd>{fmtTime(h[1])} to {fmtTime(h[2])}</dd></div>;
                })}
              </dl>
            </div>
            <p className="mt-6 flex gap-3 text-[15px]"><Users size={22} className="shrink-0 text-accent" />Private room for up to 20 guests.</p>
            <button className="btn btn-ghost btn-sm mt-6" onClick={() => setSim(true)}><Phone size={16} /> Call the restaurant</button>
          </div>
          <StylisedMap label="Ember & Plate" className="min-h-80" />
        </div>
      </section>

      <StartProjectCTA projectRef="restaurant" title="Need something like this for your restaurant?"
        text="Online ordering, table bookings and a menu your staff can update, without paying commission on every order." />
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2 font-display font-extrabold text-fg"><Fire size={18} weight="fill" className="text-accent" /> Ember &amp; Plate</p>
          <p>Prices include no service charge. Sample menu.</p>
        </div>
      </footer>

      <DishModal item={dish} onClose={() => setDish(null)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckout(true); }} />
      <Checkout open={checkout} onClose={() => setCheckout(false)} />
      <Simulated open={sim} onClose={() => setSim(false)} kind="call" title="Call the restaurant">
        <p>In a real build this dials the restaurant on mobile.</p>
        <p className="text-muted">This demo has no real phone number.</p>
      </Simulated>
    </div>
  );
}
