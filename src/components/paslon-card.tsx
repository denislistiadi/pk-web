"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, CalendarDays, Lightbulb, ListChecks } from "lucide-react"
import type { Paslon } from "@/lib/types"

interface PaslonCardProps {
  paslon: Paslon
  showActions?: boolean
}

export function PaslonCard({ paslon }: PaslonCardProps) {
  return (
    <Card className="glass-card overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#DC2626] to-[#FCD34D]" />
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="border-[#FCD34D]/50 text-[#FCD34D]">
                No. Urut {paslon.nomor_urut}
              </Badge>
            </div>
            <h3 className="text-xl font-bold">{paslon.nama}</h3>
          </div>
          {paslon.foto_url && (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#DC2626]/30 to-[#FCD34D]/20 flex items-center justify-center text-2xl font-bold shrink-0">
              {paslon.nama[0]}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <GraduationCap className="w-4 h-4" />
            <span>{paslon.pendidikan}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4" />
            <span>{paslon.umur} tahun</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-[#FCD34D]">
            <Lightbulb className="w-4 h-4" />
            <span className="font-medium">Visi</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{paslon.visi}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-[#FCD34D]">
            <ListChecks className="w-4 h-4" />
            <span className="font-medium">Misi</span>
          </div>
          <ul className="space-y-1">
            {paslon.misi.map((m, i) => (
              <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                <span className="text-[#FCD34D] mt-1">•</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
