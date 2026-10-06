import { useMemo, useState } from 'react';
import { Copy, EnvelopeSimple, Check } from '@phosphor-icons/react';
import { CONTACT_EMAIL } from '../config';
import { BUSINESS_TYPES } from '../data/demos';

const BUDGETS = ['Not sure yet', 'Under ₹50,000', '₹50,000 to ₹1.5 lakh', '₹1.5 lakh to ₹4 lakh', 'Over ₹4 lakh'];

export default function ContactForm({ initialRef }) {
  const validRef = BUSINESS_TYPES.some(([k]) => k === initialRef) ? initialRef : '';
  const [v, setV] = useState({ name: '', email: '', type: validRef, budget: BUDGETS[0], message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const typeLabel = BUSINESS_TYPES.find(([k]) => k === v.type)?.[1] ?? 'Not specified';
  const body = useMemo(
    () => `Hi Dhruv,\n\n${v.message}\n\nBusiness type: ${typeLabel}\nBudget: ${v.budget}\n\n${v.name}\n${v.email}`,
    [v, typeLabel],
  );
  const subject = `Project enquiry: ${typeLabel}${v.name ? ` (${v.name})` : ''}`;
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    const err = {};
    if (!v.name.trim()) err.name = 'Please add your name.';
    if (!/^\S+@\S+\.\S+$/.test(v.email)) err.email = 'Please add a valid email so I can reply.';
    if (!v.type) err.type = 'Pick the closest option.';
    if (v.message.trim().length < 10) err.message = 'A sentence or two about the project helps.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setSent(true);
    window.location.href = href;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`To: ${CONTACT_EMAIL}\nSubject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked: the text is still visible to copy by hand */ }
  }

  if (sent) {
    return (
      <div className="card p-6 sm:p-8" role="status">
        <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent-ink"><EnvelopeSimple size={22} /></span>
        <h3 className="mt-4 text-xl font-semibold tracking-tight">Your email app should open now.</h3>
        <p className="mt-2 text-muted">If it did not, copy the message and send it to <a className="font-medium text-fg underline underline-offset-2" href={href}>{CONTACT_EMAIL}</a>.</p>
        <pre className="mt-4 max-h-56 overflow-auto whitespace-pre-wrap rounded-[10px] bg-sunken p-4 font-mono text-[13px] leading-relaxed">{body}</pre>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={copy} className="btn btn-primary btn-sm">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy message'}</button>
          <button onClick={() => setSent(false)} className="btn btn-ghost btn-sm">Edit details</button>
        </div>
      </div>
    );
  }

  const field = (k) => ({ id: `cf-${k}`, 'aria-invalid': errors[k] ? 'true' : undefined, 'aria-describedby': errors[k] ? `cf-${k}-err` : undefined });
  const Err = ({ k }) => (errors[k] ? <p id={`cf-${k}-err`} className="error">{errors[k]}</p> : null);

  return (
    <form onSubmit={submit} noValidate className="card grid gap-5 p-5 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="cf-name">Name</label>
          <input className="input" autoComplete="name" value={v.name} onChange={set('name')} {...field('name')} />
          <Err k="name" />
        </div>
        <div className="field">
          <label htmlFor="cf-email">Email</label>
          <input className="input" type="email" autoComplete="email" value={v.email} onChange={set('email')} {...field('email')} />
          <Err k="email" />
        </div>
        <div className="field">
          <label htmlFor="cf-type">Business type</label>
          <select className="input" value={v.type} onChange={set('type')} {...field('type')}>
            <option value="" disabled>Choose one</option>
            {BUSINESS_TYPES.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
          <Err k="type" />
        </div>
        <div className="field">
          <label htmlFor="cf-budget">Budget range</label>
          <select className="input" value={v.budget} onChange={set('budget')} {...field('budget')}>
            {BUDGETS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="cf-message">What do you need?</label>
        <textarea className="input min-h-32 resize-y" value={v.message} onChange={set('message')} {...field('message')}
          placeholder="For example: a website for my clinic where patients can book appointments." />
        <Err k="message" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="help">Opens your email app with the message ready to send.</p>
        <button type="submit" className="btn btn-primary"><EnvelopeSimple size={18} /> Open in email app</button>
      </div>
    </form>
  );
}
