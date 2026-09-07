import type { Metadata } from 'next'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pavilion',
  description: 'All-time Test cricket auctions with friends.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${GeistMono.variable} bg-background font-sans text-text-primary antialiased`}>
        {children}
      </body>
    </html>
  )
}
