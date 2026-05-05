import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MiniAgentChat } from '@/components/MiniAgentChat'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080612] flex">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      <MiniAgentChat />
    </div>
  )
}
