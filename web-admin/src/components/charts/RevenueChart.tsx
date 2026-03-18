import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface RevenueChartProps {
  data: Array<{ label: string; sales: number; bv: number }>;
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const sorted = [...data].sort((a, b) => a.label.localeCompare(b.label));
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={sorted} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorBv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" tickFormatter={formatCurrency} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0f172a',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
          }}
        />
        <Area type="monotone" dataKey="sales" stroke="#6366F1" fill="url(#colorSales)" />
        <Area type="monotone" dataKey="bv" stroke="#10B981" fill="url(#colorBv)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};
