// Recharts wrappers for the admin screens (loaded only in lazy admin chunks).
// Each chart is single-series: one accent hue, thin marks, recessive grid, hover tooltip and a table view.
import { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartBar, Table } from '@phosphor-icons/react';
import { cx } from '../../lib/format';

const axis = { stroke: 'var(--muted)', fontSize: 12, tickLine: false, axisLine: false };

function Tip({ active, payload, label, format, labelFormat }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[10px] border border-line bg-surface px-3 py-2 text-sm shadow-lg">
      <p className="text-muted">{labelFormat ? labelFormat(label) : label}</p>
      <p className="font-semibold text-fg">{format(payload[0].value)}</p>
    </div>
  );
}

export function ChartCard({ title, value, sub, rows, columns, children, className }) {
  const [table, setTable] = useState(false);
  return (
    <section className={cx('card p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {value && <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</p>}
          {sub && <p className="text-sm text-muted">{sub}</p>}
        </div>
        {rows && (
          <button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-sunken hover:text-fg" onClick={() => setTable(!table)} aria-label={table ? 'Show chart' : 'Show as table'} title={table ? 'Show chart' : 'Show as table'}>
            {table ? <ChartBar size={18} /> : <Table size={18} />}
          </button>
        )}
      </div>
      <div className="mt-4">
        {table && rows ? (
          <div className="max-h-64 overflow-auto">
            <table className="w-full text-sm">
              <thead><tr>{columns.map((c) => <th key={c} className="pb-2 text-left font-semibold text-muted">{c}</th>)}</tr></thead>
              <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-line">{r.map((c, j) => <td key={j} className="py-1.5 tabular-nums">{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        ) : children}
      </div>
    </section>
  );
}

export function TrendChart({ data, x, y, format, labelFormat, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="0" />
        <XAxis dataKey={x} {...axis} minTickGap={24} tickFormatter={labelFormat} />
        <YAxis {...axis} width={56} tickFormatter={(v) => format(v, true)} />
        <Tooltip content={<Tip format={format} labelFormat={labelFormat} />} cursor={{ stroke: 'var(--muted)', strokeWidth: 1 }} />
        <Area type="monotone" dataKey={y} stroke="var(--accent)" strokeWidth={2} fill="url(#trendFill)" activeDot={{ r: 5, stroke: 'var(--surface)', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Bars({ data, x, y, format, height = 240, horizontal }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap={horizontal ? 6 : '28%'}>
        <CartesianGrid horizontal={!horizontal} vertical={!!horizontal} stroke="var(--line)" />
        {horizontal ? (
          <>
            <XAxis type="number" {...axis} tickFormatter={(v) => format(v, true)} />
            <YAxis type="category" dataKey={x} {...axis} width={92} />
          </>
        ) : (
          <>
            <XAxis dataKey={x} {...axis} />
            <YAxis {...axis} width={56} tickFormatter={(v) => format(v, true)} />
          </>
        )}
        <Tooltip content={<Tip format={format} />} cursor={{ fill: 'var(--sunken)' }} />
        <Bar dataKey={y} fill="var(--accent)" radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Compact money for axes: ₹12k, ₹1.2L
export function inrShort(v) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(v >= 1000000 ? 0 : 1)}L`;
  if (v >= 1000) return `₹${Math.round(v / 1000)}k`;
  return `₹${v}`;
}
