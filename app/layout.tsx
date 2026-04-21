import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CISO Intelligence Brief',
  description: 'Intelligence settimanale per CISO — powered by Claude + Web Search',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
