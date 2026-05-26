'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DashboardView from '@/components/admin/DashboardView'
import ScheduleView from '@/components/admin/ScheduleView'
import BookingsView from '@/components/admin/BookingsView'
import { Loader2 } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'dashboard' | 'schedule' | 'bookings'>('dashboard')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/admin/login')
      return
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C9A96E] animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black flex">
      <AdminSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onLogout={handleLogout}
      />
      <div className="flex-1 ml-0 md:ml-64">
        <div className="p-4 md:p-8">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'schedule' && <ScheduleView />}
          {activeView === 'bookings' && <BookingsView />}
        </div>
      </div>
    </main>
  )
}
