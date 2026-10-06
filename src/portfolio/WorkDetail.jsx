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
    <article className="wrap py-10 md:py-16">
      <Link to="/#work" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeft size={14} /> Selected work</Link>

      <header className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2"><RealBadge /><span className="text-sm text-muted">{p.kind}</span></div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tighter md:text-5xl">{p.name}</h1>
          <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-muted">{p.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={p.live} target="_blank" rel="noreferrer" className="btn btn-primary">{p.liveLabel} <ArrowUpRight size={16} /></a>
          <a href={p.github} target="_blank" rel="noreferrer" className="btn btn-ghost"><GithubLogo size={18} /> GitHub</a>
        </div>
      </header>

      <Reveal className="mt-10 grid gap-4 md:grid-cols-[1fr_auto]">
        <Shot src={shot('work', p.shots.main)} alt={`${p.name}, main screen`} eager />
        {p.shots.mobile && (
          <div className="mx-auto w-[220px] overflow-hidden rounded-[26px] border-[6px] border-fg bg-fg md:w-[240px]" style={{ aspectRatio: '390/800' }}>
            <img src={shot('work', p.shots.mobile)} alt={`${p.name} on mobile`} className="size-full rounded-[20px] object-cover object-top" />
          </div>
        )}
      </Reveal>
      {p.shots.admin && (
        <Reveal className="mt-4"><Shot src={shot('work', p.shots.admin)} alt={`${p.name} admin`} /></Reveal>
      )}

      <div className="mt-14 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">What it does</h2>
          <ul className="mt-5 grid gap-3">
            {p.features.map((f) => (
              <li key={f} className="flex gap-3 leading-relaxed"><Check size={18} weight="bold" className="mt-1 shrink-0 text-accent" />{f}</li>
            ))}
          </ul>
          {p.notes.map((n) => (
            <p key={n} className="mt-6 flex gap-3 rounded-2xl border border-line bg-surface p-4 text-[15px] leading-relaxed text-muted">
              <Info size={18} className="mt-0.5 shrink-0 text-fg" />{n}
            </p>
          ))}
        </section>
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">Stack</h2>
          <dl className="mt-5 grid gap-5">
            {p.stack.map(([group, items]) => (
              <div key={group}>
                <dt className="text-sm font-semibold text-muted">{group}</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">{items.map((t) => <span key={t} className="chip text-fg">{t}</span>)}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <Link to={`/work/${next.slug}`} className="group">
          <span className="text-sm text-muted">Next project</span>
          <span className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight">{next.name}<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></span>
        </Link>
        <Link to="/#contact" className="btn btn-primary self-start sm:self-auto">Start a project</Link>
      </div>
    </article>
  );
}
