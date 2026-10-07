import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowRight, List, X } from '@phosphor-icons/react';
import { img } from '../../lib/asset';
import { cx, money } from '../../lib/format';
import { StylisedMap } from '../_shared/bits';
import Simulated from '../_shared/Simulated';
import StartProjectCTA from '../_shared/StartProjectCTA';
import Reserve from './Reserve';
import { FEATURES, HOTEL, ROOMS } from './data';

const NAV = [['Rooms', '#rooms'], ['Salon & bar', '#house'], ['The city', '#city'], ['Reserve', '#reserve']];

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="absolute inset-x-0 top-0 z-20 text-[#ede6d8]">
      <div className="mx-auto flex max-w-[90rem] items-center justify-between px-5 py-6 sm:px-10">
        <a href="#top" className="font-display text-lg tracking-[0.42em]">THE LINDEN</a>
        <nav className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.2em] md:flex">
          {NAV.slice(0, 3).map(([l, h]) => <a key={l} href={h} className="opacity-75 hover:opacity-100">{l}</a>)}
          <a href="#reserve" className="border border-[#ede6d8]/40 px-4 py-2.5 hover:border-[#ede6d8]">Reserve</a>
        </nav>
        <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Menu" aria-expanded={open}><List size={26} weight="light" /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0d0c0a] px-5 py-6">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg tracking-[0.42em]">THE LINDEN</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu"><X size={26} weight="light" /></button>
          </div>
          <nav className="mt-16 grid gap-6">
            {NAV.map(([l, h], i) => (
              <a key={l} href={h} onClick={() => setOpen(false)} className="flex items-baseline gap-4 font-display text-5xl italic">
                <span className="font-body text-xs not-italic tracking-[0.2em] text-[#c9a45c]">0{i + 1}</span>{l}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export default function LindenSite() {
  const reduce = useReducedMotion();
  const [preset, setPreset] = useState(null);
  const [sim, setSim] = useState(false);
  const fade = (d = 0) => (reduce ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 1, delay: d, ease: [0.16, 1, 0.3, 1] } });

  function pickRoom(r) {
    setPreset({ id: r.id, at: Date.now() });
    document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div id="top">
      <section className="relative isolate flex min-h-[calc(100dvh-var(--bar-h,0px))] flex-col justify-end overflow-hidden text-[#ede6d8]">
        <Header />
        <motion.img src={img('linden', 'hero')} alt="The marble front desk of the hotel lobby at night"
          initial={reduce ? false : { scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 -z-10 size-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0d0c0a] via-[#0d0c0a]/45 to-[#0d0c0a]/30" />
        <div className="mx-auto w-full max-w-[90rem] px-5 pb-12 sm:px-10 sm:pb-16">
          <motion.p {...fade(0.2)} className="text-[11px] uppercase tracking-[0.3em] text-[#c9a45c]">Hotel · Old Exchange District</motion.p>
          <motion.h1 {...fade(0.3)} className="mt-5 max-w-[12ch] font-display text-[3.6rem] font-light leading-[0.92] tracking-tight sm:text-8xl lg:text-[9rem]">
            A quiet hotel in a <em className="font-normal">loud</em> city.
          </motion.h1>
          <motion.div {...fade(0.45)} className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-[#ede6d8]/20 pt-6">
            <dl className="flex gap-10 text-sm">
              {[['48', 'Rooms'], ['9', 'Floors'], ['2 am', 'Bar closes']].map(([n, l]) => (
                <div key={l} className="flex flex-col-reverse"><dt className="text-[11px] uppercase tracking-[0.2em] opacity-60">{l}</dt><dd className="font-display text-3xl">{n}</dd></div>
              ))}
            </dl>
            <a href="#rooms" className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] opacity-75 hover:opacity-100">Scroll <ArrowDown size={14} /></a>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[90rem] gap-10 px-5 py-24 sm:px-10 md:grid-cols-[1fr_1.4fr] md:py-36">
        <motion.p {...fade()} className="text-[11px] uppercase tracking-[0.3em] text-accent">Since 1931, more or less</motion.p>
        <motion.div {...fade(0.1)}>
          <p className="font-display text-3xl font-light leading-[1.25] sm:text-4xl">
            <span className="float-left mr-3 mt-1 font-display text-7xl leading-[0.8] text-accent">T</span>he Linden was a bank, then a dance hall, then nothing at all for twenty years. Now it is forty-eight rooms above a brass arcade, with thick walls, heavy curtains and staff who remember how you take your coffee.
          </p>
          <p className="mt-6 text-sm text-muted">The history, like the hotel, is fictional.</p>
        </motion.div>
      </section>

      <section id="rooms" className="scroll-mt-10 border-t border-line py-20 md:py-28">
        <div className="mx-auto flex max-w-[90rem] items-end justify-between gap-6 px-5 sm:px-10">
          <h2 className="font-display text-5xl font-light italic sm:text-7xl">Rooms</h2>
          <p className="hidden max-w-[34ch] text-sm text-muted sm:block">Four kinds of room, all above the street noise. Choose one to start a reservation.</p>
        </div>
        <div className="mt-12 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-4 sm:scroll-px-10 no-scrollbar sm:px-10">
          {ROOMS.map((r, i) => (
            <motion.button key={r.id} {...fade(i * 0.08)} onClick={() => pickRoom(r)} className="group w-[78vw] max-w-[420px] shrink-0 snap-start text-left sm:w-[40vw] lg:w-[28vw]">
              <div className="overflow-hidden">
                <img src={img('linden', r.photo)} alt={r.name} loading="lazy" className="aspect-[3/4] w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105" />
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-line pb-4">
                <span className="font-display text-2xl">{r.name}</span>
                <span className="text-sm text-muted">from {money(r.rate)}</span>
              </div>
              <p className="mt-3 text-sm text-muted">{r.size} m² · sleeps {r.sleeps} · {r.view} view</p>
              <p className="mt-2 text-[15px] leading-relaxed">{r.blurb}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent">Reserve this room <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" /></span>
            </motion.button>
          ))}
        </div>
      </section>

      <section id="house" className="scroll-mt-10 border-t border-line">
        {FEATURES.map((f, i) => (
          <div key={f.n} className="mx-auto grid max-w-[90rem] items-center gap-8 px-5 py-16 sm:px-10 md:grid-cols-2 md:gap-16 md:py-24">
            <motion.div {...fade()} className={cx('overflow-hidden', i % 2 && 'md:order-2')}>
              <img src={img('linden', f.photo)} alt={f.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </motion.div>
            <motion.div {...fade(0.1)}>
              <p className="font-display text-7xl font-light italic text-accent/80 md:text-8xl">{f.n}</p>
              <h3 className="mt-4 font-display text-4xl sm:text-5xl">{f.title}</h3>
              <p className="mt-4 max-w-[44ch] text-lg leading-relaxed text-muted">{f.text}</p>
            </motion.div>
          </div>
        ))}
      </section>

      <section id="city" className="relative isolate overflow-hidden py-32 text-[#ede6d8] md:py-48">
        <img src={img('linden', 'city')} alt="City skyline reflected in the river at night" loading="lazy" className="absolute inset-0 -z-10 size-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-[#0d0c0a]/60" />
        <motion.blockquote {...fade()} className="mx-auto max-w-4xl px-5 text-center">
          <p className="font-display text-4xl font-light italic leading-tight sm:text-6xl">“Ten minutes from everything, and it still feels like a secret.”</p>
          <footer className="mt-8 text-[11px] uppercase tracking-[0.25em] opacity-70">Sample guest review</footer>
        </motion.blockquote>
      </section>

      <section id="reserve" className="mx-auto max-w-[90rem] scroll-mt-10 px-5 py-24 sm:px-10 md:py-32">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-5xl font-light italic sm:text-7xl">Reserve</h2>
          <button className="text-[11px] uppercase tracking-[0.2em] text-muted underline-offset-4 hover:text-fg hover:underline" onClick={() => setSim(true)}>Prefer to call reservations?</button>
        </div>
        <Reserve presetRoom={preset} />
      </section>

      <section className="mx-auto grid max-w-[90rem] gap-10 border-t border-line px-5 py-20 sm:px-10 md:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-accent">Find us</p>
          <p className="mt-5 font-display text-3xl">{HOTEL.address.join(', ')}</p>
          <p className="mt-2 text-sm text-muted">A fictional address. Eight minutes on foot from Exchange station.</p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <img src={img('linden', 'bar')} alt="A drink on the bar counter" loading="lazy" className="aspect-square w-full object-cover" />
            <img src={img('linden', 'bath')} alt="Freestanding stone bath" loading="lazy" className="aspect-square w-full object-cover" />
          </div>
        </div>
        <StylisedMap label="The Linden" className="min-h-80 rounded-none!" />
      </section>

      <footer className="border-t border-line px-5 py-14 text-center sm:px-10">
        <p className="font-display text-[14vw] font-light leading-none tracking-tight text-fg/90 md:text-[10vw]">The Linden</p>
      </footer>

      <StartProjectCTA projectRef="hotel" title="Want a hotel site with this kind of mood?"
        text="Editorial pages that sell the stay, with a reservation flow that shows real availability and the full price." />

      <Simulated open={sim} onClose={() => setSim(false)} kind="call" title="Call reservations">
        <p>In a real build this would dial the front desk. The Linden is fictional, so there is no real number here.</p>
      </Simulated>
    </div>
  );
}
