/**
 * context/AuthContext.jsx
 * Global authentication state: user, token, login, logout, updateUser.
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(null)
  const [loading, setLoading] = useState(true)   // initial session restore

  // Restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('se_token')
    const storedUser  = localStorage.getItem('se_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      // Verify token is still valid
      authAPI.me()
        .then(r => { setUser(r.data); localStorage.setItem('se_user', JSON.stringify(r.data)) })
        .catch(() => { logout() })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    setToken(data.access_token)
    setUser(data.user)
    localStorage.setItem('se_token', data.access_token)
    localStorage.setItem('se_user',  JSON.stringify(data.user))
    return data
  }

  const register = async (name, email, password) => {
    await authAPI.register({ name, email, password })
    return login(email, password)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('se_token')
    localStorage.removeItem('se_user')
  }

  const updateUser = (partial) => {
    const updated = { ...user, ...partial }
    setUser(updated)
    localStorage.setItem('se_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
