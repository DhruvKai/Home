import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Desktop, List, Moon, Sun, X } from '@phosphor-icons/react';
import { getTheme, setTheme } from '../lib/theme';
import { SITE } from '../config';
import { work } from '../data/work';
import { demos } from '../data/demos';
import { SERVICES } from '../data/services';
import { Available, SocialPills, avatar } from './ui';

const LINKS = [
  ['Examples', '/#work', work.length],
  ['Concepts', '/#concepts', demos.length],
  ['Services', '/#services', SERVICES.length],
  ['Contact', '/#contact'],
];

function ThemeToggle() {
  const [t, setT] = useState(getTheme);
  const next = { system: 'light', light: 'dark', dark: 'system' }[t];
  const Icon = { system: Desktop, light: Sun, dark: Moon }[t];
  return (
    <button
      onClick={() => { setTheme(next); setT(next); }}
      className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-fg"
      aria-label={`Theme: ${t}. Switch to ${next}`}
      title={`Theme: ${t}`}
    >
      <Icon size={18} />
    </button>
  );
}

// Fixed film grain over the portfolio pages. Pointer-events none, never on a scrolling element.
function Grain() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] opacity-[0.04]"
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
  );
}

export default function PortfolioLayout() {
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();
  useEffect(() => setOpen(false), [pathname, hash]);

  return (
    <div className="surface-root flex flex-col">
      <Grain />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">Skip to content</a>
      <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight" aria-label={`${SITE.name}, home`}>
              <img src={avatar()} alt="" width="36" height="36" className="size-9 rounded-full border border-line object-cover" />
              <span className="whitespace-nowrap lg:hidden">{SITE.name}</span>
            </Link>
            <span className="hidden lg:inline-flex"><Available /></span>
          </div>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {LINKS.map(([label, to, n]) => (
              <Link key={to} to={to} className="rounded-full px-3.5 py-2 text-[15px] font-medium text-fg/80 transition-colors hover:text-fg">
                {label}{n != null && <sup className="ml-0.5 font-mono text-[11px] font-normal text-muted">[{n}]</sup>}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link to="/#contact" className="btn btn-primary btn-sm hidden sm:inline-flex">Let's talk <ArrowUpRight size={15} weight="bold" /></Link>
            <button className="grid size-10 place-items-center rounded-full hover:bg-sunken md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
              {open ? <X size={20} /> : <List size={20} />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="mx-auto grid max-w-[1400px] gap-1 border-t border-line px-4 pb-5 pt-3 md:hidden" aria-label="Mobile">
            <Available className="mb-2 justify-self-start" />
            {LINKS.map(([label, to, n]) => (
              <Link key={to} to={to} className="flex items-baseline justify-between rounded-lg px-2 py-3 text-2xl font-semibold tracking-tight">
                {label}{n != null && <span className="font-mono text-sm font-normal text-muted">[{n}]</span>}
              </Link>
            ))}
            <Link to="/#contact" className="btn btn-primary mt-3">Let's talk <ArrowUpRight size={16} weight="bold" /></Link>
          </nav>
        )}
      </header>

      <main id="main" className="relative flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-12 md:grid-cols-[1fr_auto] md:items-center md:px-8">
          <div className="flex items-center gap-4">
            <img src={avatar()} alt="" width="56" height="56" className="size-14 rounded-full border border-line object-cover" />
            <div>
              <p className="text-lg font-bold tracking-tight">{SITE.name}</p>
              <p className="text-sm text-muted">Websites, web apps and iOS and Android apps for businesses.</p>
            </div>
          </div>
          <SocialPills size="sm" />
        </div>
        <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-3 border-t border-line px-4 py-5 text-sm text-muted md:px-8">
          <span>&copy; {new Date().getFullYear()} {SITE.name}</span>
          <NavLink to="/credits" className="hover:text-fg">Photo credits</NavLink>
        </div>
      </footer>
    </div>
  );
}
