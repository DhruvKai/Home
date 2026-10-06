import { uid } from '../../lib/format';
import { demoStore } from '../_shared/demoStore';

// Fictional restaurant. Dishes, prices and offers are sample data.
export const PLACE = {
  name: 'Ember & Plate',
  address: ['18 Foundry Lane', 'Old Mill Quarter, Riverton'],
  hours: [[1, '12:00', '23:00'], [2, '12:00', '23:00'], [3, '12:00', '23:00'], [4, '12:00', '23:30'], [5, '12:00', '00:00'], [6, '11:00', '00:00'], [0, '11:00', '22:30']],
  deliveryFee: 49,
  freeDessertOver: 1500,
};

export const CATEGORIES = [
  ['small', 'Small plates'], ['grill', 'From the grill'], ['bowls', 'Pasta and bowls'], ['pizza', 'Pizza and burgers'], ['dessert', 'Desserts'], ['drinks', 'Drinks'],
];

export const DIETS = [['veg', 'Vegetarian'], ['vegan', 'Vegan'], ['gf', 'Gluten-free'], ['spicy', 'Spicy']];

const SIDES = { name: 'Side', type: 'one', required: true, choices: [['Fries', 0], ['Charred greens', 0], ['Mash', 0], ['Truffle fries', 90]] };
const DONENESS = { name: 'How it\'s cooked', type: 'one', required: true, choices: [['Medium rare', 0], ['Medium', 0], ['Well done', 0]] };
const SPICE = { name: 'Spice level', type: 'one', required: true, choices: [['Mild', 0], ['Medium', 0], ['Hot', 0]] };
const SIZE = { name: 'Size', type: 'one', required: true, choices: [['Regular', 0], ['Large', 180]] };
const EXTRAS = (list) => ({ name: 'Add-ons', type: 'many', choices: list });

export const MENU = [
  { id: 'halloumi', cat: 'small', name: 'Grilled halloumi', photo: 'halloumi', price: 420, diets: ['veg', 'gf'], desc: 'Charred halloumi, burnt honey, chilli oil and herb salad.', options: [EXTRAS([['Extra halloumi', 140], ['Sourdough', 60]])], popular: true },
  { id: 'skewers', cat: 'small', name: 'Chicken skewers', photo: 'skewers', price: 480, diets: ['gf'], desc: 'Yoghurt-marinated thigh, grilled over coals, with garlic sauce.', options: [SPICE, EXTRAS([['Extra skewer', 160], ['Flatbread', 50]])] },
  { id: 'small-plates', cat: 'small', name: 'Chilli beef bites', photo: 'small-plates', price: 520, diets: ['spicy'], desc: 'Seared beef, crispy shallots, lime and red chilli.', options: [SPICE] },
  { id: 'salad', cat: 'small', name: 'Ember garden salad', photo: 'salad', price: 360, diets: ['vegan', 'veg', 'gf'], desc: 'Leaves, roast carrot, pickled onion and toasted seeds.', options: [EXTRAS([['Add grilled chicken', 160], ['Add halloumi', 140]])] },
  { id: 'ribeye', cat: 'grill', name: 'Ribeye, 300 g', photo: 'steak', price: 1650, diets: ['gf'], desc: 'Dry-aged ribeye cooked over oak, with bone marrow butter.', options: [DONENESS, SIDES, EXTRAS([['Peppercorn sauce', 90], ['Grilled prawns', 260]])], popular: true },
  { id: 'steak-frites', cat: 'grill', name: 'Steak frites', photo: 'steak-frites', price: 1190, diets: [], desc: 'Flat iron steak, skin-on fries and green sauce.', options: [DONENESS, EXTRAS([['Peppercorn sauce', 90], ['Fried egg', 50]])] },
  { id: 'ribs', cat: 'grill', name: 'Smoked short ribs', photo: 'ribs', price: 1290, diets: ['gf'], desc: 'Eight-hour smoked ribs, house barbecue glaze, pickles.', options: [SIDES] },
  { id: 'farfalle', cat: 'bowls', name: 'Pesto farfalle', photo: 'farfalle', price: 560, diets: ['veg'], desc: 'Basil pesto, blistered tomatoes and parmesan.', options: [SIZE, EXTRAS([['Grilled chicken', 160], ['Burrata', 220]])] },
  { id: 'penne', cat: 'bowls', name: 'Penne arrabbiata', photo: 'penne', price: 520, diets: ['veg', 'spicy'], desc: 'Slow tomato sauce, garlic and dried chilli.', options: [SIZE, SPICE] },
  { id: 'prawn-pasta', cat: 'bowls', name: 'Prawn linguine', photo: 'prawn-pasta', price: 780, diets: ['spicy'], desc: 'Tiger prawns, cherry tomato, chilli and lemon.', options: [SIZE], popular: true },
  { id: 'salmon-bowl', cat: 'bowls', name: 'Grilled salmon bowl', photo: 'salmon-bowl', price: 820, diets: ['gf'], desc: 'Salmon, rice, avocado, edamame and sesame dressing.', options: [EXTRAS([['Extra salmon', 280], ['Soft egg', 50]])] },
  { id: 'veg-bowl', cat: 'bowls', name: 'Rainbow bowl', photo: 'veg-bowl', price: 540, diets: ['vegan', 'veg', 'gf'], desc: 'Roast veg, avocado, quinoa and tahini.', options: [EXTRAS([['Smoked tofu', 120]])] },
  { id: 'pizza', cat: 'pizza', name: 'Smoked chicken pizza', photo: 'pizza', price: 690, diets: [], desc: 'Wood-fired base, smoked chicken, red onion and mozzarella.', options: [SIZE, EXTRAS([['Extra cheese', 80], ['Jalapeños', 40]])] },
  { id: 'burger', cat: 'pizza', name: 'Ember burger', photo: 'burger', price: 640, diets: [], desc: 'Double smashed patty, cheddar, pickles, house sauce.', options: [SIDES, EXTRAS([['Bacon', 90], ['Extra patty', 180]])], popular: true },
  { id: 'berry-cake', cat: 'dessert', name: 'Raspberry sponge', photo: 'berry-cake', price: 380, diets: ['veg'], desc: 'Vanilla sponge, raspberry cream and fresh berries.', options: [] },
  { id: 'sundae', cat: 'dessert', name: 'Salted caramel sundae', photo: 'sundae', price: 340, diets: ['veg', 'gf'], desc: 'Vanilla ice cream, salted caramel and a wafer.', options: [] },
  { id: 'french-toast', cat: 'dessert', name: 'Brioche French toast', photo: 'french-toast', price: 360, diets: ['veg'], desc: 'Banana, blueberries and maple.', options: [EXTRAS([['Scoop of ice cream', 90]])] },
  { id: 'mojito', cat: 'drinks', name: 'Virgin mojito', photo: 'mojito', price: 240, diets: ['vegan', 'veg', 'gf'], desc: 'Lime, mint and soda.', options: [SIZE] },
];

