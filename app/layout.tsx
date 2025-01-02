import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { MainNav } from '@/components/layout/MainNav'
import { ThemeProvider } from '@/components/ui/theme/ThemeProvider'
import { Metadata } from 'next'
import { Providers } from '@/components/providers/Providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NxtBank - Loan Management',
  description: 'Corporate loan management and trading platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
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
          <Toaster richColors closeButton position="top-right" />
        </Providers>
      </body>
    </html>
  )
}


