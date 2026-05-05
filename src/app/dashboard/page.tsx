import { AppShell } from '@/components/layout/AppShell'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  Bot, Layers, CheckSquare, AlertTriangle,
  Calendar, Globe, Cpu, HardDrive, TrendingUp,
  Zap, Clock, Activity
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const mockStats = [
  { label: 'Active Jobs', value: '3', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { label: 'Drafts Ready', value: '7', icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { label: 'Pending Approvals', value: '2', icon: CheckSquare, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { label: 'Failed Tasks', value: '1', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { label: 'Scheduled Posts', value: '5', icon: Calendar, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  { label: 'Improvement Ideas', value: '4', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
]

const mockPlatforms = [
  { name: 'YouTube', status: 'not_connected', icon: '\u25b6' },
  { name: 'Instagram', status: 'not_connected', icon: '\u2665' },
  { name: 'Facebook', status: 'not_connected', icon: 'f' },
  { name: 'Snapchat', status: 'not_connected', icon: '\u25c4' },
  { name: 'Threads', status: 'not_connected', icon: '@' },
]

const mockActivity = [
  { time: '2 min ago', event: 'Agent researched topic: The Vanishing Hitchhiker of NH-8', type: 'research' },
  { time: '15 min ago', event: 'Script draft created: Cursed Object of Rajasthan', type: 'create' },
  { time: '1 hr ago', event: 'Approval requested: Publish Short to YouTube', type: 'approval' },
  { time: '2 hr ago', event: 'Self-Improvement: Found new free TTS tool (Kokoro)', type: 'upgrade' },
  { time: '3 hr ago', event: 'Content storyboard generated for: Bhangarh Fort Legend', type: 'create' },
]

export default async function DashboardPage() {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch {
    // DB not available during build
  }
  if (!session) redirect('/login')

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back, {session?.user?.name || 'Admin'} — Folqen is ready
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded px-2 py-0.5 mt-2">
            All Systems Operational
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {mockStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className={`rounded-lg border p-3 ${stat.bg} ${stat.border}`}>
                <Icon className={`w-4 h-4 ${stat.color} mb-2`} />
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Agent Activity */}
          <div className="lg:col-span-2 rounded-lg border border-white/10 bg-white/5 p-4">
            <h2 className="text-sm font-semibold text-white mb-3">Agent Activity</h2>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded mb-3 inline-block">Mock</span>
            <div className="space-y-2">
              {mockActivity.map((item, i) => (
                <div key={i} className="flex items-start justify-between text-xs">
                  <span className="text-gray-300">{item.event}</span>
                  <span className="text-gray-500 ml-2 shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platforms + Tools */}
          <div className="space-y-4">
            {/* Platforms */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h3 className="text-xs font-semibold text-white mb-3">Platforms</h3>
              {mockPlatforms.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-xs py-1">
                  <span className="text-gray-300">{p.name}</span>
                  <span className="text-gray-500">Not connected</span>
                </div>
              ))}
            </div>

            {/* Tools */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h3 className="text-xs font-semibold text-white mb-3">Local Tools</h3>
              {['FFmpeg', 'ComfyUI', 'n8n'].map((tool) => (
                <div key={tool} className="flex items-center justify-between text-xs py-1">
                  <span className="text-gray-300">{tool}</span>
                  <span className="text-gray-500">Not connected</span>
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-2">Storage: 2.4 GB / Unlimited (Local)</p>
            </div>
          </div>
        </div>

        {/* Safety notice */}
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-400">
          <strong>Publishing &amp; Paid Tools are Disabled by Default</strong>
          <p className="text-gray-500 mt-1">ALLOW_PUBLIC_PUBLISH=false • ALLOW_PAID_TOOLS=false • Configure platforms in Settings to get started</p>
        </div>
      </div>
    </AppShell>
  )
}