export const itemById = (id) => MENU.find((m) => m.id === id);

export const OFFERS = [
  ['Weekday lunch', 'Two courses for ₹699, Monday to Friday, 12 to 4 pm.'],
  ['Free dessert', `Orders over ₹1,500 get a free salted caramel sundae, added at checkout.`],
  ['Early evening', 'Mocktails at half price from 5 to 7 pm, every day.'],
];

export function cartTotals(cart, mode) {
  const subtotal = cart.reduce((n, l) => n + l.unit * l.qty, 0);
  const delivery = mode === 'delivery' && subtotal > 0 ? PLACE.deliveryFee : 0;
  const tax = Math.round(subtotal * 0.05);
  return { subtotal, delivery, tax, total: subtotal + delivery + tax, freeDessert: subtotal >= PLACE.freeDessertOver };
}

// Order status advances with time so the tracker feels live in the demo.
export const ORDER_STEPS = { pickup: ['Received', 'Preparing', 'Ready for pickup', 'Collected'], delivery: ['Received', 'Preparing', 'Out for delivery', 'Delivered'] };
export const orderStep = (o, now = Date.now()) => Math.min(3, Math.floor((now - o.placedAt) / 25000));

function seed() {
  return { cart: [], orders: [], reservations: [] };
}

export const useRestaurant = demoStore('restaurant', seed, (set, get) => ({
  addToCart: (line) => set((s) => {
    const same = s.cart.find((l) => l.key === line.key);
    return { cart: same ? s.cart.map((l) => (l === same ? { ...l, qty: l.qty + line.qty } : l)) : [...s.cart, line] };
  }),
  setQty: (key, qty) => set((s) => ({ cart: qty < 1 ? s.cart.filter((l) => l.key !== key) : s.cart.map((l) => (l.key === key ? { ...l, qty } : l)) })),
  placeOrder: (details) => {
    const { cart } = get();
    const totals = cartTotals(cart, details.mode);
    const order = { ...details, id: uid('O'), number: String(300 + get().orders.length + Math.floor(Math.random() * 40)), items: cart, ...totals, placedAt: Date.now() };
    set((s) => ({ orders: [order, ...s.orders], cart: [] }));
    return order;
  },
  reserve: (r) => {
    const res = { ...r, id: uid('R'), ref: 'EP-' + Math.floor(1000 + Math.random() * 8999), at: Date.now() };
    set((s) => ({ reservations: [res, ...s.reservations] }));
    return res;
  },
}));
