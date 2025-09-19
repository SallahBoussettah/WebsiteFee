import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Payout Project - Coinbase Commerce',
  description: 'Accept crypto payments with Coinbase Commerce',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}