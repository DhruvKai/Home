import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, Plus } from '@phosphor-icons/react';
import { img } from '../../lib/asset';
import { money } from '../../lib/format';
import { StylisedMap } from '../_shared/bits';
import StartProjectCTA from '../_shared/StartProjectCTA';
import { toast } from '../_shared/toast';
import { Builder, Ticket } from './Builder';
import { BOWLS, BROTHS, SHOP, SIDES, bowlPrice, ticketStep, useKoji } from './data';

const INDEX = [['01', 'Bowls', '#bowls'], ['02', 'Build', '#build'], ['03', 'Sides', '#sides'], ['04', 'Visit', '#visit']];

function openNow() {
  const d = new Date();
  const day = d.getDay();
  const hm = d.getHours() * 60 + d.getMinutes();
  if (day === 1) return false;
  const late = day === 5 || day === 6 ? 24 * 60 + 30 : day === 0 ? 21 * 60 : 22 * 60 + 30;
  return (hm >= 12 * 60 && hm < 15 * 60) || (day === 0 ? hm >= 12 * 60 && hm < late : hm >= 18 * 60 && hm < late);
}

function Header({ onTicket }) {
  const { ticket, orders } = useKoji();
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 5000); return () => clearInterval(t); }, []);
  const live = orders.find((o) => ticketStep(o) < 3);
  const count = ticket.reduce((n, l) => n + l.qty, 0);
  return (
    <header className="sticky z-30 border-b border-line bg-bg" style={{ top: 'var(--bar-h, 0px)' }}>
      <div className="mx-auto grid h-16 max-w-[88rem] grid-cols-[auto_1fr_auto] items-center gap-6 px-4 sm:px-6">
        <a href="#top" className="text-3xl font-bold tracking-tighter">KŌJI</a>
        <nav className="hidden items-center gap-6 font-mono text-xs uppercase md:flex">
          {INDEX.map(([n, l, h]) => <a key={l} href={h} className="hover:text-accent"><span className="text-muted">{n}</span> {l}</a>)}
        </nav>
        <button onClick={onTicket} className="btn btn-primary btn-sm col-start-3">
          {live ? `Ticket ${live.number}` : `Ticket (${count})`}
        </button>
      </div>
    </header>
  );
}

