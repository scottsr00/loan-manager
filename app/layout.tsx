'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { MainNav } from '@/components/MainNav'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen">
            <MainNav />
            <div className="flex-1 flex flex-col">
              <main className="flex-1 p-8 bg-background">
                {children}
              </main>
              <footer className="bg-muted py-4">
                <div className="container mx-auto px-4 text-center text-sm">
                  © 2024 NxtBank. All rights reserved.
                </div>
              </footer>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}


