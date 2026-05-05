'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Minimize2, Maximize2, Bot } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function MiniAgentChat() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Hi! I am Folqen, your AI content agent. How can I help you today?',
      timestamp: new Date(),
    },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open, minimized])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Mock response [Not connected to real AI - placeholder]
    await new Promise(r => setTimeout(r, 1000))

    const mockResponses = [
      'I can help with that! This feature is currently in Mock mode - connect an AI provider in Settings to enable real responses.',
      'Great question! To get real AI responses, please add your API key in Settings > API Keys.',
      'I understand. Once you connect an AI model in Settings, I will be able to fully assist you with content creation and automation.',
    ]

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, assistantMsg])
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {open && (
        <div className={`mb-3 bg-folqen-card border border-white/10 rounded-2xl shadow-2xl flex flex-col transition-all ${
          minimized ? 'h-12 w-72 overflow-hidden' : 'w-80 h-96'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-medium text-white">Folqen Agent</span>
              <span className="text-xs text-yellow-400">[Mock]</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setMinimized(m => !m)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-gray-400"
              >
                {minimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-gray-400"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    {msg.role === 'assistant' && (
                      <div className="w-5 h-5 rounded-full bg-folqen-purple/20 flex items-center justify-center mr-1.5 shrink-0 mt-0.5">
                        <Bot className="w-3 h-3 text-folqen-purple" />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3 py-1.5 rounded-xl text-xs ${
                      msg.role === 'user'
                        ? 'bg-folqen-purple text-white'
                        : 'bg-white/5 text-gray-200'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-5 h-5 rounded-full bg-folqen-purple/20 flex items-center justify-center mr-1.5 shrink-0">
                      <Bot className="w-3 h-3 text-folqen-purple" />
                    </div>
                    <div className="bg-white/5 px-3 py-1.5 rounded-xl">
                      <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-2 border-t border-white/5 flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the agent..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-folqen-purple placeholder-gray-600"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-7 h-7 rounded-lg bg-folqen-gradient flex items-center justify-center disabled:opacity-40 transition-opacity"
                >
                  <Send className="w-3 h-3 text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-12 h-12 rounded-full bg-folqen-gradient shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        {open
          ? <X className="w-5 h-5 text-white" />
          : <MessageCircle className="w-5 h-5 text-white" />}
      </button>
    </div>
  )
}
