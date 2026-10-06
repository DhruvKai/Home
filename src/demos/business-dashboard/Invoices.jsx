import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Anchor, ArrowLeft, CheckCircle, Invoice, MagnifyingGlass, PaperPlaneTilt, Plus, Printer, Trash } from '@phosphor-icons/react';
import { cx, fmtDate, isoDay, money } from '../../lib/format';
import { Empty } from '../_shared/bits';
import { toast } from '../_shared/toast';
import { OPS, StatusPill } from './Dashboard';
import { INVOICE_STATUSES, invoiceTotals, useOps } from './data';

export function InvoiceList() {
  const { invoices, customers } = useOps();
  const [status, setStatus] = useState('All');
  const [q, setQ] = useState('');
  const name = (id) => customers.find((c) => c.id === id)?.name ?? '';
  const list = invoices.filter((i) => (status === 'All' || i.status === status) && (i.number + name(i.customerId)).toLowerCase().includes(q.toLowerCase()));
  const sum = (s) => invoices.filter((i) => i.status === s).reduce((n, i) => n + invoiceTotals(i).total, 0);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Link to={`${OPS}/invoices/new`} className="btn btn-primary btn-sm"><Plus size={16} weight="bold" /> New invoice</Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {INVOICE_STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(status === s ? 'All' : s)} aria-pressed={status === s} className={cx('card p-4 text-left transition-colors', status === s && 'border-accent')}>
            <p className="text-sm text-muted">{s}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{money(sum(s))}</p>
            <p className="text-xs text-muted">{invoices.filter((i) => i.status === s).length} invoices</p>
          </button>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input w-64 py-2 pl-9 text-sm" placeholder="Number or customer" aria-label="Search invoices" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {status !== 'All' && <button className="chip chip-on py-1.5" onClick={() => setStatus('All')}>{status}, clear</button>}
      </div>
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm" data-testid="invoice-table">
          <thead className="text-left text-muted"><tr>{['Number', 'Customer', 'Issued', 'Due', 'Total', 'Status'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {list.map((i) => (
              <tr key={i.id} className="border-t border-line hover:bg-sunken">
                <td className="px-4 py-3"><Link to={`${OPS}/invoices/${i.id}`} className="font-mono font-medium hover:underline">{i.number}</Link></td>
                <td className="px-4 py-3">{name(i.customerId)}</td>
                <td className="px-4 py-3 text-muted">{fmtDate(i.issued)}</td>
                <td className="px-4 py-3 text-muted">{fmtDate(i.due)}</td>
                <td className="px-4 py-3 tabular-nums">{money(invoiceTotals(i).total)}</td>
                <td className="px-4 py-3"><StatusPill s={i.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <Empty icon={Invoice} title="No invoices match" />}
      </div>
    </>
  );
}

export function InvoiceNew() {
  const { customers, products, settings, addInvoice } = useOps();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [v, setV] = useState({
    customerId: params.get('customer') ?? '', issued: isoDay(0), due: isoDay(settings.terms), notes: '', taxRate: settings.taxRate,
    lines: [{ productId: products[0].id, name: products[0].name, qty: 1, price: products[0].price }],
  });
  const [err, setErr] = useState('');
  const t = invoiceTotals(v);
  const setLine = (i, patch) => setV({ ...v, lines: v.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) });

  function save(status) {
    if (!v.customerId) return setErr('Choose a customer.');
    if (!v.lines.length || v.lines.some((l) => l.qty < 1)) return setErr('Each line needs a quantity of at least 1.');
    const inv = addInvoice({ ...v, status });
    toast(status === 'Draft' ? `${inv.number} saved as draft` : `${inv.number} sent`);
    navigate(`${OPS}/invoices/${inv.id}`);
  }

  return (
    <>
      <Link to={`${OPS}/invoices`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeft size={14} /> Invoices</Link>
      <h1 className="mt-3 text-2xl font-semibold">New invoice</h1>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="card p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="field sm:col-span-3"><label htmlFor="ni-cust">Customer</label>
              <select id="ni-cust" className="input" value={v.customerId} onChange={(e) => { setV({ ...v, customerId: e.target.value }); setErr(''); }}>
                <option value="">Choose a customer</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="field"><label htmlFor="ni-issued">Issue date</label><input id="ni-issued" type="date" className="input" value={v.issued} onChange={(e) => setV({ ...v, issued: e.target.value })} /></div>
            <div className="field"><label htmlFor="ni-due">Due date</label><input id="ni-due" type="date" className="input" value={v.due} onChange={(e) => setV({ ...v, due: e.target.value })} /></div>
            <div className="field"><label htmlFor="ni-tax">GST %</label><input id="ni-tax" type="number" min="0" max="28" className="input" value={v.taxRate} onChange={(e) => setV({ ...v, taxRate: Number(e.target.value) })} /></div>
          </div>

          <p className="label mt-8">Line items</p>
          <div className="mt-2 grid gap-2">
            {v.lines.map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto] gap-2 rounded-[10px] border border-line p-3 sm:grid-cols-[1fr_80px_120px_110px_auto] sm:items-center sm:border-0 sm:p-0">
                <select className="input col-span-2 text-sm sm:col-span-1" aria-label={`Item ${i + 1}`} value={l.productId}
                  onChange={(e) => { const p = products.find((x) => x.id === e.target.value); setLine(i, { productId: p.id, name: p.name, price: p.price }); }}>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" min="1" className="input text-sm tabular-nums" aria-label={`Quantity for item ${i + 1}`} value={l.qty} onChange={(e) => setLine(i, { qty: Number(e.target.value) })} />
                <input type="number" min="0" className="input text-sm tabular-nums" aria-label={`Unit price for item ${i + 1}`} value={l.price} onChange={(e) => setLine(i, { price: Number(e.target.value) })} />
                <p className="text-right text-sm font-medium tabular-nums">{money(l.qty * l.price)}</p>
                <button className="grid size-9 place-items-center justify-self-end rounded-full text-muted hover:bg-sunken hover:text-bad disabled:opacity-30" onClick={() => setV({ ...v, lines: v.lines.filter((_, j) => j !== i) })} disabled={v.lines.length === 1} aria-label={`Remove item ${i + 1}`}><Trash size={16} /></button>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm mt-3" onClick={() => setV({ ...v, lines: [...v.lines, { productId: products[0].id, name: products[0].name, qty: 1, price: products[0].price }] })}><Plus size={14} /> Add line</button>
          <div className="field mt-6"><label htmlFor="ni-notes">Notes <span className="font-normal text-muted">(shown on the invoice)</span></label><textarea id="ni-notes" className="input min-h-20" value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} placeholder="Thanks for your business." /></div>
        </div>

        <aside className="card h-fit p-5 sm:p-6">
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{money(t.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">GST ({v.taxRate}%)</dt><dd className="tabular-nums">{money(t.tax)}</dd></div>
            <div className="mt-1 flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>Total</dt><dd className="tabular-nums">{money(t.total)}</dd></div>
          </dl>
          {err && <p className="error mt-4" role="alert">{err}</p>}
          <div className="mt-6 grid gap-2">
            <button className="btn btn-primary" onClick={() => save('Sent')}><PaperPlaneTilt size={16} /> Send invoice</button>
            <button className="btn btn-ghost" onClick={() => save('Draft')}>Save as draft</button>
          </div>
          <p className="help mt-3">Sending is simulated. In a real build the customer gets a PDF by email with a payment link.</p>
        </aside>
      </div>
    </>
  );
}

export function InvoiceView() {
  const { id } = useParams();
  const { invoices, customers, settings, setInvoiceStatus } = useOps();
  const inv = invoices.find((i) => i.id === id);
  if (!inv) return <Empty icon={Invoice} title="Invoice not found" action={<Link to={`${OPS}/invoices`} className="btn btn-ghost btn-sm">All invoices</Link>} />;
  const c = customers.find((x) => x.id === inv.customerId);
  const t = invoiceTotals(inv);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3" data-no-print>
        <Link to={`${OPS}/invoices`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeft size={14} /> Invoices</Link>
        <div className="flex flex-wrap gap-2">
          {inv.status !== 'Paid' && <button className="btn btn-primary btn-sm" onClick={() => { setInvoiceStatus(inv.id, 'Paid'); toast(`${inv.number} marked paid`); }}><CheckCircle size={16} /> Mark paid</button>}
          {inv.status === 'Draft' && <button className="btn btn-ghost btn-sm" onClick={() => { setInvoiceStatus(inv.id, 'Sent'); toast(`${inv.number} sent`); }}><PaperPlaneTilt size={16} /> Send</button>}
          <button className="btn btn-ghost btn-sm" onClick={() => window.print()}><Printer size={16} /> Print</button>
        </div>
      </div>
      <article className="card mx-auto mt-6 max-w-3xl p-6 sm:p-10 print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-lg font-semibold"><Anchor size={20} className="text-accent" />{settings.company}</p>
            <p className="mt-1 text-sm text-muted">{settings.email}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold">Invoice</p>
            <p className="font-mono text-sm">{inv.number}</p>
            <div className="mt-2"><StatusPill s={inv.status} /></div>
          </div>
        </header>
        <div className="mt-10 grid gap-6 text-sm sm:grid-cols-3">
          <div><p className="text-muted">Billed to</p><p className="mt-1 font-medium">{c?.name}</p><p>{c?.contact}</p><p className="text-muted">{c?.email}</p></div>
          <div><p className="text-muted">Issued</p><p className="mt-1 font-medium">{fmtDate(inv.issued, { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
          <div><p className="text-muted">Due</p><p className="mt-1 font-medium">{fmtDate(inv.due, { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
        </div>
        <table className="mt-10 w-full text-sm">
          <thead className="text-left text-muted"><tr><th className="pb-2 font-medium">Item</th><th className="pb-2 text-right font-medium">Qty</th><th className="pb-2 text-right font-medium">Rate</th><th className="pb-2 text-right font-medium">Amount</th></tr></thead>
          <tbody>
            {inv.lines.map((l, i) => (
              <tr key={i} className="border-t border-line"><td className="py-2.5">{l.name}</td><td className="py-2.5 text-right tabular-nums">{l.qty}</td><td className="py-2.5 text-right tabular-nums">{money(l.price)}</td><td className="py-2.5 text-right tabular-nums">{money(l.qty * l.price)}</td></tr>
            ))}
          </tbody>
        </table>
        <dl className="ml-auto mt-6 grid max-w-xs gap-1.5 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{money(t.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">GST ({inv.taxRate}%)</dt><dd className="tabular-nums">{money(t.tax)}</dd></div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>Total due</dt><dd className="tabular-nums">{money(t.total)}</dd></div>
        </dl>
        {inv.notes && <p className="mt-10 text-sm text-muted">{inv.notes}</p>}
        <p className="mt-10 border-t border-line pt-4 text-xs text-muted">Sample invoice from a concept demo. Not a real company or tax document.</p>
      </article>
    </>
  );
}
