'use client'

import { useState } from 'react'
import { Settings, Bell, Shield, Cpu, Globe, Key, Save, ToggleLeft, ToggleRight } from 'lucide-react'

const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'ai', label: 'AI & Agent', icon: Cpu },
  { id: 'integrations', label: 'Integrations', icon: Globe },
  { id: 'api', label: 'API Keys', icon: Key },
]

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="focus:outline-none">
      {enabled
        ? <ToggleRight className="w-8 h-8 text-folqen-purple" />
        : <ToggleLeft className="w-8 h-8 text-gray-500" />}
    </button>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    darkMode: true,
    compactView: false,
    autoSave: true,
    notifications: true,
    emailAlerts: false,
    slackAlerts: false,
    requireApproval: true,
    allowPublicPublish: false,
    allowPaidTools: false,
    allowBrowserAutomation: false,
    aiModel: 'gpt-4o-mini',
    maxTokens: '4096',
    temperature: '0.7',
    agentMemory: true,
    workspaceName: 'My Workspace',
    timezone: 'Asia/Kolkata',
  })

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-folqen-dark text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
          <p className="text-gray-400 text-sm">Manage your workspace preferences and configurations</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-48 shrink-0">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-folqen-purple/20 text-folqen-purple'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 bg-folqen-card border border-white/5 rounded-xl p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Workspace Name</label>
                    <input
                      type="text"
                      value={settings.workspaceName}
                      onChange={e => setSettings(p => ({ ...p, workspaceName: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-folqen-purple"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={e => setSettings(p => ({ ...p, timezone: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-folqen-purple"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Dark Mode</p>
                      <p className="text-xs text-gray-500">Use dark theme across the app</p>
                    </div>
                    <Toggle enabled={settings.darkMode} onToggle={() => toggle('darkMode')} />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Compact View</p>
                      <p className="text-xs text-gray-500">Reduce spacing and padding</p>
                    </div>
                    <Toggle enabled={settings.compactView} onToggle={() => toggle('compactView')} />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Auto Save</p>
                      <p className="text-xs text-gray-500">Automatically save changes</p>
                    </div>
                    <Toggle enabled={settings.autoSave} onToggle={() => toggle('autoSave')} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Notification Settings</h2>
                <div className="space-y-4">
                  {[
                    { key: 'notifications' as const, label: 'Push Notifications', desc: 'Show in-app notifications' },
                    { key: 'emailAlerts' as const, label: 'Email Alerts', desc: 'Send alerts via email' },
                    { key: 'slackAlerts' as const, label: 'Slack Alerts', desc: 'Send alerts to Slack (Mock - not connected)' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <Toggle enabled={settings[item.key] as boolean} onToggle={() => toggle(item.key)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Security Settings</h2>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-yellow-400">Security features default to OFF for safety. Enable only what you need.</p>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'requireApproval' as const, label: 'Require Human Approval', desc: 'All agent actions require manual approval before execution' },
                    { key: 'allowPublicPublish' as const, label: 'Allow Public Publishing', desc: 'Allow agent to publish content publicly (DANGEROUS)' },
                    { key: 'allowPaidTools' as const, label: 'Allow Paid Tools', desc: 'Allow agent to use paid API services' },
                    { key: 'allowBrowserAutomation' as const, label: 'Allow Browser Automation', desc: 'Allow agent to control browser' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <Toggle enabled={settings[item.key] as boolean} onToggle={() => toggle(item.key)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">AI & Agent Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Default AI Model <span className="text-yellow-400 text-xs">[Mock - Not connected]</span></label>
                    <select
                      value={settings.aiModel}
                      onChange={e => setSettings(p => ({ ...p, aiModel: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-folqen-purple"
                    >
                      <option value="gpt-4o-mini">GPT-4o Mini (Free tier)</option>
                      <option value="gpt-4o">GPT-4o (Paid)</option>
                      <option value="claude-3-haiku">Claude 3 Haiku</option>
                      <option value="gemini-flash">Gemini 1.5 Flash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Max Tokens</label>
                    <input
                      type="number"
                      value={settings.maxTokens}
                      onChange={e => setSettings(p => ({ ...p, maxTokens: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-folqen-purple"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Temperature (0.0 - 1.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={settings.temperature}
                      onChange={e => setSettings(p => ({ ...p, temperature: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-folqen-purple"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Agent Memory</p>
                      <p className="text-xs text-gray-500">Persist conversation context across sessions <span className="text-yellow-400">[Mock]</span></p>
                    </div>
                    <Toggle enabled={settings.agentMemory} onToggle={() => toggle('agentMemory')} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Integrations <span className="text-yellow-400 text-sm font-normal">[Mock - Not connected]</span></h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'Twitter/X', status: 'disconnected' },
                    { name: 'LinkedIn', status: 'disconnected' },
                    { name: 'Instagram', status: 'disconnected' },
                    { name: 'YouTube', status: 'disconnected' },
                    { name: 'Notion', status: 'disconnected' },
                    { name: 'Google Drive', status: 'disconnected' },
                    { name: 'Slack', status: 'disconnected' },
                    { name: 'Telegram', status: 'disconnected' },
                  ].map(intg => (
                    <div key={intg.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-sm">{intg.name}</span>
                      <button className="text-xs px-3 py-1 rounded-full bg-folqen-purple/20 text-folqen-purple hover:bg-folqen-purple/30 transition-colors">
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">API Keys <span className="text-yellow-400 text-sm font-normal">[Mock - Not connected]</span></h2>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-red-400">Never share your API keys. They are stored encrypted and never shown in full after saving.</p>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'OpenAI API Key', placeholder: 'sk-...' },
                    { label: 'Anthropic API Key', placeholder: 'sk-ant-...' },
                    { label: 'Google Gemini API Key', placeholder: 'AIza...' },
                    { label: 'Twitter Bearer Token', placeholder: 'Bearer ...' },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder={field.placeholder}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-folqen-purple"
                        />
                        <button className="px-3 py-2 bg-folqen-purple/20 text-folqen-purple rounded-lg text-sm hover:bg-folqen-purple/30 transition-colors">
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-4 border-t border-white/10">
              <button className="px-6 py-2 bg-folqen-gradient text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
