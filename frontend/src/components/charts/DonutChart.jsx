import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs">
      <div className="font-semibold text-text">{payload[0].name}</div>
      <div style={{ color: payload[0].payload.fill }}>{payload[0].value} skills</div>
    </div>
  )
}

export default function DonutChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={85}
          dataKey="value" paddingAngle={3}>
          {data.map((entry, i) => <Cell key={i} fill={entry.fill} stroke="transparent" />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: 'Syne', color: '#6b7e99' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
