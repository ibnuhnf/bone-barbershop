'use client'

import { useState } from 'react'
import { LayoutDashboard, Calendar, ClipboardList, LogOut, Menu, X, Scissors } from 'lucide-react'

interface AdminSidebarProps {
  activeView: 'dashboard' | 'schedule' | 'bookings'
  onNavigate: (view: 'dashboard' | 'schedule' | 'bookings') => void
  onLogout: () => void
}

export default function AdminSidebar({ activeView, onNavigate, onLogout }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule' as const, label: 'Jadwal', icon: Calendar },
    { id: 'bookings' as const, label: 'Bookings', icon: ClipboardList },
  ]

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#1a1a1a] p-2 rounded-lg border border-[#2a2a2a]"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#111111] border-r border-[#2a2a2a] z-40 transform transition-transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Scissors className="w-6 h-6 text-[#C9A96E]" />
            <div>
              <h1 className="text-lg font-black tracking-wider">BONE</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id)
                  setMobileOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeView === item.id
                    ? 'bg-[#C9A96E]/20 text-[#C9A96E]'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  )
}
