import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const TREND_DATA = [
  { month: 'Jan', 'AI/ML': 65, 'Web Dev': 80, 'DevOps': 72 },
  { month: 'Feb', 'AI/ML': 70, 'Web Dev': 79, 'DevOps': 75 },
  { month: 'Mar', 'AI/ML': 75, 'Web Dev': 81, 'DevOps': 77 },
  { month: 'Apr', 'AI/ML': 82, 'Web Dev': 83, 'DevOps': 80 },
  { month: 'May', 'AI/ML': 89, 'Web Dev': 85, 'DevOps': 85 },
  { month: 'Jun', 'AI/ML': 97, 'Web Dev': 88, 'DevOps': 91 },
]

const COLORS = { 'AI/ML': '#3b82f6', 'Web Dev': '#a855f7', 'DevOps': '#22c55e' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs space-y-1">
      <div className="font-semibold text-text">{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function TrendLineChart({ data = TREND_DATA }) {
  const keys = Object.keys(data[0] || {}).filter(k => k !== 'month')
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
        <CartesianGrid stroke="#1e2d45" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#6b7e99', fontSize: 10, fontFamily: 'Syne' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7e99', fontSize: 10, fontFamily: 'Syne' }} axisLine={false} tickLine={false} domain={[50,100]} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: 'Syne', color: '#6b7e99' }} />
        {keys.map(k => (
          <Line key={k} type="monotone" dataKey={k} stroke={COLORS[k] || '#3b82f6'}
            strokeWidth={2} dot={{ r: 3, fill: COLORS[k] || '#3b82f6' }} activeDot={{ r: 5 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
