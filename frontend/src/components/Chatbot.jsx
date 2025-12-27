import { useState, useRef, useEffect } from 'react'
import api from '../api/axios'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, linkify: true })

export default function Chatbot({ floating = false, fixed = false, lessonId = null, thinkSeconds = 0.1, systemPrompt = null }) {
  const [open, setOpen] = useState(!floating && fixed)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const containerRef = useRef()
  const [expanded, setExpanded] = useState({})


  useEffect(() => {
    if (messages.length > 30) {
      setMessages((m) => m.slice(-30))
    }
  }, [messages])

  const send = async () => {
    const text = (input || '').trim()
    if (!text) return

    const userMsg = { role: 'user', text }
    setMessages((m) => [...m, userMsg])
    setInput('')

    setLoading(true)
    try {
      if (thinkSeconds > 0) await new Promise((res) => setTimeout(res, Math.max(0, thinkSeconds) * 1000))
      const payload = { message: text, context: { lessonId } }
      if (systemPrompt) payload.system = systemPrompt
      const res = await api.post('/chat', payload)
      const answer = res.data?.answer || 'No reply'
      setMessages((m) => [...m, { role: 'bot', text: answer }])
    } catch (err) {
      setMessages((m) => [...m, { role: 'bot', text: 'Error: failed to fetch reply' }])
    } finally {
      setLoading(false)
    }
  }

  const renderBotContent = (text, key) => {
    if (!text) return null
    const parts = []
    const fenceRe = /```(\w*)\n([\s\S]*?)```/g
    let lastIndex = 0
    let match
    while ((match = fenceRe.exec(text)) !== null) {
      const idx = match.index
      if (idx > lastIndex) {
        parts.push({ type: 'md', content: text.slice(lastIndex, idx) })
      }
      parts.push({ type: 'code', lang: match[1] || '', content: match[2] })
      lastIndex = fenceRe.lastIndex
    }
    if (lastIndex < text.length) parts.push({ type: 'md', content: text.slice(lastIndex) })

    return parts.map((p, i) => {
      if (p.type === 'md') {
        return <div key={key + '-md-' + i} dangerouslySetInnerHTML={{ __html: md.render(p.content) }} />
      }
      return (
        <div key={key + '-code-' + i} className="relative my-3">
          <pre className="bg-gray-900 text-white rounded p-3 overflow-auto"><code>{p.content}</code></pre>
          <button
            className="absolute right-2 top-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded"
            onClick={() => {
              navigator.clipboard.writeText(p.content).then(() => {
              }).catch(() => {})
            }}
          >Copy</button>
        </div>
      )
    })
  }

  const renderedMessages = messages.map((m, idx) => {
    const isBot = m.role === 'bot'
    const isSystem = m.role === 'system'
    const key = `msg-${idx}`
    const expandedFlag = !!expanded[key]

    return (
      <div key={idx} className={`mb-3 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
        <div className={`${m.role === 'user' ? 'inline-block bg-indigo-600 text-white' : isSystem ? 'inline-block bg-gray-200 text-gray-700 italic' : 'inline-block bg-gray-100 text-gray-900'} p-3 rounded-md max-w-[80%]`}>
          {isBot ? (
            <div>
              {!expandedFlag ? (
                <div>
                  <div>{/* short first paragraph rendered as HTML */}
                    <div dangerouslySetInnerHTML={{ __html: md.render((m.text || '').split('\n\n')[0] || '') }} />
                  </div>
                  {(m.text || '').includes('\n\n') && (
                    <div>
                      <button onClick={() => setExpanded((s) => ({ ...s, [key]: true }))} className="text-xs text-indigo-600 mt-2">More</button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {renderBotContent(m.text, key)}
                  <div>
                    <button onClick={() => setExpanded((s) => ({ ...s, [key]: false }))} className="text-xs text-gray-600 mt-2">Less</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // user or system messages
            <div dangerouslySetInnerHTML={{ __html: md.render(m.text) }} />
          )}
        </div>
      </div>
    )
  })

  // Floating button styles
  if (floating) {
    return (
      <div>
        <div className="fixed bottom-6 right-6 z-50">
          {systemPrompt && (
            <div className="mb-2 text-xs text-gray-500 text-right">System: {systemPrompt}</div>
          )}
          {open && (
            <div ref={containerRef} className="w-80 h-96 bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <div className="font-semibold">Assistant</div>
                <button onClick={() => setOpen(false)} className="text-sm text-gray-600">Close</button>
              </div>
              <div className="p-3 overflow-auto flex-1 bg-gray-50">
                {renderedMessages}
              </div>
              <div className="p-3 border-t bg-white">
                <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={2} className="w-full p-2 border rounded" placeholder="Ask the assistant..." />
                <div className="flex justify-end mt-2">
                  <button onClick={send} disabled={loading} className="px-3 py-1 bg-indigo-600 text-white rounded">{loading ? '...' : 'Send'}</button>
                </div>
              </div>
            </div>
          )}

          {!open && (
            <button onClick={() => setOpen(true)} className="w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center">💬</button>
          )}
        </div>
      </div>
    )
  }

  if (fixed) {
    return (
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-semibold mb-2">Assistant</h4>
          {systemPrompt && <div className="text-xs text-gray-500 italic mb-2">System: {systemPrompt}</div>}
          <div className="max-h-60 overflow-auto mb-3 bg-gray-50 p-3 rounded">
            {renderedMessages}
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3} className="w-full p-2 border rounded mb-2" placeholder="Ask the assistant about this lesson..." />
          <div className="flex justify-end">
            <button onClick={send} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? '...' : 'Ask'}</button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
