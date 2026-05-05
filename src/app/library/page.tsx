'use client'

import { useState } from 'react'
import { Search, Filter, FileText, Video, Image, Mail, Plus, Star, Trash2, Download } from 'lucide-react'

type ContentType = 'all' | 'post' | 'thread' | 'video' | 'email' | 'image'

interface LibraryItem {
  id: string
  title: string
  type: 'post' | 'thread' | 'video' | 'email' | 'image'
  platform: string
  createdAt: string
  status: 'published' | 'draft' | 'archived'
  starred: boolean
  words?: number
  preview: string
}

const mockItems: LibraryItem[] = [
  { id: '1', title: '5 AI Tools That Changed My Workflow', type: 'thread', platform: 'Twitter', createdAt: 'Jan 14', status: 'published', starred: true, words: 320, preview: 'A breakdown of 5 AI tools that completely transformed how I work every day...' },
  { id: '2', title: 'LinkedIn Product Launch Announcement', type: 'post', platform: 'LinkedIn', createdAt: 'Jan 12', status: 'published', starred: false, words: 180, preview: 'Excited to share something we have been working on for months...' },
  { id: '3', title: 'January Newsletter Draft', type: 'email', platform: 'Email', createdAt: 'Jan 10', status: 'draft', starred: false, words: 650, preview: 'Hello readers! Welcome to the January edition of our newsletter...' },
  { id: '4', title: 'Tutorial: Getting Started with Next.js', type: 'video', platform: 'YouTube', createdAt: 'Jan 8', status: 'published', starred: true, words: 1200, preview: 'In this video, we will walk through setting up a Next.js project from scratch...' },
  { id: '5', title: 'Behind the Scenes Photos', type: 'image', platform: 'Instagram', createdAt: 'Jan 6', status: 'published', starred: false, preview: 'A collection of behind-the-scenes photos from our studio...' },
  { id: '6', title: 'Weekly AI Digest #23', type: 'thread', platform: 'Twitter', createdAt: 'Jan 5', status: 'published', starred: false, words: 280, preview: 'This week in AI: Major announcements, new tools, and what it means for creators...' },
  { id: '7', title: 'Product Feature Walkthrough', type: 'video', platform: 'YouTube', createdAt: 'Jan 3', status: 'draft', starred: false, words: 800, preview: 'A detailed walkthrough of our latest product features and how to use them...' },
  { id: '8', title: 'December Year in Review', type: 'post', platform: 'LinkedIn', createdAt: 'Dec 31', status: 'archived', starred: true, words: 420, preview: 'Looking back at an incredible year of growth, learning, and building...' },
]

const typeIcon = (type: string) => {
  if (type === 'post' || type === 'thread') return <FileText className="w-4 h-4" />
  if (type === 'video') return <Video className="w-4 h-4" />
  if (type === 'image') return <Image className="w-4 h-4" />
  if (type === 'email') return <Mail className="w-4 h-4" />
  return <FileText className="w-4 h-4" />
}

const statusColors: Record<string, string> = {
  published: 'text-green-400 bg-green-400/10',
  draft: 'text-yellow-400 bg-yellow-400/10',
  archived: 'text-gray-400 bg-gray-400/10',
}

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>(mockItems)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ContentType>('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  const toggleStar = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, starred: !i.starred } : i))
  }

  const filtered = items
    .filter(i => typeFilter === 'all' || i.type === typeFilter)
    .filter(i => statusFilter === 'all' || i.status === statusFilter)
    .filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.preview.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-folqen-dark text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Content Library</h1>
            <p className="text-gray-400 text-sm">All your created content in one place [Mock Data]</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-folqen-gradient text-white rounded-lg text-sm hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            New Content
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Items', value: items.length },
            { label: 'Published', value: items.filter(i => i.status === 'published').length },
            { label: 'Drafts', value: items.filter(i => i.status === 'draft').length },
            { label: 'Starred', value: items.filter(i => i.starred).length },
          ].map(stat => (
            <div key={stat.label} className="bg-folqen-card border border-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search library..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-folqen-purple placeholder-gray-600"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'post', 'thread', 'video', 'email', 'image'] as ContentType[]).map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-3 py-1 rounded-full text-xs capitalize transition-colors ${
                  typeFilter === f ? 'bg-folqen-purple text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="bg-folqen-card border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400 shrink-0">
                  {typeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium truncate">{item.title}</span>
                    <span className="text-xs text-gray-500 shrink-0">{item.platform}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{item.preview}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                    <span>{item.createdAt}</span>
                    {item.words && <span>{item.words} words</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => toggleStar(item.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      item.starred ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-500 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <Star className="w-3 h-3" fill={item.starred ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Download className="w-3 h-3 text-gray-400" />
                  </button>
                  <button className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No content found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
