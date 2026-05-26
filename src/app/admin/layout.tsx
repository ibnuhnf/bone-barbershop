import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BONE Admin Panel',
  description: 'Admin panel untuk mengelola Bone Barbershop',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
