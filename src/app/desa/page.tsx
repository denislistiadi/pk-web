"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Users, ChevronRight } from "lucide-react"
import { getKecamatan, getDesa } from "@/lib/api"
import type { Kecamatan, Desa } from "@/lib/types"

export default function DesaPage() {
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([])
  const [desaList, setDesaList] = useState<Desa[]>([])
  const [search, setSearch] = useState("")
  const [selectedKecamatan, setSelectedKecamatan] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getKecamatan().then(setKecamatanList)
    getDesa().then((data) => {
      setDesaList(data)
      setLoading(false)
    })
  }, [])

  const filtered = desaList.filter((d) => {
    const matchSearch = d.nama.toLowerCase().includes(search.toLowerCase()) ||
      (d.kecamatan?.toLowerCase().includes(search.toLowerCase()))
    const matchKec = !selectedKecamatan || d.kecamatan_id === selectedKecamatan
    return matchSearch && matchKec
  })

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="gradient-orb gradient-orb-primary w-[500px] h-[500px] -top-[150px] -right-[100px] animate-pulse-glow" />
      <div className="gradient-orb gradient-orb-secondary w-[400px] h-[400px] bottom-[10%] -left-[100px] animate-pulse-glow animation-delay-200" />

      <Header />

      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2 animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-bold">
              Cari <span className="text-[#FCD34D]">Desa</span>
            </h1>
            <p className="text-gray-400">Pilih desa untuk melihat calon kepala desa yang tersedia</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-100">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Cari desa atau kecamatan..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={selectedKecamatan ?? ""}
              onChange={(e) => setSelectedKecamatan(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Semua Kecamatan</option>
              {kecamatanList.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-500">Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              Tidak ada desa ditemukan
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up animation-delay-200">
              {filtered.map((d) => (
                <Link key={d.id} href={`/desa/${d.id}`}>
                  <Card className="glass-card h-full cursor-pointer group">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 text-[#FCD34D]">
                          <MapPin className="w-4 h-4" />
                          <span className="text-xs font-medium">{d.kecamatan}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#FCD34D] transition-colors" />
                      </div>
                      <h3 className="font-semibold text-lg">{d.nama}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{d.paslon_count ?? "—"} calon</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
