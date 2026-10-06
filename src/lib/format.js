// Formatting helpers shared by the demos. All prices are sample data in Indian rupees.
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const money = (n) => inr.format(Math.round(n));

// Plain yyyy-mm-dd strings are read as local dates (not UTC).
export const toDate = (d) => (typeof d === 'string' && d.length === 10 ? new Date(d + 'T00:00') : new Date(d));
export const fmtDate = (d, opts = { day: 'numeric', month: 'short' }) => toDate(d).toLocaleDateString('en-IN', opts);

export const fmtTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${suffix}`;
};

// ISO date (yyyy-mm-dd) offset from today, so seeded data always looks current.
export const isoDay = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const uid = (prefix = '') => prefix + Math.random().toString(36).slice(2, 8).toUpperCase();

export const cx = (...c) => c.filter(Boolean).join(' ');
