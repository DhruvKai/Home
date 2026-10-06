import { ChatCircleDots, Phone, CreditCard, Info } from '@phosphor-icons/react';
import Modal from './Modal';

const ICONS = { whatsapp: ChatCircleDots, call: Phone, pay: CreditCard, info: Info };

// Stand-in for buttons that would leave the site in a real build (WhatsApp, phone, payment).
export default function Simulated({ open, onClose, kind = 'info', title, children }) {
  const Icon = ICONS[kind] ?? Info;
  return (
    <Modal open={open} onClose={onClose} title={title} variant="bottom" size="sm"
      footer={<button className="btn btn-primary w-full" onClick={onClose}>Got it</button>}>
      <div className="flex gap-4 p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink"><Icon size={22} /></span>
        <div className="space-y-2 text-[15px] leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Simulated in this demo</p>
          {children}
        </div>
      </div>
    </Modal>
  );
}
