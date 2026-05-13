import React from 'react'
import clsx from 'clsx'

export default function ProgressBar({ value = 0, max = 100, color, label, showValue = true }) {
  const pct = Math.min((value / max) * 100, 100)
  const auto = pct > 65 ? '#22c55e' : pct > 35 ? '#f59e0b' : '#ef4444'
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-muted">{label}</span>}
          {showValue && <span className="text-xs font-semibold text-text">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-1.5 bg-bg rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color || auto }}
        />
      </div>
    </div>
  )
}
