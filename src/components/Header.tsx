'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Trophy, Users, BarChart3 } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/teams', label: 'Đội bóng', icon: <Users className="mr-1 inline h-4 w-4" /> },
    { href: '/players', label: 'Cầu thủ' },
    { href: '/matches', label: 'Trận đấu' },
    { href: '/stats', label: 'Thống kê', icon: <BarChart3 className="mr-1 inline h-4 w-4" /> },
  ]

  return (
    <header className="sticky top-0 z-30 bg-white/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 sm:py-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary-600" />
            <Link href="/" className="text-xl font-bold text-gray-900 sm:text-2xl">
              Football Manager
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-gray-700 transition hover:bg-primary/5 hover:text-primary-600"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-md p-2 text-gray-700 transition hover:bg-primary/5 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Toggle navigation"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden ${isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} absolute inset-x-0 top-full z-20 mt-1 origin-top rounded-b-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-lg transition duration-200`}
        >
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 transition hover:bg-primary/5 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
