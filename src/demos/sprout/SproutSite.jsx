import { useState } from 'react';
import { ArrowRight, Drop, Leaf, PawPrint, Plant, ShoppingBag, Sun, Truck } from '@phosphor-icons/react';
import { img } from '../../lib/asset';
import { cx, money } from '../../lib/format';
import StartProjectCTA from '../_shared/StartProjectCTA';
import { toast } from '../_shared/toast';
import { Cart, Quiz } from './Flows';
import { FILTERS, FREE_REPOT, PLANTS, POTS, useSprout } from './data';

const STRIP = ['Plants that survive you', `Free repotting over ${money(FREE_REPOT)}`, 'Pet-safe picks, clearly marked', 'Ships in a padded box in 2 days', 'Care card with every plant'];
const CARE = ['', 'Easy', 'Some care', 'Fussy'];
const ROTATE = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

function Marquee() {
  const row = [...STRIP, ...STRIP];
  return (
    <div className="overflow-hidden border-b-2 border-fg bg-fg py-2 text-bg">
      <div className="marquee flex w-max gap-8 whitespace-nowrap text-sm font-bold uppercase">
        {[...row, ...row].map((t, i) => <span key={i} className="flex items-center gap-8">{t}<Leaf size={14} weight="fill" className="text-accent" /></span>)}
      </div>
    </div>
  );
}

