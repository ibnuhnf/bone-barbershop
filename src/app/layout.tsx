import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BONE Barbershop - Book Your Style',
  description: 'Bone Barbershop - Barbershop modern dengan booking online. Potong rambut profesional oleh Abi.',
  keywords: ['barbershop', 'potong rambut', 'booking', 'bone barbershop'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="BONE" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Montserrat:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
