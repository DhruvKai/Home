import { isoDay, uid } from '../../lib/format';
import { demoStore } from '../_shared/demoStore';

// Fictional facility-maintenance company using Harbor Ops. All records are sample data.
export const TEAM_SEED = [
  { id: 'u1', name: 'Maya Fernandes', role: 'Owner', email: 'maya@harborops.demo' },
  { id: 'u2', name: 'Dev Patel', role: 'Field technician', email: 'dev@harborops.demo' },
  { id: 'u3', name: 'Aisha Rahman', role: 'Field technician', email: 'aisha@harborops.demo' },
  { id: 'u4', name: 'Tom Becker', role: 'Office manager', email: 'tom@harborops.demo' },
];

export const PRODUCTS_SEED = [
  { id: 'p1', name: 'AC service visit', sku: 'SRV-AC', type: 'Service', price: 2400, unit: 'visit' },
  { id: 'p2', name: 'Deep clean, office', sku: 'SRV-DC', type: 'Service', price: 8500, unit: 'visit' },
  { id: 'p3', name: 'Plumbing call-out', sku: 'SRV-PL', type: 'Service', price: 1800, unit: 'visit' },
  { id: 'p4', name: 'Electrical inspection', sku: 'SRV-EL', type: 'Service', price: 3200, unit: 'visit' },
  { id: 'p5', name: 'Monthly maintenance plan', sku: 'PLN-MO', type: 'Plan', price: 14500, unit: 'month' },
  { id: 'p6', name: 'Labour, per hour', sku: 'LAB-HR', type: 'Service', price: 650, unit: 'hour' },
  { id: 'p7', name: 'HEPA filter', sku: 'PRT-HF', type: 'Part', price: 1250, unit: 'each', stock: 34 },
  { id: 'p8', name: 'LED panel, 2x2 ft', sku: 'PRT-LP', type: 'Part', price: 980, unit: 'each', stock: 6 },
  { id: 'p9', name: 'Mixer tap', sku: 'PRT-MT', type: 'Part', price: 2150, unit: 'each', stock: 11 },
  { id: 'p10', name: 'Smoke detector', sku: 'PRT-SD', type: 'Part', price: 1450, unit: 'each', stock: 3 },
];

const CUSTOMER_SEED = [
  ['Saltwater Café', 'Leena Joseph', 'Food and drink'], ['Kestrel Dental', 'Dr. Omar Siddiqui', 'Healthcare'], ['Brightline Studio', 'Pooja Arora', 'Office'],
  ['Pinecrest Apartments', 'Neil D\'Souza', 'Residential'], ['Tidewater Logistics', 'Farah Khan', 'Warehouse'], ['Copper Kettle Bakery', 'Anton Weber', 'Food and drink'],
  ['Northwind Coworking', 'Ritu Malhotra', 'Office'], ['Lumen Optics', 'Karan Bhatt', 'Retail'], ['Greenleaf School', 'Sister Agnes Paul', 'Education'],
  ['Atlas Fitness', 'Marco Silva', 'Fitness'], ['Harbourview Hotel', 'Ingrid Olsen', 'Hospitality'], ['Mosaic Books', 'Yusuf Ali', 'Retail'],
  ['Cedar & Co. Law', 'Ananya Mukherjee', 'Office'], ['Bluefin Sushi', 'Kenji Mori', 'Food and drink'],
];

export const TASK_STATUSES = [['todo', 'To do'], ['in-progress', 'In progress'], ['done', 'Done']];
export const INVOICE_STATUSES = ['Draft', 'Sent', 'Paid', 'Overdue'];

