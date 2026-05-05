'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

interface CalEvent {
  id: string
  title: string
  date: number
  month: number
  year: number
  time: string
  platform: string
  type: 'post' | 'email' | 'video' | 'thread'
  status: 'scheduled' | 'draft' | 'published'
}

const platformColors: Record<string, string> = {
  Twitter: 'bg-sky-500/20 text-sky-300',
  LinkedIn: 'bg-blue-600/20 text-blue-300',
  Instagram: 'bg-pink-500/20 text-pink-300',
  YouTube: 'bg-red-500/20 text-red-300',
  Email: 'bg-orange-500/20 text-orange-300',
}

export default function CalendarPage() {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate())

  const events: CalEvent[] = [
    { id: '1', title: 'AI Weekly Thread', date: now.getDate(), month: currentMonth, year: currentYear, time: '08:00', platform: 'Twitter', type: 'thread', status: 'scheduled' },
    { id: '2', title: 'Product Update Post', date: now.getDate() + 1, month: currentMonth, year: currentYear, time: '10:00', platform: 'LinkedIn', type: 'post', status: 'scheduled' },
    { id: '3', title: 'Behind Scenes Reel', date: now.getDate() + 2, month: currentMonth, year: currentYear, time: '14:00', platform: 'Instagram', type: 'video', status: 'draft' },
    { id: '4', title: 'Monthly Newsletter', date: now.getDate() + 5, month: currentMonth, year: currentYear, time: '09:00', platform: 'Email', type: 'email', status: 'scheduled' },
    { id: '5', title: 'Tutorial Video', date: now.getDate() + 7, month: currentMonth, year: currentYear, time: '16:00', platform: 'YouTube', type: 'video', status: 'draft' },
  ]

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay()

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear)

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const getEventsForDay = (day: number) =>
    events.filter(e => e.date === day && e.month === currentMonth && e.year === currentYear)

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : []

  return (
    <div className="min-h-screen bg-folqen-dark text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Content Calendar</h1>
            <p className="text-gray-400 text-sm">Schedule and manage your content publishing timeline [Mock - not connected]</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-folqen-gradient text-white rounded-lg text-sm hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Schedule Content
          </button>
        </div>

        <div className="flex gap-6">
          {/* Calendar */}
          <div className="flex-1 bg-folqen-card border border-white/5 rounded-xl p-4">
            {/* Month Nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold">{MONTHS[currentMonth]} {currentYear}</span>
              <button onClick={nextMonth} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayEvents = getEventsForDay(day)
                const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()
                const isSelected = day === selectedDay

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`relative p-1.5 rounded-lg text-xs transition-colors aspect-square flex flex-col items-center ${
                      isSelected ? 'bg-folqen-purple text-white' :
                      isToday ? 'bg-folqen-purple/20 text-folqen-purple' :
                      'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <span>{day}</span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map(e => (
                          <div key={e.id} className="w-1 h-1 rounded-full bg-folqen-purple" />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Events Sidebar */}
          <div className="w-64 shrink-0">
            <div className="bg-folqen-card border border-white/5 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3">
                {selectedDay ? `${MONTHS[currentMonth]} ${selectedDay}` : 'Select a day'}
              </h3>
              {selectedEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedEvents.map(event => (
                    <div key={event.id} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${platformColors[event.platform] || 'bg-gray-500/20 text-gray-300'}`}>
                          {event.platform}
                        </span>
                        <span className={`text-xs ${
                          event.status === 'scheduled' ? 'text-green-400' : 'text-yellow-400'
                        }`}>{event.status}</span>
                      </div>
                      <p className="text-xs text-white font-medium">{event.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />{event.time}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No content scheduled</p>
              )}
            </div>

            {/* Upcoming */}
            <div className="bg-folqen-card border border-white/5 rounded-xl p-4 mt-3">
              <h3 className="text-sm font-semibold mb-3">Upcoming (5)</h3>
              <div className="space-y-2">
                {events.slice(0, 5).map(e => (
                  <div key={e.id} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-folqen-purple shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-white truncate">{e.title}</p>
                      <p className="text-xs text-gray-500">{e.platform} · {MONTHS[e.month].slice(0, 3)} {e.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
