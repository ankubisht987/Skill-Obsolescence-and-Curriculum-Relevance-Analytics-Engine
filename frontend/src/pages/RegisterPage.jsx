import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { Spinner } from '../components/ui/Loader'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e?.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Fill in all fields')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome 🎉')
      navigate('/')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg bg-grid-dark flex items-center justify-center p-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm animate-fade-up">
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
          <h2 className="text-xl font-bold text-text mb-1">Create account</h2>
          <p className="text-sm text-muted mb-6">Start tracking your skill trajectory</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Full Name</label>
              <input className="input-field" type="text" placeholder="Ankush Sharma"
                value={form.name} onChange={upd('name')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Email</label>
              <input className="input-field" type="email" placeholder="you@example.com"
                value={form.email} onChange={upd('email')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input className="input-field pr-10" type={show ? 'text' : 'password'} placeholder="Min 6 characters"
                  value={form.password} onChange={upd('password')} />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary justify-center py-2.5 text-base">
              {loading ? <Spinner size={16} /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-muted mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
