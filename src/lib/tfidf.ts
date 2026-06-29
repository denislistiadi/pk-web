export function computeTf(text: string): Record<string, number> {
  const tokens = text.toLowerCase().match(/\w+/g) || []
  if (!tokens.length) return {}
  const cnt: Record<string, number> = {}
  for (const t of tokens) cnt[t] = (cnt[t] || 0) + 1
  const n = tokens.length
  const res: Record<string, number> = {}
  for (const [k, v] of Object.entries(cnt)) res[k] = v / n
  return res
}

export function cosineSimilarity(
  a: Record<string, number>,
  b: Record<string, number>
): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  let dot = 0, na = 0, nb = 0
  for (const k of keys) {
    const av = a[k] || 0
    const bv = b[k] || 0
    dot += av * bv
    na += av * av
    nb += bv * bv
  }
  na = Math.sqrt(na)
  nb = Math.sqrt(nb)
  return na && nb ? dot / (na * nb) : 0
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  const uni = a.size + b.size - inter
  return uni ? inter / uni : 0
}

export const TINGKAT_PENDIDIKAN = [
  "SD", "SMP", "SMA/SMK", "D1/D3", "S1/D4", "S2", "S3",
]

export function skorPendidikan(pendidikan: string, minimal: string): number {
  const idx = TINGKAT_PENDIDIKAN.indexOf(pendidikan)
  const minIdx = TINGKAT_PENDIDIKAN.indexOf(minimal)
  if (idx < 0 || minIdx < 0) return 0
  if (idx >= minIdx) return 100
  return Math.max(0, 100 - (minIdx - idx) * 25)
}

export function skorUmur(umur: number, min: number, max: number): number {
  if (umur >= min && umur <= max) return 100
  if (umur < min) return Math.max(0, 100 - (min - umur) * 10)
  return Math.max(0, 100 - (umur - max) * 10)
}
