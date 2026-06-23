"use client"

export function Footer() {
  return (
    <footer className="footer-border relative z-10 mt-16">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center gap-2 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-[#DC2626] to-[#FCD34D] flex items-center justify-center text-black font-bold text-xs">
              PK
            </div>
            <span className="font-semibold text-gray-400">Paham Kades</span>
          </div>
          <p>Kabupaten Pemalang — Cari & Bandingkan Calon Kepala Desa</p>
        </div>
      </div>
    </footer>
  )
}
