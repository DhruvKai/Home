import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import ContactForm from './ContactForm';
import { BUSINESS_TYPES } from '../data/demos';

export default function Contact() {
  const [params] = useSearchParams();
  const ref = params.get('ref') ?? '';
  const label = BUSINESS_TYPES.find(([k]) => k === ref)?.[1];
  useEffect(() => { document.title = 'Start a project | Dhruv Kaith'; }, []);

  return (
    <section className="wrap grid gap-10 py-10 md:py-16 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeft size={14} /> Portfolio</Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tighter md:text-5xl">Start a project</h1>
        <p className="mt-4 max-w-[44ch] text-lg leading-relaxed text-muted">
          {label
            ? `You came from a ${label.toLowerCase()} demo, so that is filled in. Tell me about your business and what you need.`
            : 'Tell me about your business and what you need. The form opens your email app with the message ready to send.'}
        </p>
      </div>
      <ContactForm initialRef={ref} />
    </section>
  );
}
