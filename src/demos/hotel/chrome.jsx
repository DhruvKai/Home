import { useState } from 'react';
import { Link } from 'react-router-dom';
import { List, X } from '@phosphor-icons/react';

const NAV = [['Rooms', '/demos/hotel#rooms'], ['Experiences', '/demos/hotel#experiences'], ['Gallery', '/demos/hotel#gallery'], ['Location', '/demos/hotel#location']];

function Mark() {
  return (
    <Link to="/demos/hotel" className="font-display text-2xl font-semibold tracking-tight">
      Alpine House
    </Link>
  );
}

export function HotelHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky z-30 border-b border-line bg-bg/92 backdrop-blur-md" style={{ top: 'var(--bar-h, 0px)' }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Mark />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(([l, to]) => <Link key={l} to={to} className="px-3 py-2 text-sm text-muted hover:text-fg">{l}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/demos/hotel#enquire" className="btn btn-primary btn-sm">Book a stay</Link>
          <button className="grid size-9 place-items-center rounded-full hover:bg-sunken md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X size={20} /> : <List size={20} />}</button>
        </div>
      </div>
      {open && (
        <nav className="grid gap-1 border-t border-line px-4 pb-4 pt-2 md:hidden">
          {NAV.map(([l, to]) => <Link key={l} to={to} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5">{l}</Link>)}
        </nav>
      )}
    </header>
  );
}

export function HotelFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <Mark />
          <p className="mt-2 text-sm text-muted">North shore of Lake Verran, Riverton Valley. A fictional hotel.</p>
        </div>
        <nav className="flex flex-wrap gap-5 text-sm text-muted">
          {NAV.map(([l, to]) => <Link key={l} to={to} className="hover:text-fg">{l}</Link>)}
        </nav>
      </div>
    </footer>
  );
}
