import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle, EnvelopeSimple, Flask, GithubLogo, LinkedinLogo } from '@phosphor-icons/react';
import { CONTACT_EMAIL, SITE } from '../config';
import { asset } from '../lib/asset';
import { cx } from '../lib/format';

export const EASE = [0.16, 1, 0.3, 1];

export function Reveal({ children, delay = 0, className, as = 'div', ...rest }) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M
      {...rest}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}

// "/EXAMPLE PROJECTS" style heading with a large faded word behind it.
export function SectionHeading({ id, word, children, sub, invert, className }) {
  const reduce = useReducedMotion();
  return (
    <div className={cx('relative', className)}>
      <motion.p
        aria-hidden="true"
        className={cx('pointer-events-none absolute -top-[0.45em] left-0 select-none whitespace-nowrap text-[clamp(3.5rem,13vw,11rem)] font-extrabold uppercase leading-none tracking-[0.04em]', invert ? 'text-bg/[0.06]' : 'text-fg/[0.05]')}
        initial={reduce ? false : { opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        {word}
      </motion.p>
      <motion.h2
        id={id}
        className="relative text-[clamp(2.1rem,5vw,3.6rem)] font-medium uppercase leading-[1.05] tracking-[-0.02em]"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
      >
        <span className={invert ? 'text-bg/40' : 'text-fg/35'}>/</span>{children}
      </motion.h2>
      {sub && <p className={cx('relative mt-4 max-w-[58ch] text-lg leading-relaxed', invert ? 'text-bg/65' : 'text-muted')}>{sub}</p>}
    </div>
  );
}

// Live availability flag. The only coloured dot on the portfolio.
export function Available({ className, short }) {
  return (
    <span className={cx('inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium shadow-[0_8px_24px_-14px_rgb(21_21_21/0.35)]', className)}>
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex size-2.5 rounded-full bg-live" />
      </span>
      {short ? <span className="sr-only">Available for new projects</span> : 'Available for new projects'}
    </span>
  );
}

export const portrait = (w) => asset(`me/portrait-${w}.webp`);
export const avatar = () => asset('me/avatar.webp');

export const SOCIAL = [
  SITE.github && ['GitHub', SITE.github, GithubLogo],
  SITE.linkedin && ['LinkedIn', SITE.linkedin, LinkedinLogo],
  ['Email', `mailto:${CONTACT_EMAIL}`, EnvelopeSimple],
].filter(Boolean);

// Pill links to GitHub, LinkedIn and email. `vertical` stacks them like the hero.
export function SocialPills({ className, vertical, size = 'md' }) {
  return (
    <ul className={cx('flex gap-2.5', vertical ? 'flex-col items-end' : 'flex-wrap', className)}>
      {SOCIAL.map(([label, href, Icon]) => (
        <li key={label}>
          <a
            href={href}
            {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
            className={cx(
              'group inline-flex items-center gap-2 rounded-full border border-line bg-surface font-semibold shadow-[0_10px_24px_-16px_rgb(21_21_21/0.4)] transition-[transform,background-color,color,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-fg hover:bg-fg hover:text-bg active:translate-y-0',
              size === 'sm' ? 'px-3.5 py-2 text-sm' : 'px-4.5 py-2.5 text-[15px]',
            )}
          >
            <Icon size={size === 'sm' ? 16 : 18} weight="bold" className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

// Real projects only.
export function RealBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-fg px-2.5 py-1 text-xs font-semibold text-bg">
      <CheckCircle size={14} weight="fill" /> Real project
    </span>
  );
}

// Concept demos only.
export function ConceptBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted/60 px-2.5 py-1 text-xs font-semibold text-muted">
      <Flask size={14} /> Concept Demo
    </span>
  );
}

// Screenshot in a light frame. `ratio` keeps layout stable before the image loads.
export function Shot({ src, alt, ratio = '16/10', className, eager }) {
  return (
    <div className={cx('overflow-hidden rounded-xl border border-line bg-sunken', className)} style={{ aspectRatio: ratio }}>
      <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className="size-full object-cover object-top" />
    </div>
  );
}
