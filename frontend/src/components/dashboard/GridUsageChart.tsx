import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Row } from '../../types';
import { h } from '../../utils/formatters';

const tooltipStyle = { backgroundColor: '#10232d', border: '1px solid rgba(91,166,189,.55)', borderRadius: 8, color: '#edf4f3', boxShadow: '0 12px 30px rgba(0,0,0,.28)' };

export function GridUsageChart({ rows }: { rows: Row[] }) {
  return <div className="panel h-80 p-5">
    <p className="font-semibold">Energy source mix</p>
    <p className="muted text-sm">Grid import across the 24-hour plan</p>
    <ResponsiveContainer width="100%" height="86%">
      <AreaChart data={rows}>
        <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#36c8ff" stopOpacity=".8" /><stop offset="1" stopColor="#36c8ff" stopOpacity=".05" /></linearGradient></defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="hour" tickFormatter={h} />
        <YAxis />
        <Tooltip labelFormatter={(x) => h(Number(x))} contentStyle={tooltipStyle} labelStyle={{ color: '#9fb8c0', fontWeight: 600, marginBottom: 4 }} itemStyle={{ color: '#5ba6bd', fontWeight: 700 }} cursor={{ stroke: '#9fb8c0', strokeDasharray: '4 4' }} />
        <Area dataKey="grid_kwh" name="Grid import (kWh)" stroke="#5ba6bd" fill="url(#g)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>;
}
