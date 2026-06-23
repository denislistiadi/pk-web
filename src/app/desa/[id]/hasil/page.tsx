"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft, Trophy, Sparkles, GitCompareArrows, RefreshCw,
  Lightbulb, ListChecks, GraduationCap, CalendarDays,
} from "lucide-react"
import type { CocokkanResponse } from "@/lib/types"

export default function HasilPage() {
  const params = useParams()
  const id = Number(params.id)
  const [data, setData] = useState<CocokkanResponse | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem("cocokkan_result")
    if (stored) {
      try {
        setData(JSON.parse(stored))
      } catch { /* ignore */ }
    }
  }, [])

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="container mx-auto px-6 py-16 text-center space-y-6">
          <p className="text-gray-500">Belum ada hasil. Silakan isi form preferensi terlebih dahulu.</p>
          <Link href={`/desa/${id}/form`}>
            <Button className="btn-primary rounded-xl cursor-pointer gap-2">
              <Sparkles className="w-4 h-4" /> Isi Form Preferensi
            </Button>
          </Link>
        </main>
      </div>
    )
  }

  const sorted = [...data.results].sort((a, b) => b.skor_total - a.skor_total)

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="gradient-orb gradient-orb-primary w-[450px] h-[450px] top-[5%] -right-[150px] animate-pulse-glow" />
      <div className="gradient-orb gradient-orb-secondary w-[350px] h-[350px] bottom-[10%] -left-[100px] animate-pulse-glow animation-delay-200" />
      <div className="pulse-ring w-[250px] h-[250px] top-[30%] left-[5%]" />

      <Header />

      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <Link
            href={`/desa/${id}`}
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#FCD34D] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali
          </Link>

          <div className="text-center space-y-2 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FCD34D]/30 bg-[#FCD34D]/5 text-[#FCD34D] text-sm">
              <Trophy className="w-4 h-4" />
              Hasil Kecocokan
            </div>
            <h1 className="text-3xl font-bold">{data.desa}</h1>
            <p className="text-gray-400">Berdasarkan preferensi yang Anda isi</p>
          </div>

          <div className="animate-fade-in-up animation-delay-100">
            <Card className="glass-card">
              <CardContent className="p-4 space-y-2 text-sm text-gray-400">
                <p><span className="text-gray-300">Visi Anda:</span> {data.user_input.visi}</p>
                <p><span className="text-gray-300">Misi dipilih:</span> {data.user_input.misi_count} item</p>
                <p><span className="text-gray-300">Pendidikan min:</span> {data.user_input.pendidikan_min}</p>
                <p><span className="text-gray-300">Usia:</span> {data.user_input.umur_min} - {data.user_input.umur_max} tahun</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {sorted.map((r, idx) => (
              <div key={r.paslon_id} className="animate-fade-in-up" style={{ animationDelay: `${(idx + 2) * 100}ms` }}>
                <Card className={`overflow-hidden ${idx === 0 ? "ring-2 ring-[#FCD34D]" : ""}`}>
                  {idx === 0 && (
                    <div className="bg-gradient-to-r from-[#DC2626] to-[#FCD34D] px-4 py-1.5 flex items-center gap-2 text-sm font-semibold text-black">
                      <Trophy className="w-4 h-4" />
                      PALING COCOK
                    </div>
                  )}
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="border-[#FCD34D]/50 text-[#FCD34D]">
                            No. Urut {r.nomor_urut}
                          </Badge>
                        </div>
                        <h2 className="text-xl font-bold">{r.nama}</h2>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-[#FCD34D]">{r.skor_total.toFixed(0)}%</div>
                        <p className="text-xs text-gray-500">Kecocokan</p>
                      </div>
                    </div>

                    <Progress value={r.skor_total} />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[#FCD34D]">
                          <Lightbulb className="w-3 h-3" /> Visi
                        </div>
                        <p className="font-semibold">{r.skor_visi.toFixed(0)}%</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[#FCD34D]">
                          <ListChecks className="w-3 h-3" /> Misi
                        </div>
                        <p className="font-semibold">{r.skor_misi.toFixed(0)}%</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[#FCD34D]">
                          <GraduationCap className="w-3 h-3" /> Pendidikan
                        </div>
                        <p className="font-semibold">{r.skor_pendidikan.toFixed(0)}%</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[#FCD34D]">
                          <CalendarDays className="w-3 h-3" /> Usia
                        </div>
                        <p className="font-semibold">{r.skor_umur.toFixed(0)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 justify-center animate-fade-in-up">
            <Link href={`/desa/${id}/form`}>
              <Button variant="outline" className="btn-outline rounded-xl cursor-pointer gap-2">
                <RefreshCw className="w-4 h-4" /> Ulang
              </Button>
            </Link>
            <Link href={`/desa/${id}/compare`}>
              <Button variant="outline" className="btn-outline rounded-xl cursor-pointer gap-2">
                <GitCompareArrows className="w-4 h-4" /> Bandingkan
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
