import React, { useEffect, useState } from 'react'
import { userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import ProgressBar from '../components/ui/ProgressBar'
import SkillBadge from '../components/ui/SkillBadge'
import { Spinner } from '../components/ui/Loader'
import toast from 'react-hot-toast'
import { Save, Plus, X } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [data,     setData]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [skillInput, setSkillInput] = useState('')
  const [skills,   setSkills]   = useState(user?.skills || [])
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    userAPI.data()
      .then(r => { setData(r.data); setSkills(r.data.user?.skills || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const addSkill = () => {
    const s = skillInput.trim()
    if (!s || skills.includes(s)) return
    setSkills(prev => [...prev, s])
    setSkillInput('')
  }

  const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s))

  const saveSkills = async () => {
    setSaving(true)
    try {
      await userAPI.updateSkills(skills)
      updateUser({ skills })
      toast.success('Skills updated!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const stats = data?.stats || {}
  const predictions = data?.predictions || []

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader title="My Profile" subtitle={`Welcome back, ${user?.name}`} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile card */}
        <div className="card">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-purple flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-bold text-text">{user?.name}</div>
              <div className="text-xs text-muted">{user?.email}</div>
              <div className="flex gap-2 mt-1.5">
                <span className="badge-rising">Active</span>
                <span className="badge-stable">Skill Tracker</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ['Skills',    skills.length,                'tracked' ],
              ['Analyses',  stats.total_predictions || 0, 'run'     ],
              ['AI Chats',  stats.total_chats       || 0, 'messages'],
            ].map(([l, v, s]) => (
              <div key={l} className="bg-surface border border-border rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-accent">{v}</div>
                <div className="text-[10px] text-muted">{l}</div>
                <div className="text-[10px] text-muted">{s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills manager */}
        <div className="card">
          <div className="text-sm font-bold text-text mb-3">My Skills</div>
          <div className="flex gap-2 mb-3">
            <input
              className="input-field flex-1"
              placeholder="Add a skill..."
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSkill()}
            />
            <button onClick={addSkill} className="btn-secondary px-3">
              <Plus size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-16 mb-3">
            {skills.map(s => (
              <span key={s} className="inline-flex items-center gap-1 badge-stable group">
                {s}
                <button onClick={() => removeSkill(s)} className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red">
                  <X size={10} />
                </button>
              </span>
            ))}
            {!skills.length && <span className="text-xs text-muted">No skills added yet</span>}
          </div>
          <button onClick={saveSkills} disabled={saving} className="btn-primary w-full justify-center">
            {saving ? <Spinner size={14} /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Skills'}
          </button>
        </div>
      </div>

      {/* Analysis history */}
      {predictions.length > 0 && (
        <div className="card">
          <div className="text-sm font-bold text-text mb-4">Analysis History</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {['Date','Target Role','Skills Analyzed','Match Score'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-muted font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {predictions.slice(0, 8).map((p, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                    <td className="py-2.5 px-3 text-muted">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3 text-text">{p.target_role || 'All'}</td>
                    <td className="py-2.5 px-3 text-muted">{p.skills?.length || 0} skills</td>
                    <td className="py-2.5 px-3">
                      <span className={`font-bold text-sm ${
                        (p.result?.match_score||0) > 70 ? 'text-green' :
                        (p.result?.match_score||0) > 40 ? 'text-amber' : 'text-red'
                      }`}>
                        {p.result?.match_score || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent chats */}
      {data?.chats?.length > 0 && (
        <div className="card">
          <div className="text-sm font-bold text-text mb-4">Recent Chat History</div>
          <div className="space-y-3">
            {data.chats.filter(c => c.role === 'user').slice(0, 5).map((c, i) => (
              <div key={i} className="flex items-start gap-2 bg-surface rounded-lg p-3 border border-border">
                <span className="text-accent text-xs font-bold flex-shrink-0">Q:</span>
                <span className="text-xs text-muted">{c.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