function rng(seedN) {
  let s = seedN;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export function invoiceTotals(inv, taxRate = 18) {
  const subtotal = inv.lines.reduce((n, l) => n + l.qty * l.price, 0);
  const tax = Math.round((subtotal * (inv.taxRate ?? taxRate)) / 100);
  return { subtotal, tax, total: subtotal + tax };
}

function seed() {
  const r = rng(7);
  const customers = CUSTOMER_SEED.map(([name, contact, sector], i) => ({
    id: 'c' + i, name, contact, sector, email: contact.toLowerCase().replace(/^dr\. |^sister /, '').replace(/[^a-z]+/g, '.') + '@example.com',
    phone: 'Sample number', city: ['Riverton', 'Northgate', 'Old Mill', 'Bayside'][i % 4], since: isoDay(-Math.floor(40 + r() * 600)),
    plan: i % 3 === 0 ? 'Monthly plan' : 'Pay per visit', notes: '',
  }));

  // The two newest customers joined this month.
  customers[12].since = isoDay(-18);
  customers[13].since = isoDay(-5);

  // Invoices spread across the last 12 months, with slow growth and a few unpaid recent ones.
  const invoices = [];
  const today = new Date();
  for (let m = 11; m >= 0; m--) {
    const first = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const lastDay = m === 0 ? today.getDate() : new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const count = (m === 0 ? Math.max(2, Math.round(lastDay / 4)) : 6 + Math.round((11 - m) * 0.45)) + Math.floor(r() * 2);
    for (let k = 0; k < count; k++) {
      const day = new Date(first.getFullYear(), first.getMonth(), 1 + Math.floor(r() * lastDay));
      const daysAgo = Math.round((today - day) / 86400000);
      const pool = m === 0 ? customers : customers.slice(0, 12);
      const c = pool[Math.floor(r() * pool.length)];
      const lines = Array.from({ length: 1 + Math.floor(r() * 3) }, () => {
        const p = PRODUCTS_SEED[Math.floor(r() * PRODUCTS_SEED.length)];
        return { productId: p.id, name: p.name, qty: p.unit === 'hour' ? 2 + Math.floor(r() * 4) : 1 + Math.floor(r() * 2), price: p.price };
      });
      const status = daysAgo > 30 ? (r() > 0.05 ? 'Paid' : 'Overdue') : daysAgo > 15 ? (r() > 0.35 ? 'Paid' : 'Overdue') : r() > 0.55 ? 'Sent' : 'Paid';
      invoices.push({ id: uid('I'), number: '', customerId: c.id, issued: isoDay(-daysAgo), due: isoDay(-daysAgo + 15), lines, taxRate: 18, status, notes: '' });
    }
  }
  invoices.sort((a, b) => b.issued.localeCompare(a.issued));
  invoices.forEach((inv, i) => { inv.number = 'INV-' + (1980 + invoices.length - i); });

  const titles = ['Quarterly AC service', 'Replace HEPA filters', 'Leak under kitchen sink', 'Fire safety inspection', 'Deep clean before audit', 'Swap ceiling LED panels', 'Install smoke detectors', 'Check backup generator', 'Fix tripping breaker', 'Monthly maintenance round'];
  const tasks = [];
  for (let i = 0; i < 26; i++) {
    const offset = i < 4 ? 0 : Math.floor(r() * 14) - 4;
    const c = customers[Math.floor(r() * customers.length)];
    tasks.push({
      id: uid('T'), title: titles[i % titles.length], customerId: c.id, assignee: TEAM_SEED[1 + (i % 3)].id, date: isoDay(offset),
      time: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'][i % 6], priority: ['Low', 'Normal', 'High'][Math.floor(r() * 3)],
      status: offset < 0 ? 'done' : offset === 0 ? (i % 3 === 0 ? 'in-progress' : i % 3 === 1 ? 'done' : 'todo') : 'todo',
    });
  }
  const now = Date.now();
  const paidInv = invoices.find((i) => i.status === 'Paid');
  const overdueInv = invoices.find((i) => i.status === 'Overdue');
  const cname = (id) => customers.find((c) => c.id === id).name;
  const notifications = [
    { id: uid('N'), kind: 'invoice', text: `${paidInv.number} was paid by ${cname(paidInv.customerId)}`, at: now - 36e5 * 1.5, read: false },
    { id: uid('N'), kind: 'task', text: 'Aisha Rahman completed "Replace HEPA filters"', at: now - 36e5 * 3, read: false },
    { id: uid('N'), kind: 'stock', text: 'Smoke detector is low on stock (3 left)', at: now - 36e5 * 5, read: false },
    { id: uid('N'), kind: 'customer', text: 'New customer: Bluefin Sushi', at: now - 36e5 * 26, read: true },
    { id: uid('N'), kind: 'invoice', text: `${overdueInv ? `${overdueInv.number} from ${cname(overdueInv.customerId)}` : 'An invoice'} is overdue`, at: now - 36e5 * 30, read: true },
  ];
  return {
    customers, invoices, tasks, notifications,
    products: PRODUCTS_SEED,
    team: TEAM_SEED,
    settings: { company: 'Harbor Ops Facility Services', email: 'office@harborops.demo', taxRate: 18, terms: 15, notifyEmail: true, notifySms: false, weeklyReport: true },
  };
}

const note = (set, kind, text) => set((s) => ({ notifications: [{ id: uid('N'), kind, text, at: Date.now(), read: false }, ...s.notifications] }));

export const useOps = demoStore('ops', seed, (set, get) => ({
  addInvoice: (inv) => {
    const number = 'INV-' + (Math.max(...get().invoices.map((i) => Number(i.number.slice(4)))) + 1);
    const invoice = { ...inv, id: uid('I'), number };
    set((s) => ({ invoices: [invoice, ...s.invoices] }));
    const c = get().customers.find((x) => x.id === inv.customerId);
    note(set, 'invoice', `${number} ${inv.status === 'Draft' ? 'saved as draft' : 'sent'} to ${c?.name}`);
    return invoice;
  },
  setInvoiceStatus: (id, status) => {
    const inv = get().invoices.find((i) => i.id === id);
    set((s) => ({ invoices: s.invoices.map((i) => (i.id === id ? { ...i, status } : i)) }));
    note(set, 'invoice', `${inv.number} marked ${status.toLowerCase()}`);
  },
  addCustomer: (c) => {
    const customer = { ...c, id: uid('c'), since: isoDay(0), phone: 'Sample number', notes: '' };
    set((s) => ({ customers: [customer, ...s.customers] }));
    note(set, 'customer', `New customer: ${c.name}`);
    return customer;
  },
  updateCustomer: (id, patch) => set((s) => ({ customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
  addTask: (t) => {
    set((s) => ({ tasks: [...s.tasks, { ...t, id: uid('T') }] }));
    note(set, 'task', `New task: ${t.title}`);
  },
  setTaskStatus: (id, status) => {
    const t = get().tasks.find((x) => x.id === id);
    set((s) => ({ tasks: s.tasks.map((x) => (x.id === id ? { ...x, status } : x)) }));
    if (status === 'done') note(set, 'task', `"${t.title}" marked done`);
  },
  updateProduct: (id, patch) => set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  toggleRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n)) })),
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
  invite: (m) => {
    set((s) => ({ team: [...s.team, { ...m, id: uid('u') }] }));
    note(set, 'customer', `${m.name} was invited as ${m.role.toLowerCase()}`);
  },
}));
