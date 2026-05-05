'use client'

import { useSession } from 'next-auth/react'
import { Bell, Search, Bot } from 'lucide-react'
import { motion } from 'framer-motion'

export function Topbar() {
  const { data: session } = useSession()

  return (
    <header className="h-14 border-b border-white/5 bg-[#0A0514]/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 w-72">
        <Search className="w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search... (Ctrl+K)"
          className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-full"
          readOnly
        />
        <kbd className="text-xs text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">K</kbd>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Agent status */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-1.5"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <Bot className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs text-purple-300">Agent Ready</span>
        </motion.div>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <Bell className="w-4 h-4 text-gray-400" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-400" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-folqen-gradient flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {session?.user?.name?.[0]?.toUpperCase() || 'A'}
          </span>
        </div>
      </div>
    </header>
  )
}
