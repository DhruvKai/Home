import { isoDay, uid } from '../../lib/format';
import { demoStore } from '../_shared/demoStore';

// Fictional city hotel. Rooms, rates and figures are sample data.
export const HOTEL = { name: 'The Linden', address: ['9 Linden Arcade', 'Old Exchange District, Riverton'] };

export const ROOMS = [
  { id: 'studio', name: 'Studio King', photo: 'room-studio', size: 28, sleeps: 2, rate: 11800, view: 'Courtyard', blurb: 'Pale oak, blackout linen and a desk by the window.' },
  { id: 'twin', name: 'Arcade Twin', photo: 'room-twin', size: 32, sleeps: 2, rate: 12600, view: 'Arcade', blurb: 'Two full beds under brass reading lamps.' },
  { id: 'corner', name: 'Corner King', photo: 'room-king', size: 38, sleeps: 3, rate: 16400, view: 'Two-sided city', blurb: 'Windows on two sides and a deep velvet chair.' },
  { id: 'suite', name: 'Linden Suite', photo: 'room-suite', size: 64, sleeps: 4, rate: 29800, view: 'Rooftops', blurb: 'A separate salon, a stone bath and the best view in the house.' },
];
export const roomById = (id) => ROOMS.find((r) => r.id === id);

export const ADDONS = [
  { id: 'breakfast', name: 'Breakfast in the Salon', price: 1400, per: 'guest-night' },
  { id: 'late', name: 'Late check-out, 3 pm', price: 2500, per: 'stay' },
  { id: 'car', name: 'Car from the airport', price: 3200, per: 'stay' },
  { id: 'cellar', name: 'A bottle from the cellar on arrival', price: 4800, per: 'stay' },
];

export const FEATURES = [
  { n: '01', title: 'The Salon', photo: 'dining', alt: 'Low-lit dining room', text: 'Breakfast until noon, a short dinner menu after seven, and a long table for whoever wants company.' },
  { n: '02', title: 'Bar Nine', photo: 'cocktails', alt: 'Two cocktails on a dark bar', text: 'Nine stools, a vinyl wall and a list of drinks that changes with the season. Open until 2 am.' },
  { n: '03', title: 'The Pool Room', photo: 'pool', alt: 'Pool lit blue at night', text: 'A heated lap pool on the roof, open from six in the morning, with a steam room beside it.' },
];

export const nights = (a, b) => (a && b ? Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 86400000) : 0);

// Seeded sold-out nights per room so the calendar has texture.
export function soldOut(roomId, date, stays) {
  const seeded = (date.charCodeAt(8) * 3 + date.charCodeAt(9) + roomId.length * 5) % 11 === 0;
  return seeded || stays.some((s) => s.room === roomId && date >= s.checkIn && date < s.checkOut);
}

export function roomFree(roomId, checkIn, checkOut, stays) {
  for (let d = new Date(checkIn + 'T00:00'); d < new Date(checkOut + 'T00:00'); d.setDate(d.getDate() + 1)) {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (soldOut(roomId, iso, stays)) return false;
  }
  return true;
}

export function quote({ room, checkIn, checkOut, guests, addons }) {
  const r = roomById(room);
  const n = nights(checkIn, checkOut);
  const roomTotal = r ? r.rate * n : 0;
  const extras = ADDONS.filter((a) => addons.includes(a.id)).map((a) => ({ ...a, total: a.per === 'guest-night' ? a.price * guests * n : a.price }));
  const subtotal = roomTotal + extras.reduce((s, a) => s + a.total, 0);
  const tax = Math.round(subtotal * 0.18);
  return { n, roomTotal, extras, subtotal, tax, total: subtotal + tax };
}

function seed() {
  return { stays: [{ ref: 'TL-SEED', room: 'suite', checkIn: isoDay(3), checkOut: isoDay(5) }] };
}

export const useLinden = demoStore('linden', seed, (set) => ({
  reserve: (details) => {
    const stay = { ...details, ref: uid('TL-'), createdAt: Date.now() };
    set((s) => ({ stays: [...s.stays, stay] }));
    return stay;
  },
}));
