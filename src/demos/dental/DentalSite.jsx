import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight, ChatCircleDots, Clock, List, MapPin, Phone, ShieldCheck, Smiley, Sparkle, Tooth, X } from '@phosphor-icons/react';
import { img } from '../../lib/asset';
import { cx, fmtDate, fmtTime, isoDay, money } from '../../lib/format';
import { Accordion, StylisedMap } from '../_shared/bits';
import Simulated from '../_shared/Simulated';
import StartProjectCTA from '../_shared/StartProjectCTA';
import Planner from './Planner';
import { FAQ, REVIEWS, STUDIO, TEAM, TREATMENTS, freeTimes, useDental } from './data';

const NAV = [['Treatments', '#treatments'], ['Team', '#team'], ['Questions', '#faq'], ['Visit', '#visit']];

const TILE = {
  big: 'col-span-2 row-span-2',
  tall: 'row-span-2',
  wide: 'col-span-2',
  small: '',
};

function Header({ onPlan }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky z-30 px-3 pt-3 sm:px-6" style={{ top: 'var(--bar-h, 0px)' }}>
      <div className="glass mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full pl-5 pr-2">
        <a href="#top" className="flex items-center gap-2 font-display text-2xl leading-none">
          <span className="grid size-7 place-items-center rounded-full bg-accent text-on-accent"><Sparkle size={14} weight="fill" /></span>
          Lumen
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(([l, h]) => <a key={l} href={h} className="rounded-full px-3.5 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-fg">{l}</a>)}
        </nav>
        <div className="flex items-center gap-1">
          <button className="btn btn-primary btn-sm" onClick={() => onPlan()}>Plan your visit</button>
          <button className="grid size-10 place-items-center rounded-full hover:bg-surface md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X size={20} /> : <List size={20} />}</button>
        </div>
      </div>
      {open && (
        <nav className="glass mx-auto mt-2 grid max-w-6xl gap-1 rounded-3xl p-2 md:hidden">
          {NAV.map(([l, h]) => <a key={l} href={h} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 font-medium hover:bg-surface">{l}</a>)}
        </nav>
      )}
    </header>
  );
}

function NextSlot() {
  const bookings = useDental((s) => s.bookings);
  const next = useMemo(() => {
    for (let i = 1; i < 14; i++) {
      const d = isoDay(i);
      const t = freeTimes(d, bookings)[0];
      if (t) return { d, t };
    }
    return null;
  }, [bookings]);
  if (!next) return null;
  return (
    <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
      <span className="grid size-9 place-items-center rounded-full bg-accent-soft text-accent-ink"><Clock size={18} /></span>
      <span className="text-sm leading-tight"><span className="block text-muted">Next free check-up</span><span className="font-semibold">{fmtDate(next.d, { weekday: 'short', day: 'numeric', month: 'short' })}, {fmtTime(next.t)}</span></span>
    </div>
  );
}

