'use client'

import { useState } from 'react'
import { Plus, ExternalLink, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

type ConnStatus = 'connected' | 'disconnected' | 'error'

interface Platform {
  id: string
  name: string
  category: 'social' | 'email' | 'storage' | 'messaging' | 'analytics'
  status: ConnStatus
  lastSync?: string
  postsScheduled?: number
  followers?: string
  description: string
}

const platforms: Platform[] = [
  { id: '1', name: 'Twitter / X', category: 'social', status: 'disconnected', description: 'Schedule tweets, threads, and monitor engagement', followers: '-' },
  { id: '2', name: 'LinkedIn', category: 'social', status: 'disconnected', description: 'Publish posts and articles to your LinkedIn profile', followers: '-' },
  { id: '3', name: 'Instagram', category: 'social', status: 'disconnected', description: 'Schedule photos, Reels, and stories', followers: '-' },
  { id: '4', name: 'YouTube', category: 'social', status: 'disconnected', description: 'Upload videos and manage your channel', followers: '-' },
  { id: '5', name: 'Telegram', category: 'messaging', status: 'disconnected', description: 'Send messages and manage Telegram channels/bots', followers: '-' },
  { id: '6', name: 'WhatsApp Business', category: 'messaging', status: 'disconnected', description: 'Send business messages via WhatsApp API', followers: '-' },
  { id: '7', name: 'Gmail / Google', category: 'email', status: 'disconnected', description: 'Send emails and manage Gmail campaigns', followers: '-' },
  { id: '8', name: 'Mailchimp', category: 'email', status: 'disconnected', description: 'Email campaign management and automation', followers: '-' },
  { id: '9', name: 'Google Drive', category: 'storage', status: 'disconnected', description: 'Read/write files and documents in Google Drive', followers: '-' },
  { id: '10', name: 'Notion', category: 'storage', status: 'disconnected', description: 'Read and write to Notion databases and pages', followers: '-' },
  { id: '11', name: 'Google Analytics', category: 'analytics', status: 'disconnected', description: 'Pull website traffic and analytics data', followers: '-' },
  { id: '12', name: 'Meta Ads', category: 'analytics', status: 'disconnected', description: 'Manage and monitor Meta advertising campaigns', followers: '-' },
]

const categoryColors: Record<string, string> = {
  social: 'bg-blue-500/10 text-blue-400',
  email: 'bg-orange-500/10 text-orange-400',
  storage: 'bg-green-500/10 text-green-400',
  messaging: 'bg-purple-500/10 text-purple-400',
  analytics: 'bg-red-500/10 text-red-400',
}

const statusIcon = (s: ConnStatus) => {
  if (s === 'connected') return <CheckCircle className="w-4 h-4 text-green-400" />
  if (s === 'error') return <AlertCircle className="w-4 h-4 text-red-400" />
  return <XCircle className="w-4 h-4 text-gray-500" />
}

export default function PlatformsPage() {
  const [filter, setFilter] = useState<string>('all')
  const connected = platforms.filter(p => p.status === 'connected').length

  const filtered = filter === 'all' ? platforms : platforms.filter(p => p.category === filter)

  return (
    <div className="min-h-screen bg-folqen-dark text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Platforms</h1>
            <p className="text-gray-400 text-sm">Connect social media and external platforms for agent automation</p>
          </div>
          <div className="text-sm text-gray-400">
            <span className="text-white font-medium">{connected}</span> / {platforms.length} connected
          </div>
        </div>

        {/* Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6">
          <p className="text-xs text-yellow-400">All platforms are Mock / Not connected. OAuth integration will be added in a future phase. <span className="font-medium">ALLOW_PUBLIC_PUBLISH is OFF</span> — agent cannot publish without your approval.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {['social', 'email', 'storage', 'messaging', 'analytics'].map(cat => (
            <div key={cat} className="bg-folqen-card border border-white/5 rounded-xl p-3 text-center">
              <p className={`text-xs capitalize px-2 py-0.5 rounded-full inline-block mb-1 ${categoryColors[cat]}`}>{cat}</p>
              <p className="text-lg font-bold">{platforms.filter(p => p.category === cat).length}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {['all', 'social', 'email', 'storage', 'messaging', 'analytics'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs capitalize transition-colors ${
                filter === f ? 'bg-folqen-purple text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(platform => (
            <div key={platform.id} className="bg-folqen-card border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {statusIcon(platform.status)}
                    <span className="text-sm font-medium">{platform.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[platform.category]}`}>
                    {platform.category}
                  </span>
                </div>
                <div className="flex gap-1">
                  {platform.status === 'connected' && (
                    <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <RefreshCw className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                  <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-4">{platform.description}</p>

              {platform.status === 'connected' ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Last sync: {platform.lastSync}</span>
                  <button className="text-xs px-3 py-1 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                    Disconnect
                  </button>
                </div>
              ) : (
                <button className="w-full flex items-center justify-center gap-2 py-2 bg-folqen-purple/10 text-folqen-purple border border-folqen-purple/20 rounded-lg text-xs hover:bg-folqen-purple/20 transition-colors">
                  <Plus className="w-3 h-3" />
                  Connect Platform
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
