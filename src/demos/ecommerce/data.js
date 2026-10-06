import { uid } from '../../lib/format';
import { demoStore } from '../_shared/demoStore';

// Fictional store. Products, prices, customers and orders are sample data.
export const STORE = { name: 'North & Co.', freeShippingOver: 2500, shipping: 149, lowStock: 3 };

export const CATEGORIES = [
  ['living', 'Living', 'sofa'],
  ['kitchen', 'Kitchen', 'cups'],
  ['wear', 'Wear', 'knit'],
  ['objects', 'Objects', 'headphones'],
];

const C = {
  sand: ['Sand', '#d8c9ae'], ink: ['Ink', '#1f2430'], moss: ['Moss', '#5d7052'], bone: ['Bone', '#ece8df'], rust: ['Rust', '#a5532f'],
  slate: ['Slate', '#5e6873'], white: ['White', '#f4f4f2'], black: ['Black', '#1c1c1c'], ochre: ['Ochre', '#d9a531'], forest: ['Forest', '#2f5a48'], natural: ['Natural', '#c8a879'],
};

const P = (id, name, cat, photo, price, colours, sizes, desc, details, extra = {}) => ({ id, name, cat, photo, price, colours: colours.map((c) => C[c]), sizes, desc, details, ...extra });

export const PRODUCTS = [
  P('lounge-chair', 'Ochre lounge chair', 'living', 'armchair', 18900, ['ochre', 'moss', 'slate'], null, 'A compact lounge chair with a solid oak frame and a deep, sprung seat.', ['Solid oak legs', 'Removable cover', 'W 72 x D 78 x H 80 cm'], { badge: 'Bestseller', added: 5 }),
  P('three-seat-sofa', 'Three-seat sofa', 'living', 'sofa', 64900, ['forest', 'sand', 'slate'], null, 'Low, firm and generous. Velvet upholstery on a kiln-dried hardwood frame.', ['Seats three', 'Velvet, 340 g/m²', 'Free white-glove delivery'], { added: 12 }),
  P('tufted-chair', 'Tufted side chair', 'living', 'chair', 12400, ['bone', 'sand'], null, 'A small tufted chair for a bedroom or reading corner.', ['Painted beech legs', 'Spot clean only'], { added: 30 }),
  P('arc-floor-lamp', 'Arc floor lamp', 'living', 'floor-lamp', 9800, ['slate', 'black'], null, 'A steel floor lamp with an adjustable shade and a weighted base.', ['E27 bulb, not included', 'Foot switch', 'H 165 cm'], { added: 8 }),
  P('dome-pendant', 'Dome pendant light', 'living', 'pendant', 5600, ['white', 'slate'], null, 'Powder-coated aluminium shade that throws a warm pool of light over a table.', ['Ø 38 cm', '2 m fabric cable'], { added: 2, badge: 'New' }),
  P('stoneware-cups', 'Stoneware cups, set of 4', 'kitchen', 'cups', 1890, ['natural', 'white'], null, 'Hand-glazed stoneware with a raw, speckled foot. Each one a little different.', ['200 ml each', 'Dishwasher safe'], { added: 20, badge: 'Bestseller' }),
  P('everyday-mug', 'Everyday mug', 'kitchen', 'mug', 690, ['white', 'ink', 'sand'], null, 'A heavy, wide-handled mug for the first coffee of the day.', ['350 ml', 'Microwave safe'], { added: 40 }),
  P('glazed-plates', 'Glazed plates, set of 4', 'kitchen', 'plates', 2890, ['slate', 'bone'], null, 'Reactive-glaze dinner plates in deep sea tones.', ['Ø 27 cm', 'Dishwasher safe'], { added: 3, badge: 'New' }),
  P('steel-bottle', 'Insulated steel bottle', 'kitchen', 'bottle', 1490, ['moss', 'ink', 'white'], ['500 ml', '750 ml'], 'Keeps drinks cold for 24 hours or hot for 12. Powder-coated, leak-proof lid.', ['Double-wall steel', 'BPA-free lid'], { added: 15, priceBySize: { '750 ml': 300 } }),
  P('cotton-tee', 'Heavyweight cotton tee', 'wear', 'tee', 1290, ['white', 'black', 'sand'], ['S', 'M', 'L', 'XL'], 'A boxy tee in 240 g organic cotton that keeps its shape.', ['100% organic cotton', 'Relaxed fit'], { added: 25, badge: 'Bestseller' }),
  P('open-knit-top', 'Open-knit top', 'wear', 'knit', 2490, ['bone', 'sand'], ['S', 'M', 'L'], 'A loose cotton knit with a fringed hem for warm evenings.', ['100% cotton', 'Hand wash'], { added: 6 }),
  P('canvas-tote', 'Canvas tote', 'wear', 'tote', 990, ['natural', 'black'], null, 'A heavy canvas tote with long handles and an inner pocket.', ['16 oz canvas', '40 x 38 cm'], { added: 35, compareAt: 1290 }),
  P('day-pack', 'Everyday backpack', 'wear', 'backpack', 4290, ['ink', 'black'], null, 'A water-resistant 20 L pack with a padded laptop sleeve.', ['Fits 15" laptop', 'Recycled nylon'], { added: 18 }),
  P('field-watch', 'Minimal field watch', 'objects', 'watch', 7900, ['white', 'black'], ['38 mm', '41 mm'], 'A quiet, legible watch with a silicone strap and sapphire-coated glass.', ['5 ATM water resistant', 'Two-year warranty'], { added: 9 }),
  P('studio-headphones', 'Studio headphones', 'objects', 'headphones', 8900, ['black', 'slate'], null, 'Closed-back wireless headphones with 40 hours of battery.', ['Bluetooth 5.3', 'USB-C charging'], { added: 11, compareAt: 10900 }),
  P('face-serum', 'Daily face serum', 'objects', 'serum', 1450, ['natural'], ['30 ml', '50 ml'], 'A light niacinamide serum in an amber glass bottle.', ['Fragrance-free', 'Vegan formula'], { added: 1, badge: 'New', priceBySize: { '50 ml': 550 } }),
];

