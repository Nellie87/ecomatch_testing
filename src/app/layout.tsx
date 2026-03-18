import type { Metadata } from 'next'
import './globals.css'
import { NavBar } from '@/components/layout/NavBar'

export const metadata: Metadata = {
  title: 'TWN — Human-in-the-Loop AI',
  description: 'Trinidad Wiseman Entity Matching Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main className="max-w-[1400px] mx-auto px-8 py-9">
          {children}
        </main>
      </body>
    </html>
  )
}