export default function DentalSite() {
  const [plan, setPlan] = useState({ open: false, preset: null });
  const [sim, setSim] = useState(null);
  const reduce = useReducedMotion();
  const openPlan = (preset = null) => setPlan({ open: true, preset });
  const rise = (d = 0) => (reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: d, ease: [0.16, 1, 0.3, 1] } });

  return (
    <div id="top" className="mesh">
      <Header onPlan={openPlan} />

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pt-20">
        <div>
          <motion.p {...rise()} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-[13px] font-medium text-muted">
            <ShieldCheck size={15} className="text-accent" /> Prices shown before anything starts
          </motion.p>
          <motion.h1 {...rise(0.05)} className="mt-6 font-display text-[3.4rem] leading-[0.95] tracking-tight sm:text-7xl lg:text-[5.5rem]">
            Calm dentistry, <em className="text-accent-ink">clearly priced.</em>
          </motion.h1>
          <motion.p {...rise(0.1)} className="mt-6 max-w-[44ch] text-lg leading-relaxed text-muted">
            A small studio for check-ups, whitening, aligners and implants. Build your treatment plan, see the full estimate, then pick a time that suits you.
          </motion.p>
          <motion.div {...rise(0.15)} className="mt-8 flex flex-wrap items-center gap-3">
            <button className="btn btn-primary" onClick={() => openPlan()}>Plan your visit <ArrowRight size={16} weight="bold" /></button>
            <a href="#treatments" className="btn btn-ghost bg-surface/60">See treatments</a>
          </motion.div>
        </div>
        <motion.div {...rise(0.1)} className="relative">
          <img src={img('dental', 'hero')} alt="The bright, plant-filled waiting lounge" className="aspect-[4/5] w-full rounded-[36px] object-cover sm:aspect-[5/4] lg:aspect-[4/5]" />
          <div className="absolute -bottom-5 left-4 right-4 flex flex-wrap gap-3 sm:left-6 sm:right-auto">
            <NextSlot />
          </div>
          <div className="glass absolute right-4 top-4 hidden rounded-2xl px-4 py-3 text-sm sm:block">
            <p className="font-display text-3xl leading-none">4.9</p>
            <p className="text-muted">sample rating</p>
          </div>
        </motion.div>
      </section>

      <section id="treatments" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-5xl leading-none tracking-tight md:text-6xl">Treatments</h2>
          <p className="max-w-[40ch] text-muted">Tap any treatment to start a plan with it. Prices are starting points in this demo.</p>
        </div>
        <div className="mt-10 grid auto-rows-[170px] grid-cols-2 gap-3 md:auto-rows-[200px] md:grid-cols-4 md:gap-4">
          {[...TREATMENTS].sort((a, b) => ['big', 'tall', 'wide', 'small'].indexOf(a.size) - ['big', 'tall', 'wide', 'small'].indexOf(b.size)).map((t) => (
            <button key={t.id} onClick={() => openPlan(t.id)} aria-label={`Plan ${t.name}`}
              className={cx('group relative flex flex-col justify-end overflow-hidden rounded-[28px] p-4 text-left sm:p-5', TILE[t.size], t.photo ? 'text-white' : 'glass')}>
              {t.photo && (
                <>
                  <img src={img('dental', t.photo)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                </>
              )}
              {!t.photo && <span className="mb-auto grid size-10 place-items-center rounded-full bg-accent-soft text-accent-ink">{t.id === 'kids' ? <Smiley size={20} /> : <Tooth size={20} />}</span>}
              <span className="relative">
                <span className={cx('block font-display leading-none', t.size === 'big' ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl')}>{t.name}</span>
                {(t.size === 'big' || t.size === 'wide') && <span className="mt-2 block max-w-[38ch] text-sm opacity-85">{t.blurb}</span>}
                <span className={cx('mt-2 flex items-center gap-1 text-sm font-semibold', !t.photo && 'text-accent-ink')}>from {money(t.price)} <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="glass grid gap-8 rounded-[36px] p-6 sm:p-10 md:grid-cols-3">
          {[['Plan', 'Choose treatments and see every line of the estimate before you book.'], ['Scan', 'Aligners and implants start with a 3D scan, so the plan is exact.'], ['Smile', 'Pay in full or split bigger treatments over 6 or 12 months.']].map(([t, d], i) => (
            <div key={t}>
              <p className="font-display text-6xl italic leading-none text-accent">{i + 1}</p>
              <h3 className="mt-4 text-lg font-semibold">{t}</h3>
              <p className="mt-1 leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="team" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16 sm:px-6">
        <h2 className="font-display text-5xl leading-none tracking-tight md:text-6xl">The team</h2>
        <p className="mt-3 text-muted">Sample people for this fictional studio.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {TEAM.map((d) => (
            <figure key={d.id} className="relative overflow-hidden rounded-[28px]">
              <img src={img('dental', d.photo)} alt={`Portrait used for ${d.name}`} loading="lazy" className="aspect-[3/4] w-full object-cover object-top" />
              <figcaption className="glass absolute inset-x-3 bottom-3 rounded-2xl px-4 py-3">
                <p className="font-semibold">{d.name}</p>
                <p className="text-sm text-muted">{d.role} · {d.years} years</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {REVIEWS.map(([q, who]) => (
            <blockquote key={who} className="card glass flex flex-col p-6">
              <p className="font-display text-2xl leading-snug">“{q}”</p>
              <footer className="mt-auto pt-6 text-sm text-muted">{who} · sample review</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto grid max-w-6xl scroll-mt-28 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
        <h2 className="font-display text-5xl leading-none tracking-tight md:text-6xl">Questions</h2>
        <Accordion items={FAQ} />
      </section>

      <section id="visit" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="glass flex flex-col rounded-[36px] p-6 sm:p-8">
            <h2 className="font-display text-5xl leading-none tracking-tight">Visit</h2>
            <p className="mt-6 flex gap-3"><MapPin size={22} className="shrink-0 text-accent" /><span>{STUDIO.address.join(', ')} <span className="text-xs text-muted">(fictional)</span></span></p>
            <dl className="mt-6 grid gap-2 text-[15px]">
              {STUDIO.hours.map(([d, h]) => <div key={d} className="flex justify-between gap-4 border-b border-line pb-2"><dt className="text-muted">{d}</dt><dd className="font-medium">{h}</dd></div>)}
            </dl>
            <div className="mt-auto flex flex-wrap gap-2 pt-8">
              <button className="btn btn-ghost btn-sm bg-surface/60" onClick={() => setSim('call')}><Phone size={16} /> Call the studio</button>
              <button className="btn btn-ghost btn-sm bg-surface/60" onClick={() => setSim('whatsapp')}><ChatCircleDots size={16} /> Message us</button>
            </div>
          </div>
          <div className="grid gap-4">
            <StylisedMap label="Lumen Dental Studio" className="min-h-64 rounded-[36px]!" />
            <img src={img('dental', 'reception')} alt="The reception desk" loading="lazy" className="aspect-[16/7] w-full rounded-[36px] object-cover" />
          </div>
        </div>
      </section>

      <StartProjectCTA projectRef="clinic" title="Want a clinic site that books itself?"
        text="Treatment plans with clear prices, online slots and confirmations, designed around how your practice actually works." />

      <Planner open={plan.open} preset={plan.preset} onClose={() => setPlan({ open: false, preset: null })} />
      <Simulated open={!!sim} onClose={() => setSim(null)} kind={sim ?? 'call'} title={sim === 'call' ? 'Call the studio' : 'Message the studio'}>
        <p>In a real build this {sim === 'call' ? 'would dial the studio' : 'would open a chat with the front desk'}. Lumen Dental Studio is fictional, so there is no real number here.</p>
      </Simulated>
    </div>
  );
}
