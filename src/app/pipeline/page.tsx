'use client'

import { useState } from 'react'
import { Plus, Play, Pause, Trash2, MoreHorizontal, Zap, Clock, CheckCircle } from 'lucide-react'

type PipelineStatus = 'active' | 'paused' | 'draft' | 'completed'

interface PipelineStep {
  id: string
  name: string
  type: 'trigger' | 'action' | 'condition' | 'output'
}

interface Pipeline {
  id: string
  name: string
  description: string
  status: PipelineStatus
  steps: PipelineStep[]
  lastRun?: string
  runs: number
  nextRun?: string
}

const mockPipelines: Pipeline[] = [
  {
    id: '1',
    name: 'Daily Twitter Thread',
    description: 'Every morning, research trending topics and post a 5-tweet thread',
    status: 'active',
    runs: 12,
    lastRun: '2024-01-15 08:00',
    nextRun: '2024-01-16 08:00',
    steps: [
      { id: 's1', name: 'Schedule Trigger (8:00 AM)', type: 'trigger' },
      { id: 's2', name: 'Web Search: trending topics', type: 'action' },
      { id: 's3', name: 'Generate Thread Content', type: 'action' },
      { id: 's4', name: 'Request Human Approval', type: 'condition' },
      { id: 's5', name: 'Post to Twitter', type: 'output' },
    ],
  },
  {
    id: '2',
    name: 'Weekly Newsletter',
    description: 'Every Friday, compile weekly highlights and send email newsletter',
    status: 'paused',
    runs: 3,
    lastRun: '2024-01-12 17:00',
    nextRun: '-',
    steps: [
      { id: 's1', name: 'Schedule Trigger (Fri 5PM)', type: 'trigger' },
      { id: 's2', name: 'Gather Weekly Content', type: 'action' },
      { id: 's3', name: 'Write Newsletter', type: 'action' },
      { id: 's4', name: 'Request Human Approval', type: 'condition' },
      { id: 's5', name: 'Send via Email', type: 'output' },
    ],
  },
  {
    id: '3',
    name: 'Content Repurpose',
    description: 'Take a blog post URL and repurpose into LinkedIn post + Twitter thread',
    status: 'draft',
    runs: 0,
    steps: [
      { id: 's1', name: 'Manual Trigger (URL input)', type: 'trigger' },
      { id: 's2', name: 'Fetch and Parse URL', type: 'action' },
      { id: 's3', name: 'Generate LinkedIn Post', type: 'action' },
      { id: 's4', name: 'Generate Twitter Thread', type: 'action' },
      { id: 's5', name: 'Request Human Approval', type: 'condition' },
      { id: 's6', name: 'Publish to Platforms', type: 'output' },
    ],
  },
]

const statusColors: Record<PipelineStatus, string> = {
  active: 'text-green-400 bg-green-400/10',
  paused: 'text-yellow-400 bg-yellow-400/10',
  draft: 'text-gray-400 bg-gray-400/10',
  completed: 'text-blue-400 bg-blue-400/10',
}

const stepColors: Record<string, string> = {
  trigger: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  action: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  condition: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  output: 'bg-green-500/20 text-green-300 border-green-500/30',
}

export default function PipelinePage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>(mockPipelines)
  const [expanded, setExpanded] = useState<string | null>('1')

  const toggleStatus = (id: string) => {
    setPipelines(prev => prev.map(p => {
      if (p.id !== id) return p
      return { ...p, status: p.status === 'active' ? 'paused' : 'active' }
    }))
  }

  return (
    <div className="min-h-screen bg-folqen-dark text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Pipeline</h1>
            <p className="text-gray-400 text-sm">Automate multi-step agent workflows [Mock - not connected]</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-folqen-gradient text-white rounded-lg text-sm hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            New Pipeline
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Pipelines', value: pipelines.length },
            { label: 'Active', value: pipelines.filter(p => p.status === 'active').length },
            { label: 'Total Runs', value: pipelines.reduce((a, p) => a + p.runs, 0) },
            { label: 'Draft', value: pipelines.filter(p => p.status === 'draft').length },
          ].map(stat => (
            <div key={stat.label} className="bg-folqen-card border border-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Pipelines */}
        <div className="space-y-4">
          {pipelines.map(pipeline => (
            <div key={pipeline.id} className="bg-folqen-card border border-white/5 rounded-xl overflow-hidden">
              {/* Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/2"
                onClick={() => setExpanded(expanded === pipeline.id ? null : pipeline.id)}
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-folqen-purple" />
                  <div>
                    <p className="text-sm font-medium">{pipeline.name}</p>
                    <p className="text-xs text-gray-500">{pipeline.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-gray-500">
                    <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last: {pipeline.lastRun || 'Never'}</p>
                    <p>{pipeline.runs} runs</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[pipeline.status]}`}>
                    {pipeline.status}
                  </span>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    {pipeline.status !== 'draft' && (
                      <button
                        onClick={() => toggleStatus(pipeline.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        {pipeline.status === 'active'
                          ? <Pause className="w-3 h-3 text-yellow-400" />
                          : <Play className="w-3 h-3 text-green-400" />}
                      </button>
                    )}
                    <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <MoreHorizontal className="w-3 h-3 text-gray-400" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Steps - Expanded */}
              {expanded === pipeline.id && (
                <div className="px-4 pb-4 border-t border-white/5">
                  <p className="text-xs text-gray-500 mt-3 mb-3">Pipeline Steps</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {pipeline.steps.map((step, idx) => (
                      <div key={step.id} className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs ${stepColors[step.type]}`}>
                          {step.type === 'trigger' && <Zap className="w-3 h-3" />}
                          {step.type === 'action' && <Play className="w-3 h-3" />}
                          {step.type === 'condition' && <CheckCircle className="w-3 h-3" />}
                          {step.type === 'output' && <CheckCircle className="w-3 h-3" />}
                          {step.name}
                        </div>
                        {idx < pipeline.steps.length - 1 && (
                          <span className="text-gray-600 text-xs">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {pipeline.nextRun && pipeline.nextRun !== '-' && (
                    <p className="text-xs text-gray-500 mt-3">Next run: {pipeline.nextRun}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
