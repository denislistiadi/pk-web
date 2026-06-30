import { NextResponse } from "next/server"

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export function success<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) }, { status: 200 })
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 })
}

export function error(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status }
  )
}

export function notFound(message = "Resource tidak ditemukan") {
  return error("NOT_FOUND", message, 404)
}

export function badRequest(message: string, details?: unknown) {
  return error("BAD_REQUEST", message, 400, details)
}

export function conflict(message: string) {
  return error("CONFLICT", message, 409)
}

export function internal(message = "Terjadi kesalahan server") {
  return error("INTERNAL_ERROR", message, 500)
}

export function validation(errors: Record<string, string>) {
  return error("VALIDATION_ERROR", "Data tidak valid", 422, errors)
}
