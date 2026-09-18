import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Row } from '../../types';
import { h } from '../../utils/formatters';

const tooltipStyle = { backgroundColor: '#10232d', border: '1px solid rgba(91,166,189,.55)', borderRadius: 8, color: '#edf4f3', boxShadow: '0 12px 30px rgba(0,0,0,.28)' };

export function BatteryChart({ rows }: { rows: Row[] }) {
  return <div className="panel h-80 p-5">
    <p className="font-semibold">Battery state timeline</p>
    <p className="muted text-sm">State of charge after each hour</p>
    <ResponsiveContainer width="100%" height="86%">
      <LineChart data={rows}>
        <XAxis dataKey="hour" tickFormatter={h} />
        <YAxis />
        <Tooltip labelFormatter={(x) => h(Number(x))} contentStyle={tooltipStyle} labelStyle={{ color: '#9fb8c0', fontWeight: 600, marginBottom: 4 }} itemStyle={{ color: '#8ed7c5', fontWeight: 700 }} cursor={{ stroke: '#9fb8c0', strokeDasharray: '4 4' }} />
        <Line dataKey="battery_energy_after_kwh" name="Battery energy (kWh)" stroke="#8ed7c5" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>;
}
