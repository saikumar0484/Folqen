'use client'

import { AppShell } from '@/components/layout/AppShell'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Bot, User, Paperclip, Mic,
  Image as ImageIcon, Loader2, Zap, X
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const quickCommands = [
  { label: 'Research a topic', command: 'Research a new urban legend topic for this week' },
  { label: 'Create content package', command: 'Create a full content package for a short video' },
  { label: 'Show pending approvals', command: 'What needs my approval right now?' },
  { label: 'Check platform status', command: 'What is the status of all my social platforms?' },
  { label: 'Show upgrade proposals', command: 'What are the latest self-improvement proposals?' },
  { label: 'Fix failed task', command: 'Show me the details of any failed tasks' },
]

const agentPersona = `You are Folqen's AI content creator agent. You specialize in Urban Legends, Mystery, and Folklore content for social media platforms primarily in India. You help research topics, write scripts, plan content, and manage the content pipeline. You are professional, creative, and safety-conscious. You always remind the user when actions require approval.`

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your Folqen AI content creator. I'm ready to help you research urban legends, write scripts, plan your content pipeline, and manage your creator workflow.\n\nWhat would you like to work on today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

    try {
      const res = await fetch('/api/agent/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      })
      const data = await res.json()
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I received your message. (Mock response — connect an LLM provider in Settings to get real responses.)',
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

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-purple-400" />
              Agent Chat
            </h1>
            <p className="text-gray-400 text-sm mt-1">Urban Legends Content Creator — <span className="text-yellow-400">Mock</span></p>
          </div>
          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-300 text-sm">Agent Ready</span>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="flex gap-2 flex-wrap mb-4">
          {quickCommands.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => sendMessage(cmd.command)}
              className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              {cmd.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'assistant'
                    ? 'bg-folqen-gradient'
                    : 'bg-white/10 border border-white/10'
                }`}>
                  {msg.role === 'assistant'
                    ? <Bot className="w-4 h-4 text-white" />
                    : <User className="w-4 h-4 text-gray-300" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-2xl ${
                  msg.role === 'user'
                    ? 'bg-purple-600/20 border border-purple-500/20'
                    : 'bg-[#0A0514] border border-white/5'
                } rounded-2xl px-4 py-3`}>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-folqen-gradient flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[#0A0514] border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                <span className="text-sm text-gray-400">Agent is thinking...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-[#0A0514] border border-white/10 rounded-xl p-3">
          <div className="flex items-end gap-3">
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
                <ImageIcon className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
              placeholder="Ask the agent anything... (Enter to send, Shift+Enter for newline)"
              rows={1}
              className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none resize-none max-h-32"
            />

            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-folqen-gradient flex items-center justify-center disabled:opacity-40 transition-opacity hover:opacity-90"
            >
              {loading
                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                : <Send className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
