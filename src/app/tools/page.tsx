'use client'

import { useState } from 'react'
import { Wrench, Play, Square, Info, Search, Filter } from 'lucide-react'

type ToolStatus = 'active' | 'inactive' | 'beta'

interface Tool {
  id: string
  name: string
  description: string
  category: 'content' | 'research' | 'automation' | 'analysis' | 'publishing'
  status: ToolStatus
  enabled: boolean
  cost: 'free' | 'paid'
  usage?: number
}

const allTools: Tool[] = [
  { id: '1', name: 'Web Search', description: 'Search the web using Google/DuckDuckGo APIs for real-time information', category: 'research', status: 'active', enabled: true, cost: 'free', usage: 142 },
  { id: '2', name: 'Content Generator', description: 'Generate blog posts, social captions, and articles using AI', category: 'content', status: 'active', enabled: true, cost: 'free', usage: 89 },
  { id: '3', name: 'Image Search', description: 'Search and retrieve royalty-free images from Unsplash/Pexels', category: 'content', status: 'active', enabled: false, cost: 'free', usage: 23 },
  { id: '4', name: 'SEO Analyzer', description: 'Analyze SEO scores and suggest improvements for content', category: 'analysis', status: 'beta', enabled: false, cost: 'free', usage: 7 },
  { id: '5', name: 'Scheduler', description: 'Schedule content for future publishing with timezone support', category: 'automation', status: 'active', enabled: true, cost: 'free', usage: 56 },
  { id: '6', name: 'Email Composer', description: 'Draft and format email campaigns with templates', category: 'content', status: 'active', enabled: false, cost: 'free', usage: 12 },
  { id: '7', name: 'Social Publisher', description: 'Publish content to connected social platforms (requires approval)', category: 'publishing', status: 'inactive', enabled: false, cost: 'free', usage: 0 },
  { id: '8', name: 'Analytics Reader', description: 'Pull and summarize performance metrics from connected platforms', category: 'analysis', status: 'beta', enabled: false, cost: 'free', usage: 3 },
  { id: '9', name: 'Competitor Monitor', description: 'Track competitor content and activities online', category: 'research', status: 'beta', enabled: false, cost: 'free', usage: 0 },
  { id: '10', name: 'Hashtag Finder', description: 'Find trending and relevant hashtags for any topic', category: 'research', status: 'active', enabled: true, cost: 'free', usage: 31 },
  { id: '11', name: 'GPT-4 Vision', description: 'Analyze images and generate descriptions using GPT-4V', category: 'analysis', status: 'active', enabled: false, cost: 'paid', usage: 0 },
  { id: '12', name: 'Video Script Writer', description: 'Generate YouTube/Reels scripts from a topic or outline', category: 'content', status: 'active', enabled: false, cost: 'free', usage: 8 },
]

const statusColors: Record<ToolStatus, string> = {
  active: 'text-green-400 bg-green-400/10',
  inactive: 'text-gray-500 bg-gray-500/10',
  beta: 'text-blue-400 bg-blue-400/10',
}

const categoryColors: Record<string, string> = {
  content: 'text-purple-400',
  research: 'text-blue-400',
  automation: 'text-orange-400',
  analysis: 'text-yellow-400',
  publishing: 'text-red-400',
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>(allTools)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const toggleTool = (id: string) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t))
  }

  const filtered = tools
    .filter(t => filter === 'all' || t.category === filter)
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))

  const enabledCount = tools.filter(t => t.enabled).length

  return (
    <div className="min-h-screen bg-folqen-dark text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Tools</h1>
            <p className="text-gray-400 text-sm">Enable or disable the tools available to your AI agent</p>
          </div>
          <div className="text-sm text-gray-400">
            <span className="text-white font-medium">{enabledCount}</span> / {tools.length} enabled
          </div>
        </div>

        {/* Notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6">
          <p className="text-xs text-blue-400">Paid tools are disabled by default (ALLOW_PAID_TOOLS=false). Enable only tools your agent needs to minimize attack surface.</p>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-folqen-purple placeholder-gray-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            {['all', 'content', 'research', 'automation', 'analysis', 'publishing'].map(f => (
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
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(tool => (
            <div key={tool.id} className={`bg-folqen-card border rounded-xl p-4 transition-colors ${
              tool.enabled ? 'border-folqen-purple/30' : 'border-white/5'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wrench className={`w-4 h-4 ${categoryColors[tool.category]}`} />
                  <span className="text-sm font-medium">{tool.name}</span>
                  {tool.cost === 'paid' && (
                    <span className="text-xs px-1.5 py-0.5 bg-orange-500/10 text-orange-400 rounded">Paid</span>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[tool.status]}`}>
                  {tool.status}
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-3">{tool.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{tool.usage} uses</span>
                <div className="flex gap-2">
                  <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Info className="w-3 h-3 text-gray-400" />
                  </button>
                  <button
                    onClick={() => toggleTool(tool.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      tool.enabled
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    }`}
                  >
                    {tool.enabled ? <><Square className="w-3 h-3" /> Disable</> : <><Play className="w-3 h-3" /> Enable</>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No tools found</p>
          </div>
        )}
      </div>
    </div>
  )
}
