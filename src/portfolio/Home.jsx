import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { ArrowRight, ArrowUpRight, Check, GithubLogo, X } from '@phosphor-icons/react';
import { work } from '../data/work';
import { CATEGORIES, demos } from '../data/demos';
import { PROCESS, SERVICES } from '../data/services';
import { SITE } from '../config';
import { shot } from '../lib/asset';
import { cx } from '../lib/format';
import { Available, ConceptBadge, EASE, RealBadge, Reveal, SectionHeading, SocialPills, avatar, portrait } from './ui';
import ContactForm from './ContactForm';

// Verified stack highlights per project (see data/work.js for sources).
const TAGS = {
  overhere: ['PWA', 'Supabase', 'Face liveness check'],
  dtours: ['Node.js', 'MongoDB', 'Stripe'],
  kidy: ['React 19', 'Zustand', 'No-code admin'],
};

// Every card in the Examples grid, grouped for the filter chips. A group with an odd number of cards
// gets a wide first card, so no filter leaves a gap in the two-column grid.
const GROUPS = [
  ['real', 'Real projects', work],
  ...CATEGORIES.map(([cat, label]) => [cat, label, demos.filter((d) => d.category === cat)]),
];
const CARDS = GROUPS.flatMap(([group, , items]) => items.map((item, i) => ({ group, item, wide: items.length % 2 === 1 && i === 0 })));
const FILTERS = [['all', 'All', CARDS.length], ...GROUPS.map(([id, label, items]) => [id, label, items.length])];

// Portrait is a cut-out PNG exported at three widths; this is its width / height.
const PORTRAIT = { w: 1200, h: 1314 };

const shell = 'mx-auto max-w-[1400px] px-4 md:px-8';

function Letters({ word, delay, reduce }) {
  return word.split('').map((ch, i) => (
    <motion.span key={i} className="inline-block"
      initial={reduce ? false : { y: '45%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: delay + i * 0.05, ease: EASE }}>
      {ch}
    </motion.span>
  ));
}

// Black and white portrait; colour shows only inside a soft circle that follows the pointer (a tap on touch screens).
function Portrait({ reduce }) {
  const [on, setOn] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 350, damping: 32, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 350, damping: 32, mass: 0.4 });
  const mask = useMotionTemplate`radial-gradient(circle 180px at ${reduce ? x : sx}px ${reduce ? y : sy}px, #000 30%, transparent 100%)`;
  const img = {
    src: portrait(800),
    srcSet: `${portrait(500)} 500w, ${portrait(800)} 800w, ${portrait(1200)} 1200w`,
    sizes: '(min-width: 1024px) 40vw, 100vw',
    width: PORTRAIT.w, height: PORTRAIT.h,
  };
  const point = (e, jump) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    x.set(px); y.set(py);
    if (jump) { sx.jump(px); sy.jump(py); }
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 0.35, ease: EASE }}
      onPointerEnter={(e) => { point(e, true); setOn(true); }}
      onPointerDown={(e) => { point(e, true); setOn(true); }}
      onPointerMove={(e) => point(e)}
      onPointerLeave={() => setOn(false)}
      onPointerCancel={() => setOn(false)}
      className="pointer-events-auto relative h-auto w-full lg:h-full lg:w-auto">
      <img {...img} alt="Dhruv Kaith in a dark blazer, white shirt and clear glasses" fetchPriority="high"
        className="block h-auto w-full grayscale lg:h-full lg:w-auto" />
      <motion.img {...img} alt="" aria-hidden="true"
        initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: on ? 0.25 : 0.6, ease: EASE }}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className="pointer-events-none absolute inset-0 size-full" />
    </motion.div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className={cx(shell, 'relative flex flex-col overflow-hidden pt-4 lg:block lg:h-[calc(100dvh-4.5rem)] lg:min-h-[640px] lg:max-h-[980px] lg:pt-6')}>
      <Available className="mb-6 self-start lg:hidden" />
      <h1 aria-label={SITE.name}
        className="relative z-0 flex select-none flex-col font-extrabold uppercase leading-[0.84] tracking-[-0.045em] text-[23.5vw] sm:flex-row sm:justify-between sm:text-[14.3vw] 2xl:text-[13.1rem]">
        <span aria-hidden="true" className="text-outline"><Letters word="Dhruv" delay={0.05} reduce={reduce} /></span>
        <span aria-hidden="true" className="self-end sm:self-auto"><Letters word="Kaith" delay={0.25} reduce={reduce} /></span>
      </h1>

      <div className="pointer-events-none relative z-10 mx-auto -mt-[3vw] w-full max-w-[600px] sm:-mt-[3vw] sm:w-[76%] lg:absolute lg:bottom-0 lg:left-1/2 lg:mt-0 lg:h-[82%] lg:w-auto lg:max-w-none lg:-translate-x-1/2 xl:h-[80%]">
        <Portrait reduce={reduce} />
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
        className="relative z-20 -mt-2 border-t border-line bg-bg pt-6 lg:absolute lg:bottom-14 lg:left-8 lg:mt-0 lg:max-w-[13rem] lg:border-0 lg:bg-transparent lg:pt-0 xl:max-w-[19rem]">
        <h2 className="text-2xl font-bold leading-tight tracking-tight xl:text-[1.75rem]">Fast to launch. Hard to break.</h2>
        <p className="mt-3 leading-relaxed text-muted">Full-stack developer building websites, web apps and iOS and Android apps, with security designed in.</p>
        <Link to="/#contact" className="btn btn-primary mt-6">Let's talk <ArrowUpRight size={16} weight="bold" /></Link>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.85, ease: EASE }}
        className="relative z-20 mt-8 pb-10 lg:absolute lg:bottom-14 lg:right-8 lg:mt-0 lg:pb-0">
        <SocialPills className="lg:hidden" />
        <SocialPills vertical className="hidden lg:flex" />
      </motion.div>
    </section>
  );
}

