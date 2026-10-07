import { isoDay, uid } from '../../lib/format';
import { demoStore } from '../_shared/demoStore';

// Fictional dental studio. Treatments, prices, people and reviews are sample data.
export const STUDIO = {
  name: 'Lumen Dental Studio',
  address: ['Level 2, 40 Quarry Row', 'Riverton'],
  hours: [['Mon to Fri', '9:00 am to 7:00 pm'], ['Saturday', '10:00 am to 4:00 pm'], ['Sunday', 'Closed']],
};

// `options` change the estimate. `size` sets the bento tile size on the page.
export const TREATMENTS = [
  { id: 'checkup', name: 'Check-up and clean', blurb: 'Exam, scale and polish, with digital X-rays when needed.', price: 1800, mins: 45, photo: 'tools', size: 'wide',
    options: [['Exam and clean', 0], ['Add digital X-rays', 900]] },
  { id: 'whitening', name: 'Whitening', blurb: 'Brighter in one visit, or gently at home over two weeks.', price: 9500, mins: 75, photo: 'whitening', size: 'tall',
    options: [['Take-home trays', 0], ['In-chair, one visit', 6500]] },
  { id: 'aligners', name: 'Clear aligners', blurb: 'Nearly invisible trays, planned from a 3D scan of your teeth.', price: 85000, mins: 60, photo: 'aligner', size: 'big',
    options: [['Mild, up to 6 months', 0], ['Moderate, up to 12 months', 40000], ['Complex, up to 18 months', 80000]] },
  { id: 'implant', name: 'Implants', blurb: 'A titanium root and a ceramic crown that look and feel like your own.', price: 42000, mins: 90, photo: 'implant', size: 'tall',
    options: [['One tooth', 0], ['Two teeth', 40000], ['Three teeth', 78000]] },
  { id: 'emergency', name: 'Same-day emergency', blurb: 'Pain, a chipped tooth or a lost filling. Seen the same day.', price: 1500, mins: 30, size: 'small',
    options: [['Assessment', 0], ['Assessment and temporary filling', 1200]] },
  { id: 'kids', name: 'Kids visits', blurb: 'Gentle first visits, sealants and fluoride for under 14s.', price: 1200, mins: 30, size: 'small',
    options: [['First visit', 0], ['Visit with sealants', 1600]] },
];
export const treatmentById = (id) => TREATMENTS.find((t) => t.id === id);

export const TEAM = [
  { id: 'meera', name: 'Dr. Meera Anand', role: 'Orthodontics and aligners', photo: 'dr-1', years: 12 },
  { id: 'sofia', name: 'Dr. Sofia Varga', role: 'Implants and restorative', photo: 'dr-2', years: 15 },
  { id: 'ishita', name: 'Dr. Ishita Rao', role: 'Family and kids dentistry', photo: 'dr-3', years: 8 },
];

export const REVIEWS = [
  ['I put off the dentist for years. They showed me the full price before anything started, which made all the difference.', 'Ananya, aligners'],
  ['Booked an emergency slot at lunch and was out by two with a temporary filling. Calm, quick, no fuss.', 'Rohit, emergency visit'],
  ['My son actually asks when he can go back. The kids room helps, and so does Dr. Rao.', 'Kavita, kids visits'],
];

export const FAQ = [
  ['Is the estimate the final price?', 'For check-ups, whitening and emergencies, yes. For aligners and implants the estimate becomes a written plan after your scan, and we only change it if you agree.'],
  ['Can I pay monthly?', 'Treatments over ₹20,000 can be split over 6 or 12 months at no extra cost. In this demo the plan is only shown, nothing is charged.'],
  ['Do you see nervous patients?', 'Often. Ask for a longer first appointment and we will walk you through every step before we start.'],
  ['What if I need to move my visit?', 'You can move or cancel up to 24 hours before, from the link in your confirmation message.'],
];

export const TIMES = ['09:00', '09:45', '10:30', '11:15', '12:00', '14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:15'];

// Seeded "taken" slots so the picker looks lived in. Sundays are closed, Saturdays end at 4 pm.
export function freeTimes(date, bookings) {
  const day = new Date(date + 'T00:00').getDay();
  if (day === 0) return [];
  const taken = new Set(bookings.filter((b) => b.date === date).map((b) => b.time));
  return TIMES.filter((t, i) => (day !== 6 || t < '16:00') && (date.charCodeAt(9) + i * 7) % 4 !== 0 && !taken.has(t));
}

export function estimate(plan) {
  const lines = plan.map(({ id, option }) => {
    const t = treatmentById(id);
    const [label, extra] = t.options[option] ?? t.options[0];
    return { id, name: t.name, label, price: t.price + extra, mins: t.mins };
  });
  const total = lines.reduce((n, l) => n + l.price, 0);
  return { lines, total, mins: lines.reduce((n, l) => n + l.mins, 0), monthly: total >= 20000 ? { 6: Math.ceil(total / 6), 12: Math.ceil(total / 12) } : null };
}

function seed() {
  return { bookings: [{ ref: 'LD-SEED1', date: isoDay(1), time: '10:30' }, { ref: 'LD-SEED2', date: isoDay(2), time: '14:00' }] };
}

export const useDental = demoStore('dental', seed, (set) => ({
  book: (details) => {
    const booking = { ...details, ref: uid('LD-'), createdAt: Date.now() };
    set((s) => ({ bookings: [...s.bookings, booking] }));
    return booking;
  },
}));
