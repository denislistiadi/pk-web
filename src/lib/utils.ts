import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TINGKAT_PENDIDIKAN = [
  "SD", "SMP", "SMA/SMK", "D1/D3", "S1/D4", "S2", "S3",
] as const

export function skorPendidikan(pendidikan: string, minimal: string): number {
  const list = TINGKAT_PENDIDIKAN as readonly string[]
  const idx = list.indexOf(pendidikan)
  const minIdx = list.indexOf(minimal)
  if (idx < 0 || minIdx < 0) return 0
  if (idx >= minIdx) return 100
  return Math.max(0, 100 - (minIdx - idx) * 25)
}

export function skorUmur(umur: number, min: number, max: number): number {
  if (umur >= min && umur <= max) return 100
  if (umur < min) return Math.max(0, 100 - (min - umur) * 10)
  return Math.max(0, 100 - (umur - max) * 10)
}
