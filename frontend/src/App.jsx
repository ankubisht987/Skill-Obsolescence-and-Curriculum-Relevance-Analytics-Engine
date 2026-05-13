import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout      from './components/layout/Layout'
import LoginPage   from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard   from './pages/Dashboard'
import AnalyzePage from './pages/AnalyzePage'
import DatasetPage from './pages/DatasetPage'
import ChatPage    from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-bg">
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <span key={i} className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index            element={<Dashboard />} />
        <Route path="analyze"   element={<AnalyzePage />} />
        <Route path="datasets"  element={<DatasetPage />} />
        <Route path="chat"      element={<ChatPage />} />
        <Route path="profile"   element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
