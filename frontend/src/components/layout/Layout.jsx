import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Brain, Upload, BarChart3,
  MessageSquare, User, LogOut, Zap, ChevronLeft, ChevronRight,
  TrendingUp
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/analyze',  icon: Brain,           label: 'Skill Analyzer' },
  { to: '/datasets', icon: Upload,          label: 'Datasets'      },
  { to: '/chat',     icon: MessageSquare,   label: 'AI Advisor',  badge: 'AI' },
  { to: '/profile',  icon: User,            label: 'Profile'       },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden bg-bg bg-grid-dark">
      {/* Sidebar */}
      <aside className={clsx(
        'flex flex-col bg-surface border-r border-border transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-56'
      )}>
        {/* Logo */}
        <div className={clsx('flex items-center gap-3 p-4 border-b border-border', collapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-bold text-text leading-tight">Skill Obsolescence </div>
              <div className="text-[10px] text-muted font-mono">Python, React, NLP, GROQ</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-muted hover:text-text hover:bg-card',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1">{label}</span>}
              {!collapsed && badge && (
                <span className="bg-accent text-white text-[10px] px-1.5 py-0.5 rounded font-bold">{badge}</span>
              )}
              {/* Tooltip for collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded text-xs text-text whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="mx-2 mb-2 flex items-center justify-center gap-2 py-2 rounded-lg text-muted hover:text-text hover:bg-card text-xs transition-all"
        >
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /><span>Collapse</span></>}
        </button>

        {/* User */}
        <div className={clsx('p-3 border-t border-border flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-text truncate">{user?.name}</div>
                <div className="text-[10px] text-muted">{user?.skills?.length || 0} skills</div>
              </div>
              <button onClick={handleLogout} className="text-muted hover:text-red transition-colors" title="Logout">
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