export default function KojiSite() {
  const add = useKoji((s) => s.add);
  const [preset, setPreset] = useState(BOWLS[0]);
  const [ticketOpen, setTicketOpen] = useState(false);
  const open = openNow();

  function customise(bowl) {
    setPreset({ ...bowl });
    document.getElementById('build')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div id="top">
      <Header onTicket={() => setTicketOpen(true)} />

      <section className="mx-auto grid max-w-[88rem] grid-cols-12 border-b border-line px-4 sm:px-6">
        <div className="col-span-12 grid grid-cols-2 gap-4 border-b border-line py-3 font-mono text-[11px] uppercase sm:grid-cols-4 lg:col-span-12">
          <span>Ramen counter</span>
          <span className="hidden sm:block">Tannery Yard, Riverton</span>
          <span className="hidden sm:block">Est. 2019 · 14 seats</span>
          <span className="flex items-center gap-2 justify-self-end"><span className={open ? 'size-2 bg-accent' : 'size-2 border border-fg'} />{open ? 'Open now' : 'Closed now'}</span>
        </div>
        <div className="col-span-12 py-10 md:col-span-8 md:border-r md:border-line md:py-16 md:pr-8">
          <h1 className="text-[17vw] font-bold leading-[0.82] tracking-[-0.06em] md:text-[9.5vw] xl:text-[8.5rem]">
            Ramen,<br />built<br />your way<span className="text-accent">.</span>
          </h1>
          <div className="mt-10 grid max-w-xl gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
            <p className="text-lg leading-snug">Six broths, four noodles, nine toppings. Order ahead for pickup and skip the queue at the counter.</p>
            <a href="#build" className="btn btn-primary">Build a bowl <ArrowDownRight size={16} /></a>
          </div>
        </div>
        <div className="col-span-12 grid grid-rows-[1fr_auto] md:col-span-4">
          <img src={img('koji', 'pull')} alt="Noodles lifted from a bowl of ramen" className="aspect-[4/5] w-full object-cover md:aspect-auto md:h-full" />
          <ol className="border-t border-line font-mono text-sm">
            {INDEX.map(([n, l, h]) => (
              <li key={n}><a href={h} className="group flex items-center justify-between border-b border-line px-0 py-3 last:border-b-0 hover:text-accent md:px-6">
                <span><span className="text-muted">{n}</span> {l}</span><ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </a></li>
            ))}
          </ol>
        </div>
      </section>

      <section id="bowls" className="mx-auto max-w-[88rem] scroll-mt-28 px-4 py-16 sm:px-6">
        <div className="flex items-baseline justify-between border-b-4 border-fg pb-3">
          <h2 className="text-5xl font-bold tracking-tighter md:text-7xl">01 Bowls</h2>
          <span className="font-mono text-xs uppercase text-muted">Signature builds</span>
        </div>
        <ul>
          {BOWLS.map((b) => {
            const broth = BROTHS.find((x) => x.id === b.build.broth);
            return (
              <li key={b.id} className="grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-line py-4 sm:grid-cols-[4rem_96px_1fr_auto_auto] sm:gap-6">
                <span className="font-mono text-2xl text-accent">{b.no}</span>
                <img src={img('koji', b.photo)} alt="" loading="lazy" className="hidden aspect-square w-full object-cover sm:block" />
                <span>
                  <span className="block text-xl font-bold sm:text-2xl">{b.name}</span>
                  <span className="font-mono text-xs uppercase text-muted">{broth.note}{b.build.spice > 2 ? ' · hot' : ''}</span>
                </span>
                <span className="hidden font-mono text-lg sm:block">{money(bowlPrice(b.build))}</span>
                <span className="col-span-3 flex gap-2 sm:col-span-1">
                  <button className="btn btn-ghost btn-sm" onClick={() => customise(b)}>Customise</button>
                  <button className="btn btn-primary btn-sm" aria-label={`Add ${b.name}`} onClick={() => { add({ kind: 'bowl', name: b.name, lines: [broth.note], unit: bowlPrice(b.build), qty: 1 }); toast(`${b.name} added to your ticket`); }}>
                    <Plus size={14} weight="bold" /> <span className="sm:hidden">Add · {money(bowlPrice(b.build))}</span><span className="hidden sm:inline">Add</span>
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="build" className="mx-auto max-w-[88rem] scroll-mt-28 px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-4 border-fg pb-3">
          <h2 className="text-5xl font-bold tracking-tighter md:text-7xl">02 Build</h2>
          <span className="font-mono text-xs uppercase text-muted">Starting from: {preset.name}</span>
        </div>
        <Builder preset={preset} />
      </section>

      <section id="sides" className="mx-auto max-w-[88rem] scroll-mt-28 px-4 py-16 sm:px-6">
        <div className="flex items-baseline justify-between border-b-4 border-fg pb-3">
          <h2 className="text-5xl font-bold tracking-tighter md:text-7xl">03 Sides</h2>
          <span className="font-mono text-xs uppercase text-muted">And drinks</span>
        </div>
        <div className="grid border-l border-line sm:grid-cols-2 lg:grid-cols-3">
          {SIDES.map((s, i) => (
            <div key={s.id} className="flex flex-col border-b border-r border-line">
              {s.photo ? <img src={img('koji', s.photo)} alt={s.name} loading="lazy" className="aspect-[16/10] w-full object-cover" />
                : <div className="grid aspect-[16/6] place-items-center bg-sunken sm:aspect-[16/10]"><span className="text-6xl sm:text-8xl font-bold tracking-tighter text-fg/10">{String(i + 1).padStart(2, '0')}</span></div>}
              <div className="flex items-center justify-between gap-3 p-4">
                <span><span className="block font-bold">{s.name}</span><span className="font-mono text-sm">{money(s.price)}</span></span>
                <button className="btn btn-ghost btn-sm" aria-label={`Add ${s.name}`} onClick={() => { add({ kind: 'side', name: s.name, unit: s.price, qty: 1 }); toast(`${s.name} added to your ticket`); }}><Plus size={14} weight="bold" /> Add</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="visit" className="mx-auto max-w-[88rem] scroll-mt-28 px-4 py-16 sm:px-6">
        <div className="flex items-baseline justify-between border-b-4 border-fg pb-3">
          <h2 className="text-5xl font-bold tracking-tighter md:text-7xl">04 Visit</h2>
          <span className="font-mono text-xs uppercase text-muted">Walk-ins at the counter</span>
        </div>
        <div className="grid gap-0 md:grid-cols-3">
          <div className="border-b border-line py-6 md:border-r md:pr-6">
            <p className="font-mono text-xs uppercase text-muted">Address (fictional)</p>
            <p className="mt-2 text-2xl font-bold leading-tight">{SHOP.address.join(', ')}</p>
            <img src={img('koji', 'chef')} alt="A cook working over the grill" loading="lazy" className="mt-6 aspect-[4/3] w-full object-cover" />
          </div>
          <dl className="border-b border-line py-6 font-mono text-sm md:border-r md:px-6">
            <dt className="text-xs uppercase text-muted">Hours</dt>
            {SHOP.hours.map(([d, h]) => <dd key={d} className="mt-3 grid grid-cols-[7rem_1fr] gap-2 border-t border-line pt-3"><span>{d}</span><span>{h}</span></dd>)}
          </dl>
          <div className="border-b border-line py-6 md:pl-6">
            <StylisedMap label="Kōji" className="h-full min-h-64" />
          </div>
        </div>
      </section>

      <StartProjectCTA projectRef="restaurant" title="Want ordering this direct for your kitchen?"
        text="A menu customers can build from, pickup slots that respect your kitchen's pace and a live ticket, with no marketplace commission." />

      <Ticket open={ticketOpen} onClose={() => setTicketOpen(false)} />
    </div>
  );
}
