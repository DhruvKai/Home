import { uid } from '../../lib/format';
import { demoStore } from '../_shared/demoStore';

// Fictional ramen counter. Menu, prices and times are sample data.
export const SHOP = {
  name: 'Kōji Ramen Counter',
  address: ['Unit 4, Tannery Yard', 'Riverton'],
  hours: [['Tue to Thu', '12:00 to 15:00, 18:00 to 22:30'], ['Fri and Sat', '12:00 to 15:00, 18:00 to 00:30'], ['Sunday', '12:00 to 21:00'], ['Monday', 'Closed']],
};

export const BROTHS = [
  { id: 'tonkotsu', name: 'Tonkotsu', note: 'Pork bone, 18 hours', price: 520 },
  { id: 'shoyu', name: 'Shoyu', note: 'Chicken and soy', price: 480 },
  { id: 'miso', name: 'Miso', note: 'Red and white miso', price: 500 },
  { id: 'shio', name: 'Shio', note: 'Clear, salt and kombu', price: 460 },
  { id: 'tantan', name: 'Tantan', note: 'Sesame and chilli', price: 540 },
  { id: 'kombu', name: 'Kombu veg', note: 'Seaweed and shiitake, vegan', price: 440 },
];
export const NOODLES = [['thin', 'Thin, straight'], ['wavy', 'Medium, wavy'], ['thick', 'Thick, chewy'], ['rice', 'Rice noodles (gluten-free)']];
export const FIRMNESS = ['Soft', 'Regular', 'Firm', 'Extra firm'];
export const TOPPINGS = [
  { id: 'chashu', name: 'Chashu pork', price: 160 }, { id: 'egg', name: 'Ajitama egg', price: 70 }, { id: 'tofu', name: 'Smoked tofu', price: 110 },
  { id: 'menma', name: 'Menma', price: 50 }, { id: 'corn', name: 'Butter corn', price: 60 }, { id: 'nori', name: 'Nori ×3', price: 40 },
  { id: 'scallion', name: 'Extra scallion', price: 30 }, { id: 'oil', name: 'Black garlic oil', price: 40 }, { id: 'kaedama', name: 'Extra noodles', price: 120 },
];

export const BOWLS = [
  { no: '01', id: 'b-tonkotsu', name: 'Kōji Tonkotsu', photo: 'tonkotsu', build: { broth: 'tonkotsu', noodle: 'thin', firm: 2, toppings: ['chashu', 'egg', 'scallion', 'oil'], spice: 0 } },
  { no: '02', id: 'b-shoyu', name: 'Classic Shoyu', photo: 'shoyu', build: { broth: 'shoyu', noodle: 'wavy', firm: 1, toppings: ['chashu', 'egg', 'menma', 'nori'], spice: 0 } },
  { no: '03', id: 'b-miso', name: 'Sapporo Miso', photo: 'miso', build: { broth: 'miso', noodle: 'thick', firm: 1, toppings: ['chashu', 'corn', 'scallion'], spice: 1 } },
  { no: '04', id: 'b-tantan', name: 'Red Tantan', photo: 'spicy', build: { broth: 'tantan', noodle: 'wavy', firm: 2, toppings: ['egg', 'scallion'], spice: 4 } },
  { no: '05', id: 'b-shio', name: 'Yuzu Shio', photo: 'shio', build: { broth: 'shio', noodle: 'thin', firm: 1, toppings: ['chashu', 'menma'], spice: 0 } },
  { no: '06', id: 'b-veg', name: 'Garden Kombu', photo: 'veg', build: { broth: 'kombu', noodle: 'rice', firm: 1, toppings: ['tofu', 'corn', 'scallion'], spice: 1 } },
];

export const SIDES = [
  { id: 'gyoza', name: 'Pan-fried gyoza ×6', photo: 'gyoza', price: 320 },
  { id: 'dumplings', name: 'Steamed veg dumplings ×6', photo: 'dumplings', price: 290 },
  { id: 'karaage', name: 'Chicken karaage', price: 340 },
  { id: 'edamame', name: 'Salted edamame', price: 180 },
  { id: 'cola', name: 'Yuzu soda', price: 150 },
  { id: 'tea', name: 'Iced barley tea', price: 120 },
];

export const DEFAULT_BUILD = { broth: 'tonkotsu', noodle: 'thin', firm: 1, toppings: ['egg'], spice: 0 };

export function bowlPrice(b) {
  const base = BROTHS.find((x) => x.id === b.broth)?.price ?? 0;
  return base + TOPPINGS.filter((t) => b.toppings.includes(t.id)).reduce((n, t) => n + t.price, 0);
}

export function describe(b) {
  const broth = BROTHS.find((x) => x.id === b.broth)?.name;
  const noodle = NOODLES.find(([id]) => id === b.noodle)?.[1];
  return { title: `${broth} ramen`, lines: [`${noodle}, ${FIRMNESS[b.firm].toLowerCase()}`, ...TOPPINGS.filter((t) => b.toppings.includes(t.id)).map((t) => t.name), `Spice ${b.spice}/5`] };
}

// Pickup slots every 15 minutes, starting 20 minutes from now.
export function pickupSlots(count = 8) {
  const t = new Date(Date.now() + 20 * 60000);
  t.setMinutes(Math.ceil(t.getMinutes() / 15) * 15, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(t.getTime() + i * 15 * 60000);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
}

export const TICKET_STEPS = ['Received', 'In the pot', 'Ready at the counter', 'Collected'];
export const ticketStep = (o, now = Date.now()) => Math.min(3, Math.floor((now - o.placedAt) / 20000));

function seed() {
  return { ticket: [], orders: [] };
}

export const useKoji = demoStore('koji', seed, (set, get) => ({
  add: (line) => set((s) => ({ ticket: [...s.ticket, { ...line, key: uid() }] })),
  setQty: (key, qty) => set((s) => ({ ticket: qty < 1 ? s.ticket.filter((l) => l.key !== key) : s.ticket.map((l) => (l.key === key ? { ...l, qty } : l)) })),
  send: (details) => {
    const items = get().ticket;
    const total = items.reduce((n, l) => n + l.unit * l.qty, 0);
    const order = { ...details, id: uid('K'), number: `A-${String(40 + get().orders.length + Math.floor(Math.random() * 20)).padStart(3, '0')}`, items, total, placedAt: Date.now() };
    set((s) => ({ orders: [order, ...s.orders], ticket: [] }));
    return order;
  },
}));
