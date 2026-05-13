import React from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Legend, Tooltip
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs">
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}%</div>
      ))}
    </div>
  )
}

export default function SkillRadarChart({ userData = [], marketData = [] }) {
  const cats = ['AI/ML','Frontend','Backend','DevOps','Data','Security']
  const data = cats.map((cat, i) => ({
    subject: cat,
    user:    userData[i] || 0,
    market:  marketData[i] || 60,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid stroke="#1e2d45" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7e99', fontSize: 11, fontFamily: 'Syne' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: 'Syne', color: '#6b7e99' }} />
        <Radar name="Your Skills" dataKey="user"   stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
        <Radar name="Market Avg"  dataKey="market" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1}  />
      </RadarChart>
    </ResponsiveContainer>
  )
}
