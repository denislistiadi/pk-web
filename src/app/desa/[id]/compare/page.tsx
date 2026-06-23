"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Lightbulb, ListChecks, GraduationCap, CalendarDays } from "lucide-react"
import { getDesaById, comparePaslon } from "@/lib/api"
import type { Desa, Paslon } from "@/lib/types"

export default function ComparePage() {
  const params = useParams()
  const id = Number(params.id)

  const [desa, setDesa] = useState<(Desa & { paslon: Paslon[] }) | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [compareData, setCompareData] = useState<Paslon[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDesaById(id).then((data) => {
      setDesa(data)
      setLoading(false)
    })
  }, [id])

  const toggleSelect = (paslonId: number) => {
    setSelected((prev) => {
      if (prev.includes(paslonId)) return prev.filter((p) => p !== paslonId)
      if (prev.length >= 3) return prev
      return [...prev, paslonId]
    })
    setCompareData(null)
  }

  const handleCompare = async () => {
    if (selected.length < 2) return
    const res = await comparePaslon(selected)
    setCompareData(res.paslon)
  }

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
        <div className="max-w-5xl mx-auto space-y-8">
          <Link
            href={`/desa/${id}`}
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#FCD34D] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke {desa.nama}
          </Link>

          <div className="space-y-2 animate-fade-in-up">
            <h1 className="text-3xl font-bold">Bandingkan Calon</h1>
            <p className="text-gray-400">Pilih 2-3 calon kepala desa untuk dibandingkan</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-in-up animation-delay-100">
            {desa.paslon.map((p) => (
              <button
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  selected.includes(p.id)
                    ? "border-[#FCD34D] bg-[#FCD34D]/10 ring-1 ring-[#FCD34D]"
                    : "border-border bg-card hover:border-[#FCD34D]/30"
                }`}
              >
                <Badge variant="outline" className="border-[#FCD34D]/50 text-[#FCD34D] mb-2">
                  No. Urut {p.nomor_urut}
                </Badge>
                <p className="font-semibold">{p.nama}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-center animate-fade-in-up">
            <Button
              className="btn-primary rounded-xl cursor-pointer gap-2 px-8"
              disabled={selected.length < 2}
              onClick={handleCompare}
            >
              {selected.length < 2 ? "Pilih minimal 2 calon" : `Bandingkan ${selected.length} Calon`}
            </Button>
          </div>

          {compareData && compareData.length >= 2 && (
            <div className="animate-fade-in-up overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-sm text-gray-400 border-b border-border w-32">Kriteria</th>
                    {compareData.map((p) => (
                      <th key={p.id} className="p-3 text-center border-b border-border min-w-[200px]">
                        <div className="space-y-1">
                          <Badge variant="outline" className="border-[#FCD34D]/50 text-[#FCD34D]">
                            No. Urut {p.nomor_urut}
                          </Badge>
                          <div className="font-bold text-lg">{p.nama}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 text-sm text-gray-400 border-b border-border">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#FCD34D]" /> Pendidikan
                      </div>
                    </td>
                    {compareData.map((p) => (
                      <td key={p.id} className="p-3 text-center border-b border-border font-medium">{p.pendidikan}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-sm text-gray-400 border-b border-border">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-[#FCD34D]" /> Usia
                      </div>
                    </td>
                    {compareData.map((p) => (
                      <td key={p.id} className="p-3 text-center border-b border-border font-medium">{p.umur} tahun</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-sm text-gray-400 border-b border-border align-top">
                      <div className="flex items-center gap-2 pt-1">
                        <Lightbulb className="w-4 h-4 text-[#FCD34D]" /> Visi
                      </div>
                    </td>
                    {compareData.map((p) => (
                      <td key={p.id} className="p-3 border-b border-border text-sm text-gray-300 leading-relaxed">{p.visi}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-sm text-gray-400 border-b border-border align-top">
                      <div className="flex items-center gap-2 pt-1">
                        <ListChecks className="w-4 h-4 text-[#FCD34D]" /> Misi
                      </div>
                    </td>
                    {compareData.map((p) => (
                      <td key={p.id} className="p-3 border-b border-border">
                        <ul className="space-y-1">
                          {p.misi.map((m, i) => (
                            <li key={i} className="text-sm text-gray-400 flex items-start gap-1">
                              <span className="text-[#FCD34D]">•</span> {m}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
