import { AppShell } from '@/components/layout/AppShell'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  Bot, Layers, CheckSquare, AlertTriangle,
  Calendar, Globe, Cpu, HardDrive, TrendingUp,
  Zap, Clock, Activity
} from 'lucide-react'

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
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <AppShell>
      <div className="space-y-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              Welcome back, {session.user?.name || 'Admin'} — Folqen is ready
            </p>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">All Systems Operational</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {mockStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-xl p-4 folqen-glass`}>
                <Icon className={`w-5 h-5 ${stat.color} mb-3`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Status */}
          <div className="lg:col-span-2 bg-[#0A0514] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                Agent Activity
              </h2>
              <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-md">Mock</span>
            </div>
            <div className="space-y-3">
              {mockActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    item.type === 'approval' ? 'bg-yellow-400' :
                    item.type === 'upgrade' ? 'bg-orange-400' :
                    item.type === 'research' ? 'bg-blue-400' : 'bg-purple-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">{item.event}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-600" />
                      <span className="text-xs text-gray-500">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platforms + Tools */}
          <div className="space-y-4">
            {/* Platforms */}
            <div className="bg-[#0A0514] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  Platforms
                </h3>
              </div>
              <div className="space-y-2">
                {mockPlatforms.map((p) => (
                  <div key={p.name} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-300">{p.name}</span>
                    <span className="text-xs text-gray-500 bg-gray-500/10 border border-gray-500/20 px-2 py-0.5 rounded-md">Not connected</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="bg-[#0A0514] border border-white/5 rounded-xl p-4">
              <h3 className="text-white text-sm font-semibold flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-green-400" />
                Local Tools
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-300">FFmpeg</span>
                  <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-md">Not connected</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-300">ComfyUI</span>
                  <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-md">Not connected</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-300">n8n</span>
                  <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-md">Not connected</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                <HardDrive className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">Storage: 2.4 GB / Unlimited (Local)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Safety notice */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 text-sm font-medium">Publishing & Paid Tools are Disabled by Default</p>
            <p className="text-amber-500/70 text-xs mt-1">
              ALLOW_PUBLIC_PUBLISH=false • ALLOW_PAID_TOOLS=false • Configure platforms in Settings to get started
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
