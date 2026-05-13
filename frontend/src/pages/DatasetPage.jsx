import React, { useState, useRef } from 'react'
import { jobsAPI } from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import { Spinner } from '../components/ui/Loader'
import toast from 'react-hot-toast'
import { Upload, FileJson, FileText, CheckCircle, X } from 'lucide-react'
import clsx from 'clsx'

const ADMIN_PASSKEY = "admin123"

const SAMPLE_JSON = JSON.stringify([
  { company:"Google", role:"ML Engineer", skills:["Python","PyTorch","LLMs","MLOps"], demand:97, yoy:18 },
  { company:"Amazon", role:"Backend Engineer", skills:["Java","AWS","Kafka","Microservices"], demand:92, yoy:12 },
  { company:"Microsoft", role:"Cloud Architect", skills:["Azure","Kubernetes","Terraform"], demand:90, yoy:15 },
], null, 2)

const SAMPLE_CSV = `company,role,skills,demand,yoy
Google,ML Engineer,"Python,PyTorch,LLMs",97,18
Amazon,Backend Engineer,"Java,AWS,Kafka",92,12
Microsoft,Cloud Architect,"Azure,Kubernetes,Terraform",90,15`

export default function DatasetPage() {

  const [authorized, setAuthorized] = useState(false)
  const [passkey, setPasskey] = useState("")

  const [tab,      setTab]      = useState('upload')
  const [dragging, setDragging] = useState(false)
  const [file,     setFile]     = useState(null)
  const [preview,  setPreview]  = useState(null)
  const [uploading,setUploading]= useState(false)
  const [result,   setResult]   = useState(null)

  const inputRef = useRef()

  const handleFile = async (f) => {
    if (!f) return
    setFile(f)
    setResult(null)

    // Preview
    const text = await f.text()

    try {
      if (f.name.endsWith('.json')) {
        const d = JSON.parse(text)
        setPreview(Array.isArray(d) ? d.slice(0, 8) : [d])
      } else {
        const lines = text.trim().split('\n')
        const headers = lines[0].split(',').map(h => h.replace(/"/g,'').trim())

        const rows = lines.slice(1, 9).map(l => {
          const vals = l.split(',').map(v => v.replace(/"/g,'').trim())

          return Object.fromEntries(
            headers.map((h, i) => [h, vals[i] || ''])
          )
        })

        setPreview(rows)
      }

      setTab('preview')

    } catch {
      toast.error('Could not parse file')
    }
  }

  const upload = async () => {
    if (!file) return

    setUploading(true)

    try {
      const { data } = await jobsAPI.upload(file)

      setResult(data)

      toast.success(data.message)

    } catch (err) {

      toast.error(
        err?.response?.data?.detail || 'Upload failed'
      )

    } finally {
      setUploading(false)
    }
  }

  const downloadSample = (type) => {
    const content = type === 'json'
      ? SAMPLE_JSON
      : SAMPLE_CSV

    const blob = new Blob([content], {
      type: 'text/plain'
    })

    const a = document.createElement('a')

    a.href = URL.createObjectURL(blob)
    a.download = `sample.${type}`
    a.click()
  }

  // PASSKEY SCREEN
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <div className="card w-full max-w-md space-y-4">

          <div className="text-xl font-bold text-text">
            Admin Access
          </div>

          <input
            type="password"
            placeholder="Enter passkey"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            className="w-full border border-border rounded-lg px-4 py-2 bg-surface text-text"
          />

          <button
            className="btn-primary w-full"
            onClick={() => {
              if (passkey === ADMIN_PASSKEY) {
                setAuthorized(true)
              } else {
                toast.error("Invalid passkey")
              }
            }}
          >
            Enter
          </button>

        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="Job & Skill Datasets"
        subtitle="Upload JSON or CSV job listings for NLP processing"
        actions={
          <div className="flex gap-2">
            <button onClick={() => downloadSample('json')} className="btn-secondary text-xs py-1.5">
              <FileJson size={13} /> Sample JSON
            </button>
            <button onClick={() => downloadSample('csv')} className="btn-secondary text-xs py-1.5">
              <FileText size={13} /> Sample CSV
            </button>
          </div>
        }
      />

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-border">
        {[['upload','Upload'],['preview','Preview'],['format','Format Guide']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={clsx('px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-all',
              tab===k ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-text')}>
            {l}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === 'upload' && (
        <div className="space-y-4">
          <div
            className={clsx('border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
              dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-border2')}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept=".json,.csv" className="hidden"
              onChange={e => handleFile(e.target.files[0])} />
            <Upload size={32} className="mx-auto mb-3 text-muted" />
            <div className="text-sm font-semibold text-text mb-1">Drop your dataset here</div>
            <div className="text-xs text-muted">Supports .json and .csv — max 10MB</div>
          </div>

          {file && (
            <div className="card flex items-center gap-3">
              <FileJson size={20} className="text-accent flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text truncate">{file.name}</div>
                <div className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <div className="flex gap-2">
                <button onClick={upload} disabled={uploading} className="btn-primary text-xs py-1.5">
                  {uploading ? <><Spinner size={12}/> Uploading...</> : <><Upload size={12}/> Upload</>}
                </button>
                <button onClick={() => { setFile(null); setPreview(null); setResult(null) }}
                  className="text-muted hover:text-red p-1 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {result && (
            <div className="card border-green/20 bg-green/5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-green" />
                <span className="text-sm font-semibold text-green">Upload Successful</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><div className="text-2xl font-bold text-text">{result.inserted}</div><div className="text-xs text-muted">New records</div></div>
                <div><div className="text-2xl font-bold text-text">{result.skipped}</div><div className="text-xs text-muted">Updated</div></div>
                <div><div className="text-2xl font-bold text-text">{result.total}</div><div className="text-xs text-muted">Total processed</div></div>
              </div>
            </div>
          )}

          {/* NLP pipeline visual */}
          <div className="card">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">NLP Processing Pipeline</div>
            <div className="flex items-center gap-2 flex-wrap">
              {['Tokenization','Skill Extraction','TF-IDF Scoring','Frequency Analysis','Trend Mapping','Gap Detection'].map((step, i, arr) => (
                <React.Fragment key={step}>
                  <div className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-text">{step}</div>
                  {i < arr.length - 1 && <span className="text-muted text-xs">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview tab */}
      {tab === 'preview' && (
        <div className="card">
          {preview ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-text">Preview ({preview.length} records shown)</div>
                <button onClick={upload} disabled={uploading || !file} className="btn-primary text-xs py-1.5">
                  {uploading ? <Spinner size={12}/> : <Upload size={12}/>} Upload to Database
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {Object.keys(preview[0] || {}).slice(0,6).map(h => (
                        <th key={h} className="text-left py-2 px-3 text-muted font-semibold uppercase tracking-wider text-[10px]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-surface/50">
                        {Object.values(row).slice(0,6).map((v, j) => (
                          <td key={j} className="py-2.5 px-3 text-muted max-w-32 truncate">
                            {Array.isArray(v) ? v.join(', ') : String(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted text-sm">
              Upload a file first to preview data
            </div>
          )}
        </div>
      )}

      {/* Format Guide tab */}
      {tab === 'format' && (
        <div className="space-y-4">

          <div className="card">
            <div className="text-sm font-bold text-text mb-3">
              JSON Format
            </div>

            <pre className="bg-bg border border-border rounded-lg p-4 text-xs font-mono text-muted overflow-x-auto">
              {SAMPLE_JSON}
            </pre>
          </div>

          <div className="card">
            <div className="text-sm font-bold text-text mb-3">
              CSV Format
            </div>

            <pre className="bg-bg border border-border rounded-lg p-4 text-xs font-mono text-muted overflow-x-auto">
              {SAMPLE_CSV}
            </pre>
          </div>

        </div>
      )}
    </div>
  )
}