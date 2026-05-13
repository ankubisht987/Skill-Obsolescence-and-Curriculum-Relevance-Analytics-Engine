import React from 'react'
import clsx from 'clsx'

const STATUS_MAP = {
  rising:   'badge-rising',
  stable:   'badge-stable',
  declining:'badge-declining',
  hot:      'badge-hot',
  emerging: 'badge-emerging',
  missing:  'badge-declining',
}

export default function SkillBadge({ skill, status = 'stable', onClick }) {
  return (
    <span
      className={clsx(STATUS_MAP[status] || 'badge-stable', onClick && 'cursor-pointer hover:opacity-80')}
      onClick={onClick}
    >
      {skill}
    </span>
  )
}
