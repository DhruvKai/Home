import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight, ArrowUpRight, Browsers, Check, DeviceMobile, GithubLogo, Info, ShieldCheck, Storefront, SquaresFour, Code,
} from '@phosphor-icons/react';
import { work, tools } from '../data/work';
import { demos, applications } from '../data/demos';
import { shot } from '../lib/asset';
import { Reveal, RealBadge, ConceptBadge, Shot } from './ui';
import ContactForm from './ContactForm';

function Hero() {
  const reduce = useReducedMotion();
  const enter = (d) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: d, ease: [0.16, 1, 0.3, 1] },
  });
  return (
    <section className="wrap grid items-center gap-12 pb-16 pt-12 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:pb-24">
      <div>
        <motion.h1 {...enter(0)} className="max-w-[16ch] text-4xl font-semibold leading-[1.05] tracking-tighter md:text-5xl lg:text-6xl">
          Full-stack developer with a security background.
        </motion.h1>
        <motion.p {...enter(0.08)} className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted">
          I build websites, web apps and iOS and Android apps for businesses, with security designed in from the start.
        </motion.p>
        <motion.div {...enter(0.16)} className="mt-8 flex flex-wrap gap-3">
          <Link to="/#contact" className="btn btn-primary">Start a project <ArrowRight size={16} weight="bold" /></Link>
          <Link to="/#work" className="btn btn-ghost">See real work</Link>
        </motion.div>
      </div>

      <motion.div {...enter(0.2)} className="relative mx-auto w-full max-w-[640px] pb-10 pr-6 sm:pr-12">
        <Shot src={shot('work', 'dtours')} alt="Dtours trek-booking site, home page" ratio="16/10" eager className="shadow-[0_30px_60px_-30px_rgb(18_22_20/0.35)]" />
        <div className="absolute -bottom-2 right-0 w-[30%] min-w-[110px] overflow-hidden rounded-[22px] border-[5px] border-fg bg-fg shadow-[0_24px_48px_-20px_rgb(18_22_20/0.5)]" style={{ aspectRatio: '390/760' }}>
          <img src={shot('work', 'overhere-mobile')} alt="Overhere app on a phone" className="size-full rounded-[17px] object-cover object-top" />
        </div>
      </motion.div>
    </section>
  );
}

function WorkLinks({ p, compact }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link to={`/work/${p.slug}`} className="btn btn-primary btn-sm">View project <ArrowRight size={14} weight="bold" /></Link>
      <a href={p.live} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">{compact ? 'Live' : 'Live site'} <ArrowUpRight size={14} /></a>
      <a href={p.github} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" aria-label={`${p.name} on GitHub`}><GithubLogo size={16} /> GitHub</a>
    </div>
  );
}

