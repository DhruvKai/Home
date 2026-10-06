import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';

// Closing call to action for each demo, linking to the contact form with the business type filled in.
export default function StartProjectCTA({ projectRef, title, text }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" data-no-print>
      <div className="grid gap-6 rounded-2xl border border-line bg-surface p-6 sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm font-medium text-muted" style={{ fontFamily: "'Geist Variable', system-ui, sans-serif" }}>From Dhruv Kaith, who built this demo</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-[60ch] text-muted">{text}</p>
        </div>
        <Link to={`/contact?ref=${projectRef}`} className="btn btn-primary justify-self-start">
          Start a project like this <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    </section>
  );
}
