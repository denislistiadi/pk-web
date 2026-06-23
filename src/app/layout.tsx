import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Paham Kades — Cek Kecocokan Calon Kepala Desa Pemalang",
  description:
    "Cari, bandingkan, dan cek kecocokan calon kepala desa se-Kabupaten Pemalang berdasarkan visi, misi, dan kriteria pilihan Anda.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}