function ProjectCard({ p, wide, i }) {
  return (
    <Reveal data-card="real" delay={(i % 2) * 0.06} className={cx('group flex flex-col rounded-[28px] border border-line bg-surface p-2.5 sm:p-3', wide && 'md:col-span-2')}>
      <Link to={`/work/${p.slug}`} className="relative block overflow-hidden rounded-[20px] bg-sunken" aria-label={`${p.name} case study`}>
        {wide ? (
          <div className="grid items-end gap-4 p-4 sm:grid-cols-[1fr_auto] sm:gap-6 sm:p-8">
            <img src={shot('work', p.shots.main)} alt={`${p.name} website`} loading="lazy" className="aspect-[16/10] w-full rounded-xl border border-line object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]" />
            <div className="mx-auto w-[150px] overflow-hidden rounded-[22px] border-[5px] border-fg bg-fg sm:w-[180px] lg:w-[210px]" style={{ aspectRatio: '390/780' }}>
              <img src={shot('work', p.shots.mobile)} alt={`${p.name} on a phone`} loading="lazy" className="size-full rounded-[17px] object-cover object-top" />
            </div>
          </div>
        ) : (
          <img src={shot('work', p.shots.main)} alt={`${p.name} website`} loading="lazy" className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
        )}
        <span className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 scale-50 place-items-center rounded-full bg-fg text-bg opacity-0 shadow-xl transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-100">
          <ArrowUpRight size={30} />
        </span>
      </Link>
      <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-5 sm:px-3">
        <h3 className="text-2xl font-medium leading-tight tracking-tight md:text-[1.9rem]">
          <Link to={`/work/${p.slug}`}>{p.name} <span className="text-muted">- {p.kind}</span></Link>
        </h3>
        <p className="mt-3 max-w-[62ch] leading-relaxed text-muted">{p.summary}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
          <RealBadge />
          {TAGS[p.slug].map((t) => <span key={t} className="rounded-full border border-line px-3 py-1 text-sm">{t}</span>)}
          <span className="ml-auto flex gap-1.5">
            <a href={p.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-sm font-semibold hover:border-fg">Live <ArrowUpRight size={13} weight="bold" /></a>
            <a href={p.github} target="_blank" rel="noreferrer" className="grid size-8 place-items-center rounded-full border border-line hover:border-fg" aria-label={`${p.name} on GitHub`}><GithubLogo size={16} /></a>
          </span>
        </div>
      </div>
    </Reveal>
  );
}

function DemoCard({ d, wide, i }) {
  return (
    <Reveal data-card="demo" delay={(i % 2) * 0.06} className={cx('group flex flex-col rounded-[28px] border border-line bg-surface p-2.5 sm:p-3', wide && 'md:col-span-2 lg:flex-row lg:items-start')}>
      <Link to={d.path} className={cx('relative block overflow-hidden rounded-[20px] bg-sunken', wide && 'lg:w-[58%] lg:shrink-0')} aria-label={`Open the ${d.name} demo`}>
        <img src={shot('demos', d.shot)} alt={`${d.name} concept demo`} loading="lazy" className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
        <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 scale-50 place-items-center rounded-full bg-fg text-bg opacity-0 shadow-xl transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-100">
          <ArrowUpRight size={24} />
        </span>
      </Link>
      <div className={cx('flex flex-1 flex-col px-2.5 pb-2.5 pt-5 sm:px-3', wide && 'lg:self-stretch lg:py-5 lg:pl-7 lg:pr-4')}>
        <div className="flex flex-wrap items-center gap-2"><ConceptBadge /><span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold">{d.style}</span></div>
        <h3 className={cx('mt-3 font-semibold tracking-tight', wide ? 'text-2xl md:text-[1.9rem]' : 'text-xl')}>{d.name} <span className="font-medium text-muted">- {d.type}</span></h3>
        <p className="mt-2 leading-relaxed text-muted">{d.description}</p>
        <ul className="mt-4 grid gap-1.5 text-[15px] sm:grid-cols-2">
          {d.demonstrates.map((x) => <li key={x} className="flex gap-2"><Check size={15} weight="bold" className="mt-1 shrink-0" />{x}</li>)}
        </ul>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
          <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link to={d.path} className="btn btn-primary btn-sm">View demo <ArrowRight size={14} weight="bold" /></Link>
            {d.admin && <Link to={d.admin} className="text-sm font-semibold underline-offset-4 hover:underline">Admin panel</Link>}
          </span>
          <Link to={`/contact?ref=${d.ref}`} className="text-sm font-semibold underline-offset-4 hover:underline">Want one? Let's talk</Link>
        </div>
      </div>
    </Reveal>
  );
}

// Real projects and concept demos in one grid. Each card keeps its own badge, and the key above the grid explains both.
function Examples() {
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all' ? CARDS : CARDS.filter((c) => c.group === filter);
  return (
    <section id="work" aria-labelledby="work-h" className={cx(shell, 'scroll-mt-24 py-20 md:py-32')}>
      <SectionHeading id="work-h" word="Examples" sub="Real projects and concept demos in one place. Every card says which it is.">Examples and demos</SectionHeading>
      <Reveal className="mt-10 grid max-w-3xl gap-3 rounded-2xl border border-dashed border-line p-4 text-[15px] leading-relaxed">
        <p className="grid gap-1.5 sm:grid-cols-[8.5rem_1fr] sm:gap-3">
          <span><RealBadge /></span>
          <span className="text-muted">Live sites you can open and click through, with the code on GitHub.</span>
        </p>
        <p className="grid gap-1.5 sm:grid-cols-[8.5rem_1fr] sm:gap-3">
          <span><ConceptBadge /></span>
          <span className="text-muted">Fictional businesses I designed and built as working demos. Names, people, prices and reviews are sample data, and nothing is really booked or paid.</span>
        </p>
      </Reveal>
      <div role="group" aria-label="Filter examples" className="mt-10 flex flex-wrap gap-2">
        {FILTERS.map(([id, label, n]) => {
          const on = filter === id;
          return (
            <button key={id} type="button" aria-pressed={on} onClick={() => setFilter(id)}
              className={cx('rounded-full border px-4 py-2 text-[15px] font-semibold transition-colors duration-300 active:translate-y-px', on ? 'border-fg bg-fg text-bg' : 'border-line bg-surface hover:border-fg')}>
              {label}<sup className={cx('ml-1 font-mono text-[11px] font-normal', on ? 'text-bg/65' : 'text-muted')}>[{n}]</sup>
            </button>
          );
        })}
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 md:gap-6">
        {visible.map(({ group, item, wide }, i) => (group === 'real'
          ? <ProjectCard key={item.slug} p={item} wide={wide} i={i} />
          : <DemoCard key={item.key} d={item} wide={wide} i={i} />))}
      </div>
    </section>
  );
}

// Big uppercase service rows. Hover (or tap) opens a row into a dark panel with a tilted screenshot.
function Services() {
  const [open, setOpen] = useState(0);
  const reduce = useReducedMotion();
  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  return (
    <section id="services" aria-labelledby="services-h" className={cx(shell, 'scroll-mt-24 py-20 md:py-32')}>
      <SectionHeading id="services-h" word="Services" sub="From a single booking site to a mobile app with its own back office.">What I build</SectionHeading>
      <ul className="mt-14">
        {SERVICES.map((s, i) => {
          const on = open === i;
          return (
            <li key={s.title} className="border-b border-line" onMouseEnter={() => canHover && setOpen(i)}>
              <button type="button" aria-expanded={on} onClick={() => setOpen(on && !canHover ? -1 : i)}
                className={cx('relative my-1.5 grid w-full grid-cols-[1fr_auto] items-center gap-x-6 rounded-[22px] px-4 py-6 text-left transition-colors duration-500 sm:px-7 md:py-8', on ? 'bg-fg text-bg' : 'hover:bg-sunken')}>
                <span className="relative z-10 text-[clamp(1.7rem,5.2vw,4.2rem)] font-medium uppercase leading-[0.95] tracking-[-0.025em]">{s.title.startsWith('iOS') ? <><span className="normal-case">i</span>{s.title.slice(1)}</> : s.title}</span>
                <span className="relative z-10 grid size-11 place-items-center">{on ? <X size={28} /> : <ArrowUpRight size={28} />}</span>
                <span className="col-span-2 grid w-full grid-cols-1 transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ gridTemplateRows: on ? '1fr' : '0fr' }}>
                  <span className="relative z-10 block min-h-0 overflow-hidden">
                    <span className="block w-full max-w-[44ch] pt-4 text-[17px] leading-relaxed opacity-75">{s.text}</span>
                  </span>
                </span>
                <span aria-hidden="true" className={cx('pointer-events-none absolute right-24 top-1/2 hidden -translate-y-1/2 lg:block', s.tall ? 'w-[150px]' : 'w-[min(30%,340px)]')}>
                  <motion.span className="block overflow-hidden rounded-xl border-4 border-bg bg-bg shadow-2xl"
                    initial={false}
                    animate={on ? { opacity: 1, scale: 1, rotate: reduce ? 0 : -5 } : { opacity: 0, scale: 0.8, rotate: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}>
                    <img src={shot(...s.shot)} alt="" loading="lazy" className={cx('block w-full object-cover object-top', s.tall ? 'aspect-[390/760]' : 'aspect-[16/10]')} />
                  </motion.span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// Inverted band. A preview follows the pointer across the rows on devices with a mouse.
function Process() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(-1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28 });
  const sy = useSpring(y, { stiffness: 260, damping: 28 });
  function move(e) {
    const r = ref.current.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  }
  return (
    <section aria-labelledby="process-h" className="bg-fg text-bg">
      <div className={cx(shell, 'py-20 md:py-32')}>
        <SectionHeading id="process-h" word="Process" invert sub="Four steps, with a fixed quote before any build starts.">How I work</SectionHeading>
        <ol ref={ref} className="relative mt-14" onPointerMove={move} onPointerLeave={() => setActive(-1)}>
          {PROCESS.map((p, i) => (
            <Reveal as="li" key={p.verb} delay={i * 0.05} className="border-b border-bg/15 first:border-t">
              <div onPointerEnter={() => setActive(i)} className="grid gap-2 py-7 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-3 md:grid-cols-[13rem_1fr_auto] md:items-center md:gap-10">
                <p className="text-3xl font-semibold tracking-tight md:text-4xl">{p.verb}</p>
                <p className="leading-relaxed text-bg/60">{p.text}</p>
                <p className="text-bg/80 md:text-right">{p.gives}</p>
              </div>
            </Reveal>
          ))}
          {!reduce && (
            <motion.div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-10 hidden md:block" style={{ x: sx, y: sy }}>
              <div className="-translate-x-1/2 -translate-y-1/2">
                <motion.div className="relative h-36 w-56 overflow-hidden rounded-xl border-4 border-bg/90 bg-bg shadow-2xl"
                  initial={false}
                  animate={active >= 0 ? { opacity: 1, scale: 1, rotate: -4 } : { opacity: 0, scale: 0.6, rotate: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}>
                  {PROCESS.map((p, i) => (
                    <img key={p.verb} src={p.shot ? shot(...p.shot) : avatar()} alt="" loading="lazy"
                      className={cx('absolute inset-0 size-full object-cover transition-opacity duration-300', p.shot ? 'object-top' : 'object-center', active === i ? 'opacity-100' : 'opacity-0')} />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </ol>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contact" aria-labelledby="contact-h" className={cx(shell, 'scroll-mt-24 py-20 md:py-32')}>
      <Reveal className="flex flex-col items-center text-center">
        <Available />
        <h2 id="contact-h" className="mt-8 max-w-[14ch] text-[clamp(2.6rem,7.5vw,6rem)] font-bold uppercase leading-[0.95] tracking-[-0.035em]">Have a project in mind?</h2>
        <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted">Tell me what you need. The form opens your email app with the message ready to send, and I reply by email.</p>
      </Reveal>
      <Reveal delay={0.08} className="mx-auto mt-12 max-w-3xl"><ContactForm /></Reveal>
      <Reveal delay={0.12} className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
        <span className="inline-flex items-center gap-2.5 rounded-full bg-fg py-1.5 pl-1.5 pr-4 font-semibold text-bg">
          <img src={avatar()} alt="" width="32" height="32" className="size-8 rounded-full object-cover" /> {SITE.name}
        </span>
        <SocialPills />
      </Reveal>
    </section>
  );
}

export default function Home() {
  useEffect(() => { document.title = 'Dhruv Kaith | Full-stack developer'; }, []);
  return (
    <>
      <Hero />
      <Examples />
      <Services />
      <Process />
      <ContactSection />
    </>
  );
}
