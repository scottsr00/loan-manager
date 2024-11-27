'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

const inter = Inter({ subsets: ['latin'] })

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-primary text-primary-foreground shadow-md">
            <nav className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <Link href="/" className="text-lg font-semibold">
                  Corporate Loan Management
                </Link>
                <div className="space-x-4">
                  <Button variant="ghost" asChild>
                    <Link href="/">Home</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/about">About</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/contact">Contact</Link>
                  </Button>
                </div>
              </div>
            </nav>
          </header>

          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>

          <footer className="bg-muted mt-8 py-6">
            <div className="container mx-auto px-4 text-center text-sm">
              © 2023 Corporate Loan Management. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
} 