import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from './StatCard';

function ChartTooltip({ active, payload, label, prefix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="mb-1 text-xs font-medium text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-900">
        {prefix}{payload[0].value}
      </p>
    </div>
  );
}

export function PostsAreaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="postsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2.5} fill="url(#postsGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip prefix="ETB " />} />
        <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const STATUS_LABELS = {
  draft: 'Draft', pending: 'Pending', approved: 'Approved', rejected: 'Rejected',
};

function PieLegend({ items, colors }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
      {items.map((item, index) => (
        <div key={`${item.name}-${index}`} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: colors[index % colors.length] }}
          />
          <span className="truncate">{item.name}</span>
          <span className="ml-auto font-semibold text-slate-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function StatusPieChart({ data }) {
  const chartData = data
    .filter((d) => d.value > 0)
    .map((d) => ({ ...d, name: STATUS_LABELS[d.name] || d.name }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={84}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <PieLegend items={chartData} colors={CHART_COLORS} />
    </div>
  );
}

export function TypePieChart({ data }) {
  const chartData = data.map((d) => ({
    ...d,
    name: d.name === 'buyer' ? 'Buyer Requests' : 'Seller Listings',
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={42} outerRadius={78} dataKey="value">
            {chartData.map((_, i) => (
              <Cell key={i} fill={i === 0 ? '#0d9488' : '#3b82f6'} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <PieLegend items={chartData} colors={['#0d9488', '#3b82f6']} />
    </div>
  );
}
