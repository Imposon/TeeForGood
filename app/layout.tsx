import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/providers/AuthProvider'
import { CustomCursor } from '@/components/CustomCursor'

export const metadata: Metadata = {
  title: 'TeeForGood | Golf Performance + Charity + Rewards',
  description: 'Transform your golf game into charitable impact. Track scores, win rewards, change lives.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="custom-cursor-active">
        <AuthProvider>
          <CustomCursor />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
