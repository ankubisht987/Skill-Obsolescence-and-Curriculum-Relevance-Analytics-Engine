import React, { useEffect, useState } from 'react'
import { skillsAPI } from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import DonutChart from '../components/charts/DonutChart'
import TrendLineChart from '../components/charts/TrendLineChart'
import ProgressBar from '../components/ui/ProgressBar'
import Loader from '../components/ui/Loader'

const DONUT_DATA = [
  { name:'Rising',   value:15, fill:'#22c55e' },
  { name:'Stable',   value:13, fill:'#3b82f6' },
  { name:'Declining',value:10, fill:'#ef4444' },
  { name:'Emerging', value:8,  fill:'#a855f7' },
]

const OBSOLESCENCE = [
  { skill:'jQuery',         rate:78, replacement:'React / Vanilla JS' },
  { skill:'Hadoop MapReduce', rate:72, replacement:'Apache Spark' },
  { skill:'SOAP APIs',      rate:65, replacement:'REST / GraphQL' },
  { skill:'Subversion (SVN)', rate:88, replacement:'Git' },
  { skill:'Perl',           rate:82, replacement:'Python' },
  { skill:'ColdFusion',     rate:75, replacement:'Node.js / Python' },
]

const COMPANY_DEMAND = [
  { company:'OpenAI',    demand:99, color:'#a855f7' },
  { company:'Google',    demand:95, color:'#4f8ef7' },
  { company:'Microsoft', demand:90, color:'#22c55e' },
  { company:'Amazon',    demand:88, color:'#f59e0b' },
  { company:'Stripe',    demand:85, color:'#06b6d4' },
  { company:'Netflix',   demand:80, color:'#ef4444' },
  { company:'Meta',      demand:78, color:'#8b5cf6' },
  { company:'Apple',     demand:75, color:'#94a3b8' },
]

const EMERGING = [
  { name:'AI Agents',         icon:'🤖', desc:'Autonomous AI systems' },
  { name:'GraphRAG',          icon:'🔗', desc:'Graph-based retrieval' },
  { name:'Mamba / SSM',       icon:'🌀', desc:'State space models' },
  { name:'Mixture of Experts',icon:'⚗️',  desc:'Sparse model routing' },
  { name:'Edge AI',           icon:'📱', desc:'On-device inference' },
  { name:'Neuromorphic',      icon:'🧠', desc:'Brain-inspired chips' },
  { name:'Quantum ML',        icon:'⚛️',  desc:'Quantum advantage' },
  { name:'AI Safety',         icon:'🛡️',  desc:'Alignment research' },
]

export default function InsightsPage() {
  const [trends,  setTrends]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    skillsAPI.trends()
      .then(r => setTrends(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader title="Analytics & Insights" subtitle="Real-time market skill demand intelligence" />

      {loading && <Loader text="Loading analytics..." />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Skill distribution donut */}
        <div className="card">
          <div className="text-sm font-bold text-text mb-1">Skill Category Distribution</div>
          <div className="text-xs text-muted mb-4">Current market landscape</div>
          <DonutChart data={DONUT_DATA} />
        </div>

        {/* Company demand */}
        <div className="card">
          <div className="text-sm font-bold text-text mb-1">Company Demand Index</div>
          <div className="text-xs text-muted mb-4">Average hiring demand score by company</div>
          <div className="space-y-3">
            {COMPANY_DEMAND.map(({ company, demand, color }) => (
              <div key={company} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-xs font-semibold text-text w-24 flex-shrink-0">{company}</span>
                <div className="flex-1">
                  <ProgressBar value={demand} color={color} showValue={false} />
                </div>
                <span className="text-xs font-bold text-text w-10 text-right">{demand}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend line */}
      <div className="card">
        <div className="text-sm font-bold text-text mb-1">Skill Demand Trajectory</div>
        <div className="text-xs text-muted mb-4">6-month demand index by category</div>
        <TrendLineChart />
      </div>

      {/* Obsolescence tracker */}
      <div className="card">
        <div className="text-sm font-bold text-text mb-1">📉 Skill Obsolescence Tracker</div>
        <div className="text-xs text-muted mb-4">Skills being replaced by modern alternatives</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {['Skill','Obsolescence Rate','Modern Replacement','Status'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OBSOLESCENCE.map(({ skill, rate, replacement }) => (
                <tr key={skill} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-text">{skill}</td>
                  <td className="py-3 px-3 w-48">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-bg rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width:`${rate}%`, background:`hsl(${120-rate},70%,55%)` }} />
                      </div>
                      <span className="text-red font-bold w-8 text-right">{rate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="badge-rising">{replacement}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="badge-declining">...........</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emerging Tech */}
      <div className="card">
        <div className="text-sm font-bold text-text mb-4">🌟 Emerging Technologies 2025–2026</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {EMERGING.map(({ name, icon, desc }) => (
            <div key={name} className="bg-surface border border-border rounded-xl p-4 hover:border-purple/30 transition-all hover:bg-purple/5">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-xs font-bold text-purple mb-1">{name}</div>
              <div className="text-[10px] text-muted">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills from API if available */}
      {trends && (
        <div className="card">
          <div className="text-sm font-bold text-text mb-4">Live Skill Trends from Database</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(trends).map(([trend, skills]) => (
              <div key={trend}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                  trend==='rising' ? 'text-green' : trend==='declining' ? 'text-red' :
                  trend==='emerging' ? 'text-purple' : 'text-accent'
                }`}>{trend}</div>
                <div className="space-y-1">
                  {skills.slice(0,5).map((s) => (
                    <div key={s} className="text-xs text-muted bg-surface px-2 py-1 rounded truncate">{s}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
