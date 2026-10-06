import { isoDay, toDate, uid } from '../../lib/format';
import { demoStore } from '../_shared/demoStore';

// Fictional hotel. Rates, rooms, reviews and availability are sample data.
export const HOTEL = { name: 'Alpine House', place: 'Lake Verran, Riverton Valley', email: 'stay@alpinehouse.demo' };
export const TAX_RATE = 0.12;

export const ROOMS = [
  {
    id: 'lakeside-king', name: 'Lakeside King', photo: 'room-king', gallery: ['room-king', 'bath', 'deck-bed'], rate: 11800, size: 32, guests: 2,
    beds: '1 king bed', view: 'Lake view', short: 'Our most booked room, with a reading nook facing the water.',
    description: 'A warm, quiet room on the lake side of the house, with a king bed, a reading nook by the window and a rain shower. Morning light comes straight off the water.',
    amenities: ['Rain shower', 'Reading nook', 'Coffee machine', 'Heated floors', 'Work desk', 'Blackout curtains'],
  },
  {
    id: 'glass-suite', name: 'Glass Suite', photo: 'room-glass', gallery: ['room-glass', 'deck-bed', 'bath'], rate: 24500, size: 58, guests: 3,
    beds: '1 king bed, 1 day bed', view: 'Panoramic mountain view', short: 'Floor-to-ceiling glass and a private lounge.',
    description: 'A corner suite wrapped in glass on two sides, with a separate lounge, a day bed for a third guest and a deep soaking tub. The best seat in the house for sunrise.',
    amenities: ['Soaking tub', 'Private lounge', 'Day bed', 'Minibar', 'Bluetooth speaker', 'Evening turndown'],
  },
  {
    id: 'timber-suite', name: 'Timber Suite', photo: 'room-timber', gallery: ['room-timber', 'terrace', 'bath'], rate: 18900, size: 46, guests: 4,
    beds: '1 king bed, 1 sofa bed', view: 'Forest view', short: 'Dark timber, a garden door and room for four.',
    description: 'Built around old larch beams, with a garden door onto the pines and a sofa bed for two children. Families like it for the space and the quiet.',
    amenities: ['Garden access', 'Sofa bed', 'Rain shower', 'Kids\' welcome kit', 'Coffee machine', 'Heated floors'],
  },
  {
    id: 'classic-double', name: 'Classic Double', photo: 'room-classic', gallery: ['room-classic', 'bath'], rate: 9600, size: 26, guests: 2,
    beds: '1 queen bed', view: 'Courtyard view', short: 'A traditional room with a tufted sofa and courtyard views.',
    description: 'The original rooms of the house, refreshed with linen bedding, a tufted sofa and long curtains. Good value for a short stay.',
    amenities: ['Queen bed', 'Tufted sofa', 'Tea tray', 'Walk-in shower', 'Wardrobe'],
  },
  {
    id: 'loft-room', name: 'Loft Room', photo: 'room-loft', gallery: ['room-loft', 'bath', 'rooftop'], rate: 13400, size: 36, guests: 2,
    beds: '1 king bed', view: 'Valley view', short: 'Under the eaves, with rooftop terrace access.',
    description: 'A top-floor room under the roof beams, with skylights over the bed and a short stair to the shared rooftop terrace.',
    amenities: ['Skylights', 'Rooftop access', 'Rain shower', 'Coffee machine', 'Work desk'],
  },
  {
    id: 'cosy-single', name: 'Cosy Single', photo: 'room-cosy', gallery: ['room-cosy', 'bath'], rate: 6400, size: 16, guests: 1,
    beds: '1 double bed', view: 'Garden view', short: 'A compact room for solo hikers and short stays.',
    description: 'A small, well-planned room with a double bed, good storage for boots and gear, and a walk-in shower.',
    amenities: ['Double bed', 'Gear storage', 'Walk-in shower', 'Tea tray'],
  },
];

export const roomById = (id) => ROOMS.find((r) => r.id === id);

export function nightsBetween(a, b) {
  if (!a || !b) return 0;
  return Math.max(0, Math.round((toDate(b) - toDate(a)) / 86400000));
}

function datesBetween(a, b) {
  const out = [];
  for (let d = toDate(a); d < toDate(b); d.setDate(d.getDate() + 1)) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return out;
}

export function isAvailable(room, checkIn, checkOut, guests, booked) {
  if (guests > room.guests) return false;
  if (!checkIn || !checkOut) return true;
  const blocked = new Set(booked[room.id] ?? []);
  return datesBetween(checkIn, checkOut).every((d) => !blocked.has(d));
}

function seed() {
  // Booked nights per room, relative to today.
  const ranges = { 'lakeside-king': [[2, 5], [9, 11]], 'glass-suite': [[0, 3]], 'timber-suite': [[5, 8]], 'classic-double': [[1, 2]], 'loft-room': [[3, 6], [12, 14]], 'cosy-single': [] };
  const booked = {};
  for (const [id, rs] of Object.entries(ranges)) booked[id] = rs.flatMap(([a, b]) => datesBetween(isoDay(a), isoDay(b)));
  return { booked, enquiries: [], search: { checkIn: isoDay(7), checkOut: isoDay(9), guests: 2, applied: false } };
}

export const useHotel = demoStore('hotel', seed, (set) => ({
  setSearch: (search) => set((s) => ({ search: { ...s.search, ...search } })),
  addEnquiry: (e) => {
    const enquiry = { ...e, id: uid('E'), ref: 'AH-' + Math.floor(20000 + Math.random() * 9999), at: Date.now() };
    set((s) => ({ enquiries: [enquiry, ...s.enquiries] }));
    return enquiry;
  },
}));

export const REVIEWS = [
  ['The Glass Suite at sunrise was worth the whole trip. Staff had the boat ready for us before breakfast.', 'Ritika and Arjun', 'Stayed 3 nights'],
  ['Quiet, warm and the food was excellent. Our kids still talk about the hike to the waterfall.', 'The Okafor family', 'Stayed 5 nights'],
  ['Small enough that everyone knew our names by day two. The spa is the best I have used in the mountains.', 'Helena Sørensen', 'Stayed 2 nights'],
];
