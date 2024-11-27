'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calculator,
  BookOpen,
  History,
  Settings,
  PieChart,
  Users,
  Building2,
  Zap
} from 'lucide-react'

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard
  },
  {
    title: "Loan Calculator",
    href: "/calculator",
    icon: Calculator
  },
  {
    title: "Position Book",
    href: "/positions",
    icon: BookOpen
  },
  {
    title: "Trade History",
    href: "/trades",
    icon: History
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: PieChart
  },
  {
    title: "Counterparties",
    href: "/counterparties",
    icon: Users
  },
  {
    title: "Institutions",
    href: "/institutions",
    icon: Building2
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings
  }
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-[200px] flex-col border-r bg-white">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold relative group">
            <Zap 
              className="w-6 h-6 transform rotate-12 transition-transform group-hover:rotate-0 group-hover:scale-110" 
              strokeWidth={2.5}
            />
          </div>
          <span className="font-semibold">NxtBank</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === item.href 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 