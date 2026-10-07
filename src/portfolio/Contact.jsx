import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import ContactForm from './ContactForm';
import { Available, SocialPills } from './ui';
import { BUSINESS_TYPES } from '../data/demos';

export default function Contact() {
  const [params] = useSearchParams();
  const ref = params.get('ref') ?? '';
  const label = BUSINESS_TYPES.find(([k]) => k === ref)?.[1];
  useEffect(() => { document.title = "Let's talk | Dhruv Kaith"; }, []);

  return (
    <section className="mx-auto grid max-w-[1400px] gap-10 px-4 py-8 md:px-8 md:py-12 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:border-fg"><ArrowLeft size={14} weight="bold" /> Portfolio</Link>
        <div className="mt-10"><Available /></div>
        <h1 className="mt-6 text-[clamp(2.8rem,6vw,5rem)] font-bold uppercase leading-[0.95] tracking-[-0.035em]">Let's talk</h1>
        <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-muted">
          {label
            ? `You came from a ${label.toLowerCase()} demo, so that is filled in. Tell me about your business and what you need.`
            : 'Tell me about your business and what you need. The form opens your email app with the message ready to send.'}
        </p>
        <SocialPills size="sm" className="mt-8" />
      </div>
      <ContactForm initialRef={ref} />
    </section>
  );
}
