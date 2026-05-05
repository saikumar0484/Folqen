'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, Filter } from 'lucide-react'

type Status = 'pending' | 'approved' | 'rejected'

interface Approval {
  id: string
  title: string
  description: string
  type: 'publish' | 'email' | 'api' | 'delete'
  platform?: string
  requestedAt: string
  status: Status
  agentName: string
  preview?: string
}

const mockApprovals: Approval[] = [
  {
    id: '1',
    title: 'Publish LinkedIn Post',
    description: 'Agent wants to publish a post about product launch on LinkedIn.',
    type: 'publish',
    platform: 'LinkedIn',
    requestedAt: '2024-01-15 10:30',
    status: 'pending',
    agentName: 'ContentBot',
    preview: 'Excited to announce our new AI-powered dashboard! After months of work...',
  },
  {
    id: '2',
    title: 'Send Email Campaign',
    description: 'Agent wants to send a newsletter to 1,200 subscribers.',
    type: 'email',
    platform: 'Email',
    requestedAt: '2024-01-15 09:15',
    status: 'pending',
    agentName: 'MarketingBot',
    preview: 'Subject: January Newsletter - Big Updates Inside!',
  },
  {
    id: '3',
    title: 'Post Twitter Thread',
    description: 'Agent wants to post a 5-tweet thread about AI trends.',
    type: 'publish',
    platform: 'Twitter',
    requestedAt: '2024-01-14 16:45',
    status: 'approved',
    agentName: 'ContentBot',
  },
  {
    id: '4',
    title: 'Delete Old Blog Posts',
    description: 'Agent wants to delete 12 draft blog posts older than 6 months.',
    type: 'delete',
    requestedAt: '2024-01-14 14:00',
    status: 'rejected',
    agentName: 'CleanupBot',
  },
  {
    id: '5',
    title: 'Call OpenAI API',
    description: 'Agent wants to make 500 API calls to generate content. Estimated cost: $2.50',
    type: 'api',
    platform: 'OpenAI',
    requestedAt: '2024-01-14 11:30',
    status: 'pending',
    agentName: 'ContentBot',
  },
]

const statusColors: Record<Status, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  approved: 'text-green-400 bg-green-400/10',
  rejected: 'text-red-400 bg-red-400/10',
}

const statusIcons: Record<Status, React.ReactNode> = {
  pending: <Clock className="w-3 h-3" />,
  approved: <CheckCircle className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>(mockApprovals)
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = filter === 'all' ? approvals : approvals.filter(a => a.status === filter)
  const pending = approvals.filter(a => a.status === 'pending').length

  const updateStatus = (id: string, status: Status) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setSelectedId(null)
  }

  const selected = approvals.find(a => a.id === selectedId)

  return (
    <div className="min-h-screen bg-folqen-dark text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Approvals</h1>
            <p className="text-gray-400 text-sm">Review and approve agent actions before they execute</p>
          </div>
          {pending > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">{pending} pending approval{pending > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(['pending', 'approved', 'rejected'] as Status[]).map(status => (
            <div key={status} className="bg-folqen-card border border-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-xs capitalize mb-1">{status}</p>
              <p className="text-2xl font-bold">{approvals.filter(a => a.status === status).length}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-400" />
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
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

        <div className="flex gap-4">
          {/* List */}
          <div className="flex-1 space-y-3">
            {filtered.map(approval => (
              <div
                key={approval.id}
                onClick={() => setSelectedId(approval.id === selectedId ? null : approval.id)}
                className={`bg-folqen-card border rounded-xl p-4 cursor-pointer transition-colors ${
                  selectedId === approval.id ? 'border-folqen-purple' : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{approval.title}</span>
                      {approval.platform && (
                        <span className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-gray-400">{approval.platform}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{approval.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>by {approval.agentName}</span>
                      <span>{approval.requestedAt}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusColors[approval.status]}`}>
                    {statusIcons[approval.status]}
                    <span className="capitalize">{approval.status}</span>
                  </div>
                </div>

                {approval.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={e => { e.stopPropagation(); updateStatus(approval.id, 'approved') }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" /> Approve
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); updateStatus(approval.id, 'rejected') }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors"
                    >
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedId(approval.id) }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/5 text-gray-400 rounded-lg text-xs hover:bg-white/10 transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                  </div>
                )}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No {filter === 'all' ? '' : filter} approvals</p>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {selected?.preview && (
            <div className="w-72 bg-folqen-card border border-white/5 rounded-xl p-4 h-fit">
              <h3 className="text-sm font-semibold mb-3">Content Preview</h3>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-300 leading-relaxed">{selected.preview}</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">This is a preview of the content the agent wants to publish.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
