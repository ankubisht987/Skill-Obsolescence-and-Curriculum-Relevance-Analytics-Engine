import React, { useState, useEffect, useRef } from 'react'
import { chatAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Send, Trash2, Zap, User } from 'lucide-react'
import { Dots } from '../components/ui/Loader'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const SUGGESTIONS = [
  'Am I ready for a Google SDE role?',
  'What skills should I learn next?',
  'Which skills are becoming obsolete?',
  'How do I transition into AI/ML?',
  'What is the salary for DevOps engineers?',
  'Compare RAG vs fine-tuning for LLMs',
]

function formatContent(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hello **${user?.name}**! I'm your AI career advisor.\n\nI can help with:\n• **Skill gap analysis** — *"Am I ready for Google?"*\n• **Learning paths** — *"What should I learn next?"*\n• **Market insights** — *"Which skills are dying?"*\n• **Career transitions** — *"How do I move into AI/ML?"*\n\nWhat would you like to explore?`,
    ts: new Date(),
  }])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // Load history on mount
  useEffect(() => {
    chatAPI.history().then(r => {
      if (r.data.messages?.length) {
        setMessages([messages[0], ...r.data.messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
          ts: new Date(m.ts),
        }))])
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: msg, ts: new Date() }])
    setLoading(true)
    try {
      const { data } = await chatAPI.send(msg)
      setMessages(m => [...m, { role: 'assistant', content: data.reply, ts: new Date(), source: data.source }])
    } catch {
      toast.error('Chat failed — check backend connection')
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I encountered an error. Please check the backend connection.', ts: new Date() }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearHistory = async () => {
    try {
      await chatAPI.clearHistory()
      setMessages([messages[0]])
      toast.success('Chat history cleared')
    } catch { toast.error('Failed to clear history') }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface flex-shrink-0">
        <div>
          <div className="text-sm font-bold text-text">AI Career Advisor</div>
          <div className="text-xs text-muted">Create By Ankush Aniket Shishir</div>
        </div>
        <button onClick={clearHistory} className="btn-secondary text-xs py-1.5">
          <Trash2 size={12} /> Clear history
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={clsx('flex gap-3 animate-fade-up', m.role === 'user' && 'flex-row-reverse')}>
            {/* Avatar */}
            <div className={clsx(
              'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
              m.role === 'assistant'
                ? 'bg-gradient-to-br from-accent to-purple text-white'
                : 'bg-surface border border-border text-muted'
            )}>
              {m.role === 'assistant' ? <Zap size={13} /> : <User size={13} />}
            </div>

            {/* Bubble */}
            <div className={clsx(
              'max-w-[72%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
              m.role === 'assistant'
                ? 'bg-card border border-border text-text rounded-tl-sm'
                : 'bg-accent text-white rounded-tr-sm'
            )}>
              <div dangerouslySetInnerHTML={{ __html: formatContent(m.content) }} />
              <div className={clsx('text-[10px] mt-2', m.role==='assistant' ? 'text-muted' : 'text-white/60')}>
                {m.ts?.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                {m.source && m.source !== 'local' && <span className="ml-2">· {m.source}</span>}
              </div>
            </div>
          </div>
        ))}
        

        {loading && (
          <div className="flex gap-3 animate-fade-up">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-purple flex items-center justify-center flex-shrink-0">
              <Zap size={13} className="text-white" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <Dots />
            </div>
          </div>
        )}

        {/* Suggestions (shown when few messages) */}
        {messages.length <= 2 && !loading && (
          <div className="flex flex-wrap gap-2 mt-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setInput(s); inputRef.current?.focus() }}
                className="text-xs bg-surface border border-border hover:border-accent hover:text-accent text-muted px-3 py-1.5 rounded-full transition-all">
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-surface">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            className="input-field flex-1 resize-none max-h-32"
            rows={1}
            placeholder="Ask about skills, career advice, market trends..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            style={{ minHeight: 42 }}
          />
          <button onClick={send} disabled={loading || !input.trim()} className="btn-primary flex-shrink-0 h-10 px-4">
            <Send size={15} />
          </button>
        </div>
        <div className="text-[10px] text-muted mt-1.5">Enter to send · Shift+Enter for new line · Powered by Claude Sonnet</div>
      </div>
    </div>
  )
}
