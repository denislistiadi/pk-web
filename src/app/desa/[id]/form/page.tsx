"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Sparkles, AlertCircle } from "lucide-react"
import { getDesaById, cocokkan } from "@/lib/api"
import { TINGKAT_PENDIDIKAN } from "@/lib/utils"
import type { Desa, Paslon, CocokkanRequest } from "@/lib/types"

export default function FormPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const [desa, setDesa] = useState<(Desa & { paslon: Paslon[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [visiUser, setVisiUser] = useState("")
  const [misiUser, setMisiUser] = useState<number[]>([])
  const [pendidikanMin, setPendidikanMin] = useState("SD")
  const [umurMin, setUmurMin] = useState(25)
  const [umurMax, setUmurMax] = useState(60)

  useEffect(() => {
    getDesaById(id).then((data) => {
      setDesa(data)
      setLoading(false)
    })
  }, [id])

  const allMisi = desa
    ? [...new Set(desa.paslon.flatMap((p) => p.misi))]
    : []

  const toggleMisi = (idx: number) => {
    setMisiUser((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    )
  }

  const handleSubmit = async () => {
    setError("")
    if (!visiUser.trim()) {
      setError("Mohon isi visi ideal Anda")
      return
    }

    setSubmitting(true)
    try {
      const req: CocokkanRequest = {
        desa_id: id,
        visi_user: visiUser,
        misi_user: misiUser,
        pendidikan_min: pendidikanMin,
        umur_min: umurMin,
        umur_max: umurMax,
      }
      const result = await cocokkan(req)
      sessionStorage.setItem("cocokkan_result", JSON.stringify(result))
      router.push(`/desa/${id}/hasil`)
    } catch {
      setError("Gagal memproses. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
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
        <div className="max-w-2xl mx-auto space-y-8">
          <Link
            href={`/desa/${id}`}
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#FCD34D] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke {desa.nama}
          </Link>

          <div className="space-y-2 animate-fade-in-up">
            <h1 className="text-3xl font-bold">Form Preferensi</h1>
            <p className="text-gray-400">
              Isi preferensi Anda untuk mencocokkan dengan calon kepala desa <span className="text-[#FCD34D]">{desa.nama}</span>
            </p>
          </div>

          {error && (
            <Card className="border-red-500/50 bg-red-500/10">
              <CardContent className="p-4 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </CardContent>
            </Card>
          )}

          <div className="space-y-6 animate-fade-in-up animation-delay-100">
            <div className="space-y-2">
              <Label htmlFor="visi">Visi Ideal Anda</Label>
              <p className="text-xs text-gray-500">Tuliskan visi ideal yang Anda harapkan dari calon kepala desa</p>
              <Textarea
                id="visi"
                placeholder="Contoh: Mewujudkan desa yang maju, mandiri, dan sejahtera melalui pembangunan infrastruktur dan pemberdayaan masyarakat..."
                value={visiUser}
                onChange={(e) => setVisiUser(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Misi yang Penting Menurut Anda</Label>
              <p className="text-xs text-gray-500">Pilih misi-misi yang Anda anggap penting dari semua calon</p>
              {allMisi.length === 0 ? (
                <p className="text-sm text-gray-500">Tidak ada misi tersedia</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
                  {allMisi.map((m, i) => (
                    <label
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        misiUser.includes(i)
                          ? "border-[#FCD34D] bg-[#FCD34D]/10"
                          : "border-border hover:border-[#FCD34D]/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={misiUser.includes(i)}
                        onChange={() => toggleMisi(i)}
                        className="mt-0.5 accent-[#DC2626]"
                      />
                      <span className="text-sm text-gray-300">{m}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pendidikan">Pendidikan Minimal</Label>
              <Select
                id="pendidikan"
                options={TINGKAT_PENDIDIKAN.map((p) => ({ value: p, label: p }))}
                value={pendidikanMin}
                onChange={(e) => setPendidikanMin(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="umurMin">Usia Minimal</Label>
                <input
                  id="umurMin"
                  type="number"
                  min={20}
                  max={70}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={umurMin}
                  onChange={(e) => setUmurMin(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="umurMax">Usia Maksimal</Label>
                <input
                  id="umurMax"
                  type="number"
                  min={20}
                  max={70}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={umurMax}
                  onChange={(e) => setUmurMax(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Button
            className="btn-primary w-full rounded-xl py-6 text-lg cursor-pointer gap-2"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Cek Kecocokan
              </>
            )}
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
