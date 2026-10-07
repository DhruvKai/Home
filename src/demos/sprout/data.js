import { uid } from '../../lib/format';
import { demoStore } from '../_shared/demoStore';

// Fictional plant shop. Plants, prices and reviews are sample data.
export const FREE_REPOT = 1499;
export const SHIPPING = 99;

// light: low | medium | bright. care: 1 (forgiving) to 3 (fussy). size: desk | floor | hanging.
export const PLANTS = [
  { id: 'snake', name: 'Snake plant', latin: 'Dracaena trifasciata', photo: 'snake', pos: '80% 50%', price: 649, light: ['low', 'medium', 'bright'], care: 1, pet: false, size: 'desk', tag: 'Unkillable' },
  { id: 'zz', name: 'ZZ plant', latin: 'Zamioculcas zamiifolia', photo: 'zz', price: 799, light: ['low', 'medium'], care: 1, pet: false, size: 'desk', tag: 'Low light hero' },
  { id: 'pothos', name: 'Marble pothos', latin: 'Epipremnum aureum', photo: 'pothos', price: 549, light: ['low', 'medium'], care: 1, pet: false, size: 'hanging', tag: 'Fast grower' },
  { id: 'hanging', name: 'Heartleaf philodendron', latin: 'Philodendron hederaceum', photo: 'hanging', price: 699, light: ['medium'], care: 1, pet: false, size: 'hanging', tag: 'Trails for days' },
  { id: 'monstera', name: 'Monstera', latin: 'Monstera deliciosa', photo: 'monstera', price: 1499, light: ['medium', 'bright'], care: 2, pet: false, size: 'floor', tag: 'Statement' },
  { id: 'fiddle', name: 'Fiddle leaf fig', latin: 'Ficus lyrata', photo: 'fiddle', price: 1899, light: ['bright'], care: 3, pet: false, size: 'floor', tag: 'Drama queen' },
  { id: 'calathea', name: 'Peacock calathea', latin: 'Goeppertia makoyana', photo: 'calathea', price: 899, light: ['low', 'medium'], care: 3, pet: true, size: 'desk', tag: 'Pet-safe' },
  { id: 'orbifolia', name: 'Calathea orbifolia', latin: 'Goeppertia orbifolia', photo: 'orbifolia', price: 1099, light: ['medium'], care: 3, pet: true, size: 'desk', tag: 'Pet-safe' },
  { id: 'haworthia', name: 'Zebra haworthia', latin: 'Haworthiopsis fasciata', photo: 'haworthia', price: 399, light: ['medium', 'bright'], care: 1, pet: true, size: 'desk', tag: 'Pet-safe' },
  { id: 'cactus', name: 'Blue column cactus', latin: 'Pilosocereus', photo: 'cactus', price: 449, light: ['bright'], care: 1, pet: true, size: 'desk', tag: 'Sun lover' },
  { id: 'cactus-duo', name: 'Cactus duo', latin: 'Cereus, two stems', photo: 'cactus-duo', price: 749, light: ['bright'], care: 1, pet: true, size: 'desk', tag: 'Gift pick' },
  { id: 'snake-tall', name: 'Tall snake plant', latin: 'Dracaena trifasciata', photo: 'snake-tall', price: 1249, light: ['low', 'medium', 'bright'], care: 1, pet: false, size: 'floor', tag: 'Unkillable' },
];
export const plantById = (id) => PLANTS.find((p) => p.id === id);

export const POTS = [['nursery', 'Nursery pot', 0], ['terracotta', 'Terracotta', 249], ['glazed', 'Glazed, cream', 449]];

export const FILTERS = [
  ['all', 'All plants', () => true],
  ['low', 'Low light', (p) => p.light.includes('low')],
  ['pet', 'Pet-safe', (p) => p.pet],
  ['easy', 'Hard to kill', (p) => p.care === 1],
  ['hanging', 'Hanging', (p) => p.size === 'hanging'],
  ['floor', 'Big floor plants', (p) => p.size === 'floor'],
];

export const QUIZ = [
  { id: 'light', q: 'Where will it live?', options: [['bright', 'By a sunny window', 'Direct sun for a few hours'], ['medium', 'In a bright room', 'Light, but not on the sill'], ['low', 'Somewhere dim', 'A hallway, a north room, an office']] },
  { id: 'care', q: 'Be honest. How do you water?', options: [[1, 'I forget for weeks', 'Holidays, deadlines, life'], [2, 'Every week or so', 'Mostly on schedule'], [3, 'I love a routine', 'Misting is my idea of fun']] },
  { id: 'pet', q: 'Any pets who nibble?', options: [[true, 'Yes, a curious one', 'Only show pet-safe plants'], [false, 'No nibblers here', 'Anything goes']] },
  { id: 'size', q: 'How big are we going?', options: [['desk', 'Desk or shelf', 'Under 40 cm'], ['floor', 'Floor statement', 'Fills a corner'], ['hanging', 'Hanging or trailing', 'From a hook or a high shelf']] },
];

// Scores every plant against the answers and returns the best three.
export function recommend(a) {
  return PLANTS
    .filter((p) => !a.pet || p.pet)
    .map((p) => ({ p, score: (p.light.includes(a.light) ? 4 : 0) + (p.care <= a.care ? 3 : 0) - Math.max(0, p.care - a.care) * 2 + (p.size === a.size ? 2 : 0) }))
    .sort((x, y) => y.score - x.score || x.p.price - y.p.price)
    .slice(0, 3)
    .map((x) => x.p);
}

export function totals(cart) {
  const subtotal = cart.reduce((n, l) => n + l.unit * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_REPOT ? 0 : SHIPPING;
  return { subtotal, shipping, total: subtotal + shipping, repot: subtotal >= FREE_REPOT, toRepot: Math.max(0, FREE_REPOT - subtotal) };
}

function seed() {
  return { cart: [], orders: [] };
}

export const useSprout = demoStore('sprout', seed, (set, get) => ({
  add: (plantId, pot = 'nursery') => set((s) => {
    const key = `${plantId}|${pot}`;
    const p = plantById(plantId);
    const potRow = POTS.find(([id]) => id === pot);
    const same = s.cart.find((l) => l.key === key);
    return { cart: same ? s.cart.map((l) => (l === same ? { ...l, qty: l.qty + 1 } : l)) : [...s.cart, { key, id: plantId, name: p.name, photo: p.photo, pot: potRow[1], unit: p.price + potRow[2], qty: 1 }] };
  }),
  setQty: (key, qty) => set((s) => ({ cart: qty < 1 ? s.cart.filter((l) => l.key !== key) : s.cart.map((l) => (l.key === key ? { ...l, qty } : l)) })),
  checkout: (details) => {
    const order = { ...details, ...totals(get().cart), items: get().cart, id: uid('SP-'), placedAt: Date.now() };
    set((s) => ({ orders: [order, ...s.orders], cart: [] }));
    return order;
  },
}));
