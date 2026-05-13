import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { Spinner } from '../components/ui/Loader'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [show, setShow]       = useState(false)
  const [loading, setLoading] = useState(false)

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e?.preventDefault()
    if (!form.email || !form.password) return toast.error('Fill in all fields')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const demo = async () => {
    setForm({ email: 'demo@skillengine.ai', password: 'demo1234' })
    setLoading(true)
    try {
      await login('demo@skillengine.ai', 'demo1234')
      navigate('/')
    } catch {
      // demo account might not exist — redirect to register with prefill
      navigate('/register?demo=1')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-bg bg-grid-dark flex items-center justify-center p-4">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-text">Skill Obsolescence</div>
            <div className="text-xs text-muted font-mono">Curriculum Relevance Analytics Engine</div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-text mb-1">Sign in</h2>
          <p className="text-sm text-muted mb-6">Enter your credentials to continue</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Email</label>
              <input className="input-field" type="email" placeholder="you@example.com"
                value={form.email} onChange={upd('email')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input className="input-field pr-10" type={show ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={upd('password')} />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary justify-center py-2.5 text-base">
              {loading ? <Spinner size={16} /> : 'Sign In'}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs text-muted bg-card px-2">or</div>
          </div>

          {/* <button onClick={demo} disabled={loading}
            className="w-full btn-secondary justify-center py-2.5">
            🚀 Try Demo Account
          </button> */}

          <p className="text-center text-xs text-muted mt-5">
            No account?{' '}
            <Link to="/register" className="text-accent hover:underline font-medium">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
