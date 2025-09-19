import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HostPay - Professional Website Hosting & Maintenance',
  description: 'Premium website hosting and maintenance service with crypto payments. Fast, secure, and reliable hosting by Salah Eddine Boussettah.',
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