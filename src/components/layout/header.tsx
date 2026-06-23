"use client"

import Link from "next/link"
import { Home, Search, ArrowLeft } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Header() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  return (
    <header className="header-border relative z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isHome && (
              <Link href="/">
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#DC2626] to-[#FCD34D] flex items-center justify-center text-black font-bold text-sm">
                PK
              </div>
              <span className="text-lg font-bold text-white">Paham Kades</span>
            </Link>
          </div>

          <nav className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="cursor-pointer gap-1">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Beranda</span>
              </Button>
            </Link>
            <Link href="/desa">
              <Button variant="ghost" size="sm" className="cursor-pointer gap-1">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Cari Desa</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
