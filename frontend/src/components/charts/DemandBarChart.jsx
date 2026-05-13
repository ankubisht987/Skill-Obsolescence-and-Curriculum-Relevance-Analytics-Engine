import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'

const COLORS = ['#3b82f6','#a855f7','#22c55e','#f59e0b','#06b6d4','#ef4444','#8b5cf6','#10b981','#f97316','#ec4899']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs">
      <div className="font-semibold text-text mb-1">{label}</div>
      <div className="text-accent">{payload[0].value} listings</div>
    </div>
  )
}

export default function DemandBarChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
        <CartesianGrid stroke="#1e2d45" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="skill" tick={{ fill: '#6b7e99', fontSize: 10, fontFamily: 'Syne' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7e99', fontSize: 10, fontFamily: 'Syne' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
        <Bar dataKey="count" radius={[4,4,0,0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