function Header({ onCart }) {
  const count = useSprout((s) => s.cart.reduce((n, l) => n + l.qty, 0));
  return (
    <header className="sticky z-30 border-b-2 border-fg bg-bg" style={{ top: 'var(--bar-h, 0px)' }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2 font-display text-xl">
          <span className="grid size-9 -rotate-6 place-items-center rounded-xl border-2 border-fg bg-accent"><Plant size={18} weight="fill" /></span>
          Sprout Supply
        </a>
        <nav className="hidden items-center gap-6 font-semibold md:flex">
          <a href="#shop" className="hover:underline">Shop</a>
          <a href="#care" className="hover:underline">Care levels</a>
          <a href="#reviews" className="hover:underline">Reviews</a>
        </nav>
        <button onClick={onCart} className="btn btn-ghost btn-sm relative" aria-label={`Cart, ${count} items`}>
          <ShoppingBag size={18} weight="bold" /> <span className="hidden sm:inline">Cart</span>
          {count > 0 && <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border-2 border-fg bg-accent text-xs font-bold text-on-accent">{count}</span>}
        </button>
      </div>
    </header>
  );
}

function ProductCard({ p, i }) {
  const add = useSprout((s) => s.add);
  const [pot, setPot] = useState('nursery');
  const extra = POTS.find(([id]) => id === pot)[2];
  return (
    <article className="card flex flex-col overflow-hidden">
      <div className="relative border-b-2 border-fg bg-sunken">
        <img src={img('sprout', p.photo)} alt={p.name} loading="lazy" className="aspect-[4/5] w-full object-cover" style={p.pos ? { objectPosition: p.pos } : undefined} />
        <span className={cx('absolute left-3 top-3 rounded-full border-2 border-fg bg-surface px-3 py-1 text-xs font-bold', ROTATE[i % 4])}>{p.tag}</span>
        {p.pet && <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border-2 border-fg bg-accent text-on-accent" title="Pet-safe"><PawPrint size={16} weight="fill" /></span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg leading-tight">{p.name}</h3>
            <p className="text-sm italic text-muted">{p.latin}</p>
          </div>
          <p className="text-lg font-bold">{money(p.price + extra)}</p>
        </div>
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-muted">
          <span className="flex items-center gap-1"><Sun size={14} />{p.light.join(', ')} light</span>
          <span className="flex items-center gap-1"><Drop size={14} />{CARE[p.care]}</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Pot for ${p.name}`}>
          {POTS.map(([id, label, price]) => (
            <button key={id} role="radio" aria-checked={pot === id} onClick={() => setPot(id)}
              className={cx('rounded-full border-2 px-2.5 py-1 text-xs font-semibold', pot === id ? 'border-fg bg-fg text-bg' : 'border-fg/25 hover:border-fg')}>
              {label}{price ? ` +${price}` : ''}
            </button>
          ))}
        </div>
        <div className="mt-auto pt-5">
          <button className="btn btn-primary w-full" onClick={() => { add(p.id, pot); toast(`${p.name} added to your cart`); }}>Add to cart</button>
        </div>
      </div>
    </article>
  );
}

export default function SproutSite() {
  const [filter, setFilter] = useState('all');
  const [quiz, setQuiz] = useState(false);
  const [cart, setCart] = useState(false);
  const test = FILTERS.find(([id]) => id === filter)[2];
  const list = PLANTS.filter(test);

  return (
    <div id="top">
      <Marquee />
      <Header onCart={() => setCart(true)} />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div className="card bg-accent-soft p-6 sm:p-10">
          <p className="inline-block -rotate-2 rounded-full border-2 border-fg bg-surface px-3 py-1 text-sm font-bold">New: the plant finder</p>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">Plants for people who forget to water.</h1>
          <p className="mt-6 max-w-[42ch] text-lg leading-relaxed">Answer four honest questions and we will match you with plants that suit your light, your pets and your habits.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={() => setQuiz(true)}>Find my plant <ArrowRight size={16} weight="bold" /></button>
            <a href="#shop" className="btn btn-ghost">Shop all plants</a>
          </div>
        </div>
        <div className="relative px-2 py-4 sm:px-6">
          <img src={img('sprout', 'room')} alt="A sunny living room full of houseplants" className="aspect-[4/3] w-full rotate-2 rounded-[22px] border-2 border-fg object-cover shadow-[8px_8px_0_var(--fg)] lg:aspect-[4/5]" />
          <span className="absolute -left-1 bottom-10 -rotate-6 rounded-2xl border-2 border-fg bg-sunken px-4 py-2 font-display text-lg shadow-[4px_4px_0_var(--fg)] sm:left-0">12 plants, 0 drama</span>
          <span className="absolute -top-1 right-4 grid size-24 rotate-12 place-items-center rounded-full border-2 border-fg bg-accent text-center text-xs font-bold leading-tight text-on-accent shadow-[4px_4px_0_var(--fg)]">Ships in<br /><span className="font-display text-lg">2 days</span></span>
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl tracking-tight md:text-5xl">The shop</h2>
          <p className="font-semibold">{list.length} plant{list.length === 1 ? '' : 's'}</p>
        </div>
        <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
          {FILTERS.map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id} className={cx('chip shrink-0 px-4! py-2! text-sm!', filter === id && 'chip-on')}>{label}</button>
          ))}
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
        </div>
      </section>

      <section id="care" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6">
        <h2 className="font-display text-4xl tracking-tight md:text-5xl">Care levels, explained</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[[Leaf, 'Easy', 'Water when the soil is dry. Forgives a missed fortnight.', 'bg-accent-soft'], [Drop, 'Some care', 'Likes a routine and a bright spot. Tells you when it is thirsty.', 'bg-sunken'], [Sun, 'Fussy', 'Wants steady light, humidity and attention. Worth it.', 'bg-surface']].map(([Icon, t, d, bg], i) => (
            <div key={t} className={cx('card p-6', bg, ROTATE[i])}>
              <span className="grid size-12 place-items-center rounded-full border-2 border-fg bg-surface"><Icon size={22} weight="bold" /></span>
              <h3 className="mt-4 font-display text-2xl">{t}</h3>
              <p className="mt-2 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="card grid items-center gap-6 overflow-hidden md:grid-cols-[1fr_1.2fr]">
          <img src={img('sprout', 'pots')} alt="Terracotta pots with succulents" loading="lazy" className="aspect-[16/10] size-full border-b-2 border-fg object-cover md:border-b-0 md:border-r-2" />
          <div className="p-6 md:pr-10">
            <Truck size={30} weight="bold" />
            <h2 className="mt-3 font-display text-3xl leading-tight">Free repotting on orders over {money(FREE_REPOT)}</h2>
            <p className="mt-2 leading-relaxed text-muted">Pick a pot and we plant it for you in fresh mix, so it arrives ready for the shelf.</p>
          </div>
        </div>
      </section>

      <section id="reviews" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6">
        <h2 className="font-display text-4xl tracking-tight md:text-5xl">People still have plants</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[['Six months in and my snake plant is thriving. My track record before this was zero.', 'Neha'], ['The quiz said no fiddle leaf for me. It was right. The pothos is enormous.', 'Arjun'], ['Pet-safe filter is the best feature. The cat agrees.', 'Sana']].map(([q, who], i) => (
            <blockquote key={who} className={cx('card p-6', i === 1 && 'bg-sunken md:translate-y-6')}>
              <p className="text-lg font-semibold leading-snug">“{q}”</p>
              <footer className="mt-4 text-sm text-muted">{who} · sample review</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <StartProjectCTA projectRef="ecommerce" title="Want a shop that helps people choose?"
        text="Product finders, smart filters and a checkout that just works, built as a custom store or on a platform like Shopify." />

      <Quiz open={quiz} onClose={() => setQuiz(false)} />
      <Cart open={cart} onClose={() => setCart(false)} />
    </div>
  );
}
