import React from 'react'
import clsx from 'clsx'

export default function StatCard({ label, value, change, changeType = 'up', icon: Icon, accent }) {
  return (
    <div className="card animate-fade-up">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-muted uppercase tracking-widest">{label}</span>
        {Icon && (
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', accent || 'bg-accent/10')}>
            <Icon size={16} className="text-accent" />
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-text tracking-tight">{value}</div>
      {change && (
        <div className={clsx('text-xs font-medium mt-2', changeType === 'up' ? 'text-green' : 'text-red')}>
          {changeType === 'up' ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  )
}
