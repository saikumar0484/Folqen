'use client'

import { AppShell } from '@/components/layout/AppShell'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Paperclip, Mic, Image as ImageIcon, Loader2, Zap, X, RefreshCw, Copy, CheckCheck } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const quickCommands = [
  { label: '🔍 Research topic', command: 'Research a new urban legend topic for this week' },
  { label: '📦 Create package', command: 'Create a full content package for a short video' },
  { label: '✅ Pending approvals', command: 'What needs my approval right now?' },
  { label: '📡 Platform status', command: 'What is the status of all my social platforms?' },
  { label: '⚡ Upgrade proposals', command: 'What are the latest self-improvement proposals?' },
  { label: '🔧 Fix failed task', command: 'Show me the details of any failed tasks' },
]

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm **Folqen Agent** — your AI content creator for Urban Legends, Mystery & Folklore content.\n\nI can help you:\n• 🔍 Research new urban legend topics\n• ✍️ Write scripts and content packages\n• 📅 Plan your content pipeline\n• ✅ Track approvals and tasks\n• 📊 Analyze performance\n\nWhat would you like to work on today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, sessionId: 'agent-page' }),
      })
      const data = await res.json()
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || data.response || '[Mock Mode] Connect an AI provider in Settings > API Keys to enable real responses.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please check your connection and try again.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Chat cleared. How can I help you?',
      timestamp: new Date(),
    }])
  }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-folqen-gradient flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Folqen Agent</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-gray-400">Urban Legends Content Creator</span>
                <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded">Mock</span>
              </div>
            </div>
          </div>
          <button onClick={clearChat} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Clear
          </button>
        </div>

        {/* Quick Commands */}
        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto shrink-0 border-b border-white/5">
          {quickCommands.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => sendMessage(cmd.command)}
              className="text-xs bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-gray-300 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
            >
              {cmd.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 group ${
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.role === 'assistant'
                    ? 'bg-folqen-gradient'
                    : 'bg-white/10 border border-white/20'
                }`}>
                  {msg.role === 'assistant' ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-gray-300" />
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                } flex flex-col gap-1`}>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'assistant'
                      ? 'bg-white/5 border border-white/10 text-gray-200'
                      : 'bg-folqen-gradient text-white'
                  }`}>
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-600">
                      {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => copyMessage(msg.id, msg.content)}
                      className="text-gray-600 hover:text-gray-300 transition-colors"
                    >
                      {copied === msg.id ? (
                        <CheckCheck className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-folqen-gradient flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 pb-4 pt-2 shrink-0">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 focus-within:border-purple-500/40 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
              placeholder="Ask the agent anything... (Enter to send, Shift+Enter for newline)"
              rows={1}
              className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none resize-none max-h-32 mb-2"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.txt" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-600 hover:text-gray-400 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  className="text-gray-600 hover:text-gray-400 transition-colors"
                  title="Upload image"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button
                  className="text-gray-600 hover:text-gray-400 transition-colors"
                  title="Voice input (coming soon)"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">{input.length > 0 ? `${input.length} chars` : 'Enter to send'}</span>
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-xl bg-folqen-gradient flex items-center justify-center disabled:opacity-40 transition-opacity hover:opacity-90"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-700 text-center mt-2">
            Folqen Agent is in Mock Mode — connect an LLM provider in Settings &gt; API Keys for real responses
          </p>
        </div>
      </div>
    </AppShell>
  )
}