function SelectedWork() {
  const [lead, ...rest] = work;
  return (
    <section id="work" className="wrap scroll-mt-20 py-16 md:py-24">
      <Reveal>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Selected work</h2>
        <p className="mt-3 max-w-[60ch] text-muted">Real projects I designed and built, live and on GitHub.</p>
      </Reveal>

      <Reveal className="card mt-10 grid gap-8 overflow-hidden p-5 md:p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div className="relative pb-6 pr-10 sm:pr-16">
          <Shot src={shot('work', lead.shots.main)} alt={`${lead.name} website`} />
          <div className="absolute bottom-0 right-0 w-[26%] min-w-[90px] overflow-hidden rounded-[18px] border-4 border-fg bg-fg" style={{ aspectRatio: '390/760' }}>
            <img src={shot('work', lead.shots.mobile)} alt={`${lead.name} on mobile`} loading="lazy" className="size-full rounded-[14px] object-cover object-top" />
          </div>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2"><RealBadge /><span className="text-sm text-muted">{lead.kind}</span></div>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{lead.name}</h3>
          <p className="mt-3 leading-relaxed text-muted">{lead.summary}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {['Vanilla JS PWA', 'Supabase', 'Postgres RLS', 'Twilio Verify', 'AWS Rekognition', 'Leaflet'].map((t) => <span key={t} className="chip">{t}</span>)}
          </div>
          <div className="mt-6"><WorkLinks p={lead} /></div>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {rest.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.06} className="card flex flex-col p-5 md:p-6">
            <Shot src={shot('work', p.shots.main)} alt={`${p.name} website`} />
            <div className="mt-5 flex flex-wrap items-center gap-2"><RealBadge /><span className="text-sm text-muted">{p.kind}</span></div>
            <h3 className="mt-3 text-xl font-semibold tracking-tight">{p.name}</h3>
            <p className="mt-2 flex-1 leading-relaxed text-muted">{p.summary}</p>
            <div className="mt-5"><WorkLinks p={p} compact /></div>
          </Reveal>
        ))}
      </div>

      <div className="mt-16">
        <h3 className="text-xl font-semibold tracking-tight">Software and tools</h3>
        <p className="mt-2 text-muted">Security and desktop tools. Code on GitHub.</p>
        <div className="mt-6 grid gap-x-10 gap-y-2 md:grid-cols-2">
          {tools.map((t) => (
            <a key={t.name} href={t.github} target="_blank" rel="noreferrer"
              className="group flex gap-4 rounded-2xl p-4 -mx-4 transition-colors hover:bg-surface">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sunken text-muted group-hover:text-accent-ink"><Code size={20} /></span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-semibold">{t.name}<ArrowUpRight size={14} className="text-muted" /></span>
                <span className="mt-1 block text-[15px] leading-relaxed text-muted">{t.blurb}</span>
                <span className="mt-2 block font-mono text-xs text-muted">{t.tech.join(' / ')}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoCard({ d, i }) {
  return (
    <Reveal delay={(i % 2) * 0.06} className="card flex flex-col overflow-hidden">
      <Link to={d.path} className="group block overflow-hidden border-b border-line" aria-label={`Open the ${d.name} demo`}>
        <div className="aspect-[16/10] overflow-hidden bg-sunken">
          <img src={shot('demos', d.shot)} alt={`${d.name} concept demo`} loading="lazy" className="size-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]" />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2"><ConceptBadge /><span className="text-sm text-muted">{d.type}</span></div>
        <h3 className="mt-3 text-xl font-semibold tracking-tight">{d.name}</h3>
        <p className="mt-2 leading-relaxed text-muted">{d.description}</p>
        <p className="mt-5 text-sm font-semibold">What this demonstrates</p>
        <ul className="mt-2 grid gap-1.5 text-[15px] sm:grid-cols-2">
          {d.demonstrates.map((x) => (
            <li key={x} className="flex gap-2"><Check size={16} weight="bold" className="mt-1 shrink-0 text-accent" />{x}</li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-1.5">{d.tech.map((t) => <span key={t} className="chip">{t}</span>)}</div>
        <div className="mt-auto pt-6">
          <Link to={d.path} className="btn btn-primary btn-sm">View demo <ArrowRight size={14} weight="bold" /></Link>
          <p className="mt-4 border-t border-line pt-4 text-sm text-muted">
            {d.ask}{' '}
            <Link to={`/contact?ref=${d.ref}`} className="font-semibold text-accent-ink underline-offset-4 hover:underline">Start a project</Link>
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function Concepts() {
  return (
    <section id="concepts" className="scroll-mt-16 border-y border-line bg-sunken">
      <div className="wrap py-16 md:py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-ink">Concept demos</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">More than just a portfolio.</h2>
          <p className="mt-3 max-w-[60ch] text-lg text-muted">Here are a few examples of what I can build for different types of businesses.</p>
        </Reveal>
        <Reveal className="mt-8 flex gap-3 rounded-2xl border border-line bg-surface p-4 text-[15px] leading-relaxed">
          <Info size={20} className="mt-0.5 shrink-0 text-accent-ink" />
          <p>
            <strong className="font-semibold">These are fictional businesses.</strong>{' '}
            <span className="text-muted">I designed and built each one as a working demo you can click through. Names, people, prices and reviews are sample data, and nothing is really booked or paid.</span>
          </p>
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {demos.map((d, i) => <DemoCard key={d.key} d={d} i={i} />)}
        </div>
      </div>
    </section>
  );
}

function Applications() {
  const { lead, more } = applications;
  return (
    <section id="applications" className="wrap scroll-mt-20 py-16 md:py-24">
      <Reveal>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Applications built around a workflow</h2>
        <p className="mt-3 max-w-[60ch] text-muted">Internal software and admin panels, also fictional and fully clickable.</p>
      </Reveal>

      <Reveal className="mt-10 overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="grid lg:grid-cols-[1.35fr_1fr]">
          <Link to={lead.path} className="group block bg-sunken p-4 md:p-6" aria-label={`Open the ${lead.name} demo`}>
            <Shot src={shot('demos', lead.shot)} alt={`${lead.name} dashboard`} className="transition-transform duration-700 ease-out group-hover:scale-[1.01]" />
          </Link>
          <div className="flex flex-col p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2"><ConceptBadge /><span className="text-sm text-muted">{lead.type}</span></div>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">{lead.name}</h3>
            <p className="mt-2 leading-relaxed text-muted">{lead.description}</p>
            <ul className="mt-5 grid gap-1.5 text-[15px] sm:grid-cols-2">
              {lead.demonstrates.map((x) => <li key={x} className="flex gap-2"><Check size={16} weight="bold" className="mt-1 shrink-0 text-accent" />{x}</li>)}
            </ul>
            <div className="mt-4 flex flex-wrap gap-1.5">{lead.tech.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            <div className="mt-auto pt-6">
              <Link to={lead.path} className="btn btn-primary btn-sm">View demo <ArrowRight size={14} weight="bold" /></Link>
              <p className="mt-4 border-t border-line pt-4 text-sm text-muted">
                {lead.ask}{' '}
                <Link to={`/contact?ref=${lead.ref}`} className="font-semibold text-accent-ink underline-offset-4 hover:underline">Start a project</Link>
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {more.map((m, i) => (
          <Reveal key={m.key} delay={i * 0.06}>
            <Link to={m.path} className="group grid grid-cols-[120px_1fr] items-center gap-5 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-fg/30 sm:grid-cols-[180px_1fr]">
              <div className="aspect-[16/10] overflow-hidden rounded-lg border border-line bg-sunken">
                <img src={shot('demos', m.shot)} alt="" loading="lazy" className="size-full object-cover object-top" />
              </div>
              <div>
                <p className="flex items-center gap-2 font-semibold">{m.name} <ArrowRight size={14} className="text-muted transition-transform group-hover:translate-x-0.5" /></p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{m.description}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const SERVICES = [
  [Browsers, 'Business websites', 'Fast, mobile-first sites for clinics, hotels, restaurants and shops, with booking, ordering or enquiry flows built in.'],
  [SquaresFour, 'Web apps and dashboards', 'Internal tools, admin panels and customer portals with accounts, roles, records and reports.'],
  [DeviceMobile, 'iOS and Android apps', 'Cross-platform mobile apps from one codebase with React Native and Expo, ready for the App Store and Google Play.'],
  [Storefront, 'Online stores', 'Catalogue, variants, checkout and an admin for orders and stock, as a custom build or on a platform like Shopify.'],
  [ShieldCheck, 'Security built in', 'Secure sign-in, locked-down data access, bot protection and a security review before launch.'],
];

const PROCESS = [
  ['Talk', 'A short call to understand your business and what the software needs to do.'],
  ['Plan', 'A written scope, timeline and fixed quote, so you know what you get.'],
  ['Build', 'Regular previews on a live link, so you can click through it as it grows.'],
  ['Launch', 'Deployment, handover and support after launch.'],
];

function Services() {
  return (
    <section id="services" className="scroll-mt-16 border-t border-line">
      <div className="wrap py-16 md:py-24">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">What I build</h2>
          <p className="mt-3 max-w-[60ch] text-muted">From a single booking site to a mobile app with its own back office.</p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {SERVICES.map(([Icon, title, text], i) => (
            <Reveal key={title} delay={(i % 3) * 0.05}
              className={`rounded-2xl p-6 ${i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'} ${i === 2 ? 'bg-accent text-on-accent' : 'border border-line bg-surface'}`}>
              <Icon size={26} className={i === 2 ? '' : 'text-accent-ink'} />
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
              <p className={`mt-2 leading-relaxed ${i === 2 ? 'opacity-90' : 'text-muted'}`}>{text}</p>
            </Reveal>
          ))}
        </div>

        <h3 className="mt-20 text-xl font-semibold tracking-tight">How I work</h3>
        <ol className="mt-6 grid gap-8 md:grid-cols-4 md:gap-6">
          {PROCESS.map(([verb, text], i) => (
            <Reveal as="li" key={verb} delay={i * 0.05} className="border-t-2 border-fg pt-4">
              <p className="text-2xl font-semibold tracking-tight">{verb}</p>
              <p className="mt-2 leading-relaxed text-muted">{text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-16 border-t border-line bg-sunken">
      <div className="wrap grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Tell me about your project.</h2>
          <p className="mt-4 max-w-[44ch] text-lg leading-relaxed text-muted">
            A few details are enough to start. The form opens your email app with the message ready to send, and I reply by email.
          </p>
        </Reveal>
        <Reveal delay={0.06}><ContactForm /></Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  useEffect(() => { document.title = 'Dhruv Kaith | Full-stack developer'; }, []);
  return (
    <>
      <Hero />
      <SelectedWork />
      <Concepts />
      <Applications />
      <Services />
      <ContactSection />
    </>
  );
}
