"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { PaslonCard } from "@/components/paslon-card"
import { PieChart, GitCompareArrows, MapPin, ChevronLeft } from "lucide-react"
import { getDesaById } from "@/lib/api"
import type { Desa, Paslon } from "@/lib/types"

export default function DetailDesaPage() {
  const params = useParams()
  const id = Number(params.id)
  const [desa, setDesa] = useState<(Desa & { paslon: Paslon[] }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDesaById(id).then((data) => {
      setDesa(data)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="container mx-auto px-6 py-16 text-center text-gray-500">Memuat data...</main>
      </div>
    )
  }

  if (!desa) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="container mx-auto px-6 py-16 text-center text-gray-500">Desa tidak ditemukan</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="gradient-orb gradient-orb-primary w-[400px] h-[400px] top-[10%] -left-[100px] animate-pulse-glow" />
      <div className="gradient-orb gradient-orb-secondary w-[350px] h-[350px] bottom-[20%] -right-[100px] animate-pulse-glow animation-delay-200" />

      <Header />

      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <Link href="/desa" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#FCD34D] transition-colors">
            <ChevronLeft className="w-4 h-4" /> Kembali ke daftar desa
          </Link>

          <div className="space-y-2 animate-fade-in-up">
            <div className="flex items-center gap-2 text-[#FCD34D]">
              <MapPin className="w-5 h-5" />
              <span>{desa.kecamatan ?? "—"}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{desa.nama}</h1>
            <p className="text-gray-400">Terdapat {desa.paslon.length} calon kepala desa</p>
          </div>

          {desa.paslon.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              Belum ada data calon kepala desa untuk desa ini
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 animate-fade-in-up animation-delay-100">
                <Link href={`/desa/${id}/form`}>
                  <Button className="btn-primary rounded-xl cursor-pointer gap-2">
                    <PieChart className="w-4 h-4" />
                    Cek Kecocokan
                  </Button>
                </Link>
                <Link href={`/desa/${id}/compare`}>
                  <Button variant="outline" className="btn-outline rounded-xl cursor-pointer gap-2">
                    <GitCompareArrows className="w-4 h-4" />
                    Bandingkan Calon
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {desa.paslon.map((p) => (
                  <PaslonCard key={p.id} paslon={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
