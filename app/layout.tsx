import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mortgage Calculator',
  description: 'Calculator for your mortgage, rental income, and taxes in Spain',
  generator: 'anterru',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
