import { Link } from 'react-router-dom';
import { ArrowCounterClockwise } from '@phosphor-icons/react';

export default function DemoDisclaimer({ name, onReset }) {
  return (
    <div className="border-t border-line bg-sunken text-muted" data-demo-disclaimer>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-[13px] leading-relaxed sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="max-w-3xl">
          <strong className="font-semibold text-fg">Concept demo.</strong> {name} is a fictional business, designed and built by Dhruv Kaith to show what
          he can make for real ones. People, reviews, prices, figures and contact details are sample data. Nothing is booked, sent or charged.
          Photos from Unsplash, see <Link to="/credits" className="underline underline-offset-2 hover:text-fg">credits</Link>.
        </p>
        {onReset && (
          <button onClick={onReset} className="btn btn-ghost btn-sm shrink-0 self-start sm:self-auto">
            <ArrowCounterClockwise size={15} /> Reset demo data
          </button>
        )}
      </div>
    </div>
  );
}
