"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, GitCompareArrows, PieChart, ScrollText, ChevronRight } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

const features = [
  {
    icon: Search,
    title: "Cari Calon Kades",
    desc: "Temukan profil calon kepala desa di desa Anda lengkap dengan visi, misi, pendidikan, dan usia.",
  },
  {
    icon: PieChart,
    title: "Cek Kecocokan",
    desc: "Isi form preferensi, sistem akan menghitung siapa calon yang paling cocok dengan harapan Anda.",
  },
  {
    icon: GitCompareArrows,
    title: "Bandingkan",
    desc: "Lihat perbandingan antar calon secara side-by-side untuk membantu keputusan Anda.",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="gradient-orb gradient-orb-primary w-[600px] h-[600px] -top-[200px] -left-[150px] animate-pulse-glow" />
      <div className="gradient-orb gradient-orb-secondary w-[500px] h-[500px] top-[30%] -right-[100px] animate-pulse-glow animation-delay-200" />
      <div className="gradient-orb gradient-orb-primary w-[350px] h-[350px] bottom-[15%] left-[25%] animate-pulse-glow animation-delay-400" />
      <div className="pulse-ring w-[300px] h-[300px] top-[20%] left-[10%]" />
      <div className="pulse-ring w-[200px] h-[200px] top-[50%] right-[15%] animation-delay-100" />

      <Header />

      <main className="container mx-auto px-6 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FCD34D]/30 bg-[#FCD34D]/5 text-[#FCD34D] text-sm">
              <ScrollText className="w-4 h-4" />
              Pilkades Pemalang 2026
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#DC2626] via-[#FCD34D] to-white">
                Paham Kades
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Cari, bandingkan, dan cek kecocokan calon kepala desa
              <br />
              se-<span className="text-[#FCD34D] font-semibold">Kabupaten Pemalang</span>
              {" "}berdasarkan visi, misi, dan kriteria pilihan Anda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-100">
            <Link href="/desa">
              <Button size="lg" className="btn-primary px-8 py-6 text-lg rounded-xl cursor-pointer">
                <Search className="w-5 h-5 mr-2" />
                Cari Desa Saya
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {features.map((f, i) => (
              <div key={i} className={`feature-card p-6 text-center animate-fade-in-up animation-delay-${(i + 1) * 100}`}>
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#DC2626]/30 to-[#FCD34D]/20 flex items-center justify-center">
                  <f.icon className="w-6 h-6 text-[#FCD34D]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <Card className="glass-card animate-fade-in-up animation-delay-400">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-2xl font-bold">Bagaimana Cara Kerjanya?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                {[
                  { step: "1", title: "Pilih Desa", desc: "Cari desa Anda di Kabupaten Pemalang" },
                  { step: "2", title: "Isi Preferensi", desc: "Tulis visi ideal & pilih kriteria" },
                  { step: "3", title: "Lihat Hasil", desc: "Dapatkan ranking calon terbaik" },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DC2626] to-[#FCD34D] flex items-center justify-center text-black font-bold">
                      {s.step}
                    </div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="text-sm text-gray-400">{s.desc}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <Link href="/desa">
                  <Button className="btn-primary rounded-xl cursor-pointer gap-1">
                    Mulai Sekarang <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
