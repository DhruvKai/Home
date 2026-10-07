import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, GithubLogo, Info } from '@phosphor-icons/react';
import { work } from '../data/work';
import { shot } from '../lib/asset';
import { RealBadge, Reveal, Shot } from './ui';
import NotFound from './NotFound';

export default function WorkDetail() {
  const { slug } = useParams();
  const i = work.findIndex((w) => w.slug === slug);
  const p = work[i];
  useEffect(() => { if (p) document.title = `${p.name} | Dhruv Kaith`; }, [p]);
  if (!p) return <NotFound />;
  const next = work[(i + 1) % work.length];

  return (
    <article className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
      <Link to="/#work" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:border-fg"><ArrowLeft size={14} weight="bold" /> Back</Link>

      <header className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <RealBadge />
          <h1 className="mt-5 text-[clamp(3rem,9vw,7.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.04em]">{p.name}</h1>
          <p className="mt-3 text-lg font-medium text-muted">/{p.kind}</p>
          <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-muted">{p.summary}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            <a href={p.live} target="_blank" rel="noreferrer" className="btn btn-primary">{p.liveLabel} <ArrowUpRight size={16} weight="bold" /></a>
            <a href={p.github} target="_blank" rel="noreferrer" className="btn btn-ghost"><GithubLogo size={18} /> GitHub</a>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-10 gap-y-5 lg:grid-cols-1 lg:text-right">
          <div><dt className="text-sm text-muted">Live</dt><dd className="mt-1 text-lg font-semibold">{p.liveLabel}</dd></div>
          <div><dt className="text-sm text-muted">Built with</dt><dd className="mt-1 text-lg font-semibold">{p.stack[0][1].slice(0, 2).join(', ')}</dd></div>
        </dl>
      </header>

      <Reveal className="mt-12 grid gap-4 rounded-[28px] border border-line bg-surface p-3 md:grid-cols-[1fr_auto] md:p-4">
        <Shot src={shot('work', p.shots.main)} alt={`${p.name}, main screen`} eager className="rounded-[20px]" />
        {p.shots.mobile && (
          <div className="mx-auto w-[220px] self-center overflow-hidden rounded-[26px] border-[6px] border-fg bg-fg md:w-[240px]" style={{ aspectRatio: '390/800' }}>
            <img src={shot('work', p.shots.mobile)} alt={`${p.name} on mobile`} className="size-full rounded-[20px] object-cover object-top" />
          </div>
        )}
      </Reveal>
      {p.shots.admin && (
        <Reveal className="mt-4 rounded-[28px] border border-line bg-surface p-3 md:p-4"><Shot src={shot('work', p.shots.admin)} alt={`${p.name} admin`} className="rounded-[20px]" /></Reveal>
      )}

      <div className="mt-16 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <section>
          <h2 className="text-3xl font-medium uppercase tracking-[-0.02em]"><span className="text-fg/35">/</span>What it does</h2>
          <ul className="mt-6 grid gap-3">
            {p.features.map((f) => (
              <li key={f} className="flex gap-3 leading-relaxed"><Check size={18} weight="bold" className="mt-1 shrink-0" />{f}</li>
            ))}
          </ul>
          {p.notes.map((n) => (
            <p key={n} className="mt-6 flex gap-3 rounded-2xl border border-dashed border-line p-4 text-[15px] leading-relaxed text-muted">
              <Info size={18} className="mt-0.5 shrink-0 text-fg" />{n}
            </p>
          ))}
        </section>
        <section>
          <h2 className="text-3xl font-medium uppercase tracking-[-0.02em]"><span className="text-fg/35">/</span>Stack</h2>
          <dl className="mt-6 grid gap-5">
            {p.stack.map(([group, items]) => (
              <div key={group}>
                <dt className="text-sm font-semibold text-muted">{group}</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">{items.map((t) => <span key={t} className="rounded-full border border-line bg-surface px-3 py-1 text-sm">{t}</span>)}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <div className="mt-20 flex flex-col gap-6 border-t border-line pt-10 sm:flex-row sm:items-end sm:justify-between">
        <Link to={`/work/${next.slug}`} className="group">
          <span className="text-sm text-muted">Next project</span>
          <span className="mt-1 flex items-center gap-3 text-[clamp(2rem,5vw,3.5rem)] font-extrabold uppercase leading-none tracking-[-0.03em]">{next.name}<ArrowRight size={32} className="transition-transform duration-300 group-hover:translate-x-2" /></span>
        </Link>
        <Link to="/#contact" className="btn btn-primary self-start sm:self-auto">Let's talk <ArrowUpRight size={16} weight="bold" /></Link>
      </div>
    </article>
  );
}