export const productById = (id) => PRODUCTS.find((p) => p.id === id);
export const variantKey = (colour, size) => `${colour}|${size ?? '-'}`;
export const unitPrice = (p, size) => p.price + (p.priceBySize?.[size] ?? 0);
export const variantsOf = (p) => p.colours.flatMap(([c]) => (p.sizes ?? [null]).map((s) => variantKey(c, s)));
export const totalStock = (p, stock) => variantsOf(p).reduce((n, k) => n + (stock[p.id]?.[k] ?? 0), 0);

export function cartTotals(cart) {
  const subtotal = cart.reduce((n, l) => n + l.price * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= STORE.freeShippingOver ? 0 : STORE.shipping;
  return { subtotal, shipping, total: subtotal + shipping };
}

export const ORDER_STATUSES = ['Paid', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

const CUSTOMERS = [
  ['Aarav Khanna', 'Pune'], ['Mei Lin', 'Bengaluru'], ['Jonah Pereira', 'Goa'], ['Simran Gill', 'Chandigarh'], ['Elif Demir', 'Mumbai'],
  ['Kofi Mensah', 'Hyderabad'], ['Nisha Menon', 'Kochi'], ['Lars Holm', 'Delhi'], ['Zara Ahmed', 'Lucknow'], ['Tara Bose', 'Kolkata'],
  ['Ravi Shankar', 'Chennai'], ['Ines Duarte', 'Jaipur'],
];

// Small deterministic random so the seeded data looks the same on every reset.
function rng(seedN) {
  let s = seedN;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function seed() {
  const r = rng(42);
  const stock = {};
  PRODUCTS.forEach((p) => {
    stock[p.id] = {};
    variantsOf(p).forEach((k, i) => { stock[p.id][k] = Math.floor(r() * 18) + (i % 4 === 3 ? 0 : 2); });
  });
  // A couple of deliberate low-stock and sold-out variants for the inventory screen.
  stock['lounge-chair'][variantKey('Moss', null)] = 2;
  stock['cotton-tee'][variantKey('Black', 'M')] = 0;
  stock['field-watch'][variantKey('Black', '41 mm')] = 1;

  const customers = CUSTOMERS.map(([name, city], i) => ({ id: 'c' + i, name, city, email: name.toLowerCase().replace(/\W+/g, '.') + '@example.com', joined: Date.now() - (60 + i * 21) * 86400000 }));
  const orders = [];
  for (let i = 0; i < 46; i++) {
    const daysAgo = Math.floor(r() * 30);
    const c = customers[Math.floor(r() * customers.length)];
    const n = 1 + Math.floor(r() * 3);
    const items = Array.from({ length: n }, () => {
      const p = PRODUCTS[Math.floor(r() * PRODUCTS.length)];
      const size = p.sizes ? p.sizes[Math.floor(r() * p.sizes.length)] : null;
      return { productId: p.id, name: p.name, photo: p.photo, colour: p.colours[0][0], size, qty: 1 + Math.floor(r() * 2), price: unitPrice(p, size) };
    });
    const t = cartTotals(items);
    const status = daysAgo > 7 ? (r() > 0.93 ? 'Cancelled' : 'Delivered') : daysAgo > 3 ? 'Shipped' : daysAgo > 1 ? 'Packed' : 'Paid';
    orders.push({ id: uid('O'), number: 'NC-' + (10180 + i), customerId: c.id, customer: { name: c.name, email: c.email, city: c.city }, items, ...t, status, placedAt: Date.now() - daysAgo * 86400000 - Math.floor(r() * 36e6), mine: false });
  }
  orders.sort((a, b) => b.placedAt - a.placedAt);
  return { stock, customers, orders, cart: [], adminSignedIn: false };
}

export const useShop = demoStore('store', seed, (set, get) => ({
  addToCart: (line) => set((s) => {
    const same = s.cart.find((l) => l.key === line.key);
    return { cart: same ? s.cart.map((l) => (l === same ? { ...l, qty: l.qty + line.qty } : l)) : [...s.cart, line] };
  }),
  setQty: (key, qty) => set((s) => ({ cart: qty < 1 ? s.cart.filter((l) => l.key !== key) : s.cart.map((l) => (l.key === key ? { ...l, qty } : l)) })),
  placeOrder: (details) => {
    const { cart, orders, stock } = get();
    const t = cartTotals(cart);
    const order = {
      id: uid('O'), number: 'NC-' + (10180 + orders.length + 1), customerId: 'you',
      customer: { name: details.name, email: details.email, city: details.city }, address: details,
      items: cart.map(({ productId, name, photo, colour, size, qty, price }) => ({ productId, name, photo, colour, size, qty, price })),
      ...t, status: 'Paid', placedAt: Date.now(), mine: true, delivery: details.delivery,
    };
    const next = structuredClone(stock);
    cart.forEach((l) => { const k = variantKey(l.colour, l.size); next[l.productId][k] = Math.max(0, (next[l.productId][k] ?? 0) - l.qty); });
    set({ orders: [order, ...orders], cart: [], stock: next });
    return order;
  },
  setOrderStatus: (id, status) => set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),
  setStock: (pid, key, n) => set((s) => ({ stock: { ...s.stock, [pid]: { ...s.stock[pid], [key]: Math.max(0, n) } } })),
  signIn: () => set({ adminSignedIn: true }),
  signOut: () => set({ adminSignedIn: false }),
}));
