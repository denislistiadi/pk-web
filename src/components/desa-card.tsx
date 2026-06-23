"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Users, ChevronRight } from "lucide-react"
import type { Desa } from "@/lib/types"

export function DesaCard({ desa }: { desa: Desa }) {
  return (
    <Link href={`/desa/${desa.id}`}>
      <Card className="glass-card h-full cursor-pointer group">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-[#FCD34D]">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-medium">{desa.kecamatan}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#FCD34D] transition-colors" />
          </div>
          <h3 className="font-semibold text-lg">{desa.nama}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{desa.paslon_count ?? "—"} calon</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
