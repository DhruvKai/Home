import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Desktop, GithubLogo, List, Moon, Sun, X } from '@phosphor-icons/react';
import { getTheme, setTheme } from '../lib/theme';
import { SITE, CONTACT_EMAIL } from '../config';

const LINKS = [
  ['Work', '/#work'],
  ['Concepts', '/#concepts'],
  ['Apps', '/#applications'],
  ['Services', '/#services'],
];

function ThemeToggle() {
  const [t, setT] = useState(getTheme);
  const next = { system: 'light', light: 'dark', dark: 'system' }[t];
  const Icon = { system: Desktop, light: Sun, dark: Moon }[t];
  return (
    <button
      onClick={() => { setTheme(next); setT(next); }}
      className="grid size-9 place-items-center rounded-full text-muted hover:bg-sunken hover:text-fg"
      aria-label={`Theme: ${t}. Switch to ${next}`}
      title={`Theme: ${t}`}
    >
      <Icon size={18} />
    </button>
  );
}

export default function PortfolioLayout() {
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();
  useEffect(() => setOpen(false), [pathname, hash]);

  return (
    <div className="surface-root flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">Skip to content</a>
      <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/85 backdrop-blur-md">
        <div className="wrap flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-[13px] font-bold text-on-accent">DK</span>
            <span>Dhruv Kaith</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {LINKS.map(([label, to]) => (
              <Link key={to} to={to} className="rounded-full px-3 py-2 text-sm text-muted hover:text-fg">{label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link to="/#contact" className="btn btn-primary btn-sm hidden sm:inline-flex">Start a project</Link>
            <button className="grid size-9 place-items-center rounded-full hover:bg-sunken md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
              {open ? <X size={20} /> : <List size={20} />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="wrap grid gap-1 border-t border-line pb-4 pt-2 md:hidden" aria-label="Mobile">
            {LINKS.map(([label, to]) => (
              <Link key={to} to={to} className="rounded-lg px-2 py-2.5 text-[15px]">{label}</Link>
            ))}
            <Link to="/#contact" className="btn btn-primary mt-2">Start a project</Link>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="wrap flex flex-col gap-6 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-fg">{SITE.name}</p>
            <p className="mt-1">Websites, web apps and iOS and Android apps for businesses.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href={SITE.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-fg"><GithubLogo size={16} /> GitHub</a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-fg">{CONTACT_EMAIL}</a>
            <NavLink to="/credits" className="hover:text-fg">Photo credits</NavLink>
            <span>&copy; {new Date().getFullYear()} {SITE.name}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
