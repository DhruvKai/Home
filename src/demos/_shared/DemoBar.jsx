import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';

// Sticky label shown on every demo route. Neutral styling so it reads the same on every demo theme.
export default function DemoBar({ projectRef }) {
  const el = useRef(null);

  // Publish the bar height so sticky demo headers can sit right under it.
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const set = () => document.documentElement.style.setProperty('--bar-h', `${node.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(node);
    return () => { ro.disconnect(); document.documentElement.style.removeProperty('--bar-h'); };
  }, []);

  return (
    <div
      ref={el}
      data-demo-bar
      className="sticky top-0 z-40 border-b border-white/10 bg-[#151816] text-[#eef1ef]"
      style={{ fontFamily: "'Geist Variable', system-ui, sans-serif" }}
    >
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-3 py-2 text-[13px] sm:px-5">
        <p className="flex items-center gap-2 font-semibold">
          <span className="rounded-full border border-dashed border-white/40 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">Concept Demo — Fictional Business</span>
          <span className="hidden text-white/65 md:inline">Built by Dhruv Kaith</span>
        </p>
        <nav className="flex items-center gap-1.5">
          <Link to="/#work" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-white/80 hover:bg-white/10 hover:text-white">
            <ArrowLeft size={14} weight="bold" /> Portfolio
          </Link>
          <Link to={`/contact?ref=${projectRef}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#eef1ef] px-3 py-1 font-semibold text-[#151816] hover:bg-white">
            Start a project like this <ArrowRight size={14} weight="bold" />
          </Link>
        </nav>
      </div>
    </div>
  );
}
