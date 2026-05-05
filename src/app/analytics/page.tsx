'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Eye, Heart, Share2, MessageCircle, BarChart3, Users } from 'lucide-react'

const ranges = ['7d', '30d', '90d', 'All time']

const platformStats = [
  { platform: 'Twitter', followers: '2,847', posts: 34, impressions: '48.2K', engagement: '3.2%', trend: 'up' },
  { platform: 'LinkedIn', followers: '1,203', posts: 12, impressions: '21.5K', engagement: '5.8%', trend: 'up' },
  { platform: 'Instagram', followers: '892', posts: 8, impressions: '12.1K', engagement: '4.1%', trend: 'down' },
  { platform: 'YouTube', followers: '156', posts: 3, impressions: '8.4K', engagement: '7.2%', trend: 'up' },
]

const topContent = [
  { title: '5 AI Tools That Changed My Workflow', platform: 'Twitter', impressions: '12,400', engagement: '8.2%', date: 'Jan 14' },
  { title: 'How I Built a Content Pipeline with No Code', platform: 'LinkedIn', impressions: '8,750', engagement: '12.4%', date: 'Jan 12' },
  { title: 'Weekly AI News Thread #47', platform: 'Twitter', impressions: '7,200', engagement: '4.8%', date: 'Jan 11' },
  { title: 'Behind The Scenes: My Writing Process', platform: 'Instagram', impressions: '5,100', engagement: '6.1%', date: 'Jan 10' },
  { title: 'The Future of Content Creation [Video]', platform: 'YouTube', impressions: '4,800', engagement: '9.3%', date: 'Jan 9' },
]

const weeklyData = [
  { day: 'Mon', impressions: 3200, engagement: 89 },
  { day: 'Tue', impressions: 4100, engagement: 124 },
  { day: 'Wed', impressions: 2800, engagement: 71 },
  { day: 'Thu', impressions: 5600, engagement: 201 },
  { day: 'Fri', impressions: 4900, engagement: 167 },
  { day: 'Sat', impressions: 3100, engagement: 88 },
  { day: 'Sun', impressions: 2400, engagement: 55 },
]

const maxImpressions = Math.max(...weeklyData.map(d => d.impressions))

export default function AnalyticsPage() {
  const [range, setRange] = useState('7d')

  return (
    <div className="min-h-screen bg-folqen-dark text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
            <p className="text-gray-400 text-sm">Content performance across all platforms [Mock Data]</p>
          </div>
          <div className="flex gap-2">
            {ranges.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  range === r ? 'bg-folqen-purple text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { icon: Eye, label: 'Total Impressions', value: '90.2K', change: '+12.4%', up: true },
            { icon: Heart, label: 'Total Engagements', value: '3,847', change: '+8.1%', up: true },
            { icon: Users, label: 'New Followers', value: '+284', change: '+5.2%', up: true },
            { icon: Share2, label: 'Shares', value: '492', change: '-2.1%', up: false },
          ].map(stat => (
            <div key={stat.label} className="bg-folqen-card border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-4 h-4 text-gray-400" />
                <span className={`text-xs flex items-center gap-0.5 ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className="bg-folqen-card border border-white/5 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-folqen-purple" />
              Impressions This Week
            </h2>
            <span className="text-xs text-yellow-400">[Mock Data]</span>
          </div>
          <div className="flex items-end gap-3 h-32">
            {weeklyData.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-folqen-purple/40 hover:bg-folqen-purple/60 rounded-t transition-colors"
                  style={{ height: `${(d.impressions / maxImpressions) * 100}%` }}
                />
                <span className="text-xs text-gray-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Platform Breakdown */}
          <div className="bg-folqen-card border border-white/5 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-4">Platform Breakdown</h2>
            <div className="space-y-3">
              {platformStats.map(p => (
                <div key={p.platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{p.platform}</span>
                    {p.trend === 'up'
                      ? <TrendingUp className="w-3 h-3 text-green-400" />
                      : <TrendingDown className="w-3 h-3 text-red-400" />}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white">{p.impressions} impressions</p>
                    <p className="text-xs text-gray-500">{p.engagement} engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Content */}
          <div className="bg-folqen-card border border-white/5 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-4">Top Performing Content</h2>
            <div className="space-y-3">
              {topContent.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs text-gray-600 w-4 shrink-0">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{c.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{c.platform}</span>
                      <span className="text-xs text-gray-600">{c.date}</span>
                      <span className="text-xs text-green-400">{c.engagement}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
