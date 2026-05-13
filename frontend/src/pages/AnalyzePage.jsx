import React, { useState } from 'react'
import { skillsAPI, userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import SkillBadge from '../components/ui/SkillBadge'
import ProgressBar from '../components/ui/ProgressBar'
import SkillRadarChart from '../components/charts/SkillRadarChart'
import { Dots } from '../components/ui/Loader'
import toast from 'react-hot-toast'
import { Brain, CheckCircle2, XCircle, AlertTriangle, Map } from 'lucide-react'
import clsx from 'clsx'

const ROLES = ['All','AI/ML Engineer','Frontend Engineer','Backend Engineer','Data Engineer','Cloud Architect','Security Engineer']

export default function AnalyzePage() {
  const { user, updateUser } = useAuth()
  const [input,  setInput]  = useState((user?.skills || []).join(', '))
  const [role,   setRole]   = useState('All')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab,    setTab]    = useState('gap')

  const analyze = async () => {
    const skills = input.split(/[,\n]+/).map(s => s.trim()).filter(Boolean)
    if (!skills.length) return toast.error('Enter at least one skill')
    setLoading(true)
    try {
      const { data } = await skillsAPI.analyze({ user_skills: skills, target_role: role })
      setResult(data)
      // Update user profile skills
      await userAPI.updateSkills(skills)
      updateUser({ skills })
      toast.success('Analysis complete!')
    } catch {
      toast.error('Analysis failed — check backend connection')
    } finally {
      setLoading(false)
    }
  }

  // Build radar data from scored_user
  const radarData = result ? buildRadar(result.scored_user || []) : []

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader title="Skill Gap Analyzer" subtitle="TF-IDF scoring against live job market data" />

      {/* Input card */}
      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Your Skills (comma-separated)
            </label>
            <textarea
              className="input-field resize-none h-24"
              placeholder="e.g. Python, React, SQL, Docker, Machine Learning, AWS..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Target Role</label>
              <select className="input-field" value={role} onChange={e => setRole(e.target.value)}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <button onClick={analyze} disabled={loading} className="w-full btn-primary justify-center py-3">
              {loading ? <><Dots /> Analyzing...</> : <><Brain size={16} /> Analyze Skills</>}
            </button>
          </div>
        </div>
      </div>

      {!result && !loading && (
        <div className="text-center py-20 text-muted">
          <Brain size={40} className="mx-auto mb-3 opacity-30" />
          <div className="text-sm font-semibold text-text/60">Enter your skills and click Analyze</div>
          <div className="text-xs mt-1">Compares against job market using TF-IDF scoring</div>
        </div>
      )}

      {result && (
        <>
          {/* Score cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label:'Match Score',      value:`${result.match_score}%`,    color: result.match_score > 70 ? 'text-green' : result.match_score > 40 ? 'text-amber' : 'text-red' },
              { label:'Skills Matched',   value:result.matched?.length || 0, color:'text-green' },
              { label:'Missing Skills',   value:result.missing?.length || 0, color:'text-amber' },
              { label:'Low-Demand Skills',value:result.redundant?.length||0, color:'text-red'   },
            ].map(({ label, value, color }) => (
              <div key={label} className="card text-center animate-fade-up">
                <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{label}</div>
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="card">
            <div className="flex gap-1 border-b border-border mb-5 -mx-5 px-5">
              {[
                ['gap',     'Gap Analysis',    XCircle],
                ['radar',   'Skill Radar',     Brain],
                ['scored',  'Your Scores',     CheckCircle2],
                ['roadmap', 'Learning Roadmap', Map],
              ].map(([k, l, Icon]) => (
                <button key={k} onClick={() => setTab(k)}
                  className={clsx(
                    'flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px',
                    tab === k
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted hover:text-text'
                  )}>
                  <Icon size={12} />
                  {l}
                </button>
              ))}
            </div>

            {/* Gap Analysis */}
            {tab === 'gap' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={14} className="text-green" />
                    <span className="text-sm font-semibold text-green">Matched Skills ({result.matched?.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.matched?.length
                      ? result.matched.map(s => <SkillBadge key={s} skill={s} status="rising" />)
                      : <span className="text-xs text-muted">No skills matched the target role</span>}
                  </div>

                  {result.redundant?.length > 0 && (
                    <div className="mt-5">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={14} className="text-red" />
                        <span className="text-sm font-semibold text-red">Low-Demand Skills ({result.redundant.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.redundant.map(s => <SkillBadge key={s} skill={s} status="declining" />)}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle size={14} className="text-amber" />
                    <span className="text-sm font-semibold text-amber">Missing Skills ({result.missing?.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.missing?.slice(0, 15).map(m => (
                      <SkillBadge key={m.skill} skill={m.skill} status="stable" />
                    ))}
                  </div>

                  {result.recommendations?.length > 0 && (
                    <div className="mt-5 space-y-2">
                      <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">AI Recommendations</div>
                      {result.recommendations.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 bg-accent/5 border border-accent/10 rounded-lg p-3 text-xs text-text/80">
                          <span className="text-accent font-bold flex-shrink-0">{i + 1}.</span>
                          {r}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Radar */}
            {tab === 'radar' && (
              <SkillRadarChart userData={radarData} marketData={[60,65,70,55,60,45]} />
            )}

            {/* Scored */}
            {tab === 'scored' && (
              <div className="space-y-2">
                {result.scored_user?.map(({ skill, score, status }) => (
                  <div key={skill} className="flex items-center gap-4">
                    <span className="w-36 text-sm font-medium text-text truncate flex-shrink-0">{skill}</span>
                    <div className="flex-1">
                      <ProgressBar value={Math.min(score, 100)} />
                    </div>
                    <SkillBadge skill={status} status={status} />
                  </div>
                ))}
              </div>
            )}

            {/* Roadmap */}
            {tab === 'roadmap' && (
              <div className="space-y-6">
                {[
                  { phase:'Phase 1 · 0–3 months', title:'Bridge Critical Gaps',       skills: result.missing?.slice(0,4).map(m=>m.skill) || [], color:'text-red',   dot:'bg-red' },
                  { phase:'Phase 2 · 3–6 months', title:'High-Demand Additions',      skills: result.missing?.slice(4,8).map(m=>m.skill) || [], color:'text-amber', dot:'bg-amber' },
                  { phase:'Phase 3 · 6–12 months',title:'Future-Proof Emerging Tech', skills:['AI Agents','GraphRAG','Mamba','Mixture of Experts'],                  color:'text-green', dot:'bg-green' },
                ].map((p, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full ${p.dot} flex items-center justify-center text-bg text-xs font-bold flex-shrink-0`}>{i+1}</div>
                      {i < 2 && <div className="w-0.5 h-10 bg-border mt-1" />}
                    </div>
                    <div className="pb-4">
                      <div className={`text-xs font-semibold ${p.color} mb-0.5`}>{p.phase}</div>
                      <div className="text-sm font-bold text-text mb-2">{p.title}</div>
                      <div className="flex flex-wrap gap-2">
                        {p.skills.filter(Boolean).map(s => (
                          <span key={s} className="font-mono text-xs bg-surface border border-border text-muted px-2 py-0.5 rounded">{s}</span>
                        ))}
                        {!p.skills.filter(Boolean).length && <span className="text-xs text-muted">No gaps — excellent!</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function buildRadar(scored) {
  const cats = { 'AI/ML':0, 'Frontend':0, 'Backend':0, 'DevOps':0, 'Data':0, 'Security':0 }
  const map = {
    'Python':'AI/ML','TensorFlow':'AI/ML','PyTorch':'AI/ML','LLMs':'AI/ML','MLOps':'AI/ML',
    'React':'Frontend','TypeScript':'Frontend','Next.js':'Frontend','JavaScript':'Frontend',
    'Java':'Backend','Spring Boot':'Backend','Go':'Backend','Node.js':'Backend','Rust':'Backend',
    'Kubernetes':'DevOps','Docker':'DevOps','Terraform':'DevOps','AWS':'DevOps','CI/CD':'DevOps',
    'SQL':'Data','Spark':'Data','dbt':'Data','Airflow':'Data',
    'Penetration Testing':'Security','SOC2':'Security','Zero Trust':'Security',
  }
  const counts = { 'AI/ML':0,'Frontend':0,'Backend':0,'DevOps':0,'Data':0,'Security':0 }
  scored.forEach(({ skill, score }) => {
    const cat = map[skill]
    if (cat) { cats[cat] += score; counts[cat]++ }
  })
  return Object.keys(cats).map(c => Math.round(counts[c] ? cats[c] / counts[c] : 0))
}
