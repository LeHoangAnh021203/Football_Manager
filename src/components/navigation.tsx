"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, Trophy, MessageSquare, Shuffle, Home } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/players", label: "Cầu thủ", icon: Users },
    { href: "/matches", label: "Trận đấu", icon: Trophy },
    { href: "/message", label: "Nhắn tin", icon: MessageSquare },
    { href: "/team-balancer", label: "Chia đội", icon: Shuffle },
  ]

  return (
    <>
      <nav className="sticky top-0 z-40 hidden border-b border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50 md:block">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-2xl font-black tracking-tight">
              Football With Fox<span className="text-primary">.</span>
            </Link>
            <div className="flex gap-1">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 px-2 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
