'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Bot, Calendar, Layers, Library,
  CheckSquare, Globe, Wrench, Settings, BarChart3,
  DollarSign, Palette, AlertTriangle, ClipboardList,
  Workflow, FolderOpen, Bell, Zap, LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agent', label: 'Agent', icon: Bot },
  { href: '/pipeline', label: 'Pipeline', icon: Layers },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/approvals', label: 'Approvals', icon: CheckSquare },
  { href: '/platforms', label: 'Platforms', icon: Globe },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/files', label: 'Files', icon: FolderOpen },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/workflows', label: 'Workflows', icon: Workflow },
  { href: '/upgrades', label: 'Upgrades', icon: Zap },
  { href: '/audit', label: 'Audit', icon: ClipboardList },
  { href: '/errors', label: 'Errors', icon: AlertTriangle },
  { href: '/monetization', label: 'Monetize', icon: DollarSign },
  { href: '/brand', label: 'Brand', icon: Palette },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#0A0514] border-r border-white/5 flex flex-col z-40">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-folqen-gradient flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-none">Folqen</h1>
          <p className="text-purple-400 text-xs">AI Creator</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <motion.div whileHover={{ x: 2 }}
                className={cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                  isActive ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}>
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/5">
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 w-full">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
