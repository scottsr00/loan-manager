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
  Zap,
  FileText,
  ScrollText,
  Files,
  Building,
  Users2,
  LayoutList
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
    title: "Positions",
    icon: BookOpen,
    submenu: [
      {
        title: "Hierarchy View",
        href: "/positions",
        icon: BookOpen
      },
      {
        title: "Inventory View",
        href: "/positions/inventory",
        icon: LayoutList
      }
    ]
  },
  {
    title: "Trade History",
    href: "/trades",
    icon: History
  },
  {
    title: "Servicing",
    href: "/servicing",
    icon: FileText
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: ScrollText
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
    title: "Entities",
    href: "/entities",
    icon: Building2
  },
  {
    title: "Credit Agreements",
    href: "/credit-agreements",
    icon: ScrollText
  },
  {
    title: "Facilities",
    href: "/facilities",
    icon: Files
  },
  {
    title: "Borrowers",
    href: "/borrowers",
    icon: Building
  },
  {
    title: "Team Management",
    href: "/team",
    icon: Users2
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
    <div className="flex h-full w-[200px] flex-col border-r border-border bg-card">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-foreground opacity-20" />
            <Zap 
              className="w-6 h-6 transform rotate-12 transition-transform group-hover:rotate-0 group-hover:scale-110 relative z-10" 
              strokeWidth={2.5}
            />
          </div>
          <span className="font-semibold text-foreground">NxtBank</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          if (item.submenu) {
            return (
              <div key={item.title} className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  {item.title}
                </div>
                <div className="pl-4 space-y-1">
                  {item.submenu.map((subItem) => {
                    const SubIcon = subItem.icon
                    const isActive = pathname === subItem.href
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <SubIcon className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                        )} />
                        {subItem.title}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          }
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 transition-colors",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
              )} />
              {item.title}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 mt-auto border-t border-border">
        <div className="text-xs text-muted-foreground">
          Version 2.0.0
        </div>
      </div>
    </div>
  )
} 