// Toggle between mock and real KiriminAja API
// Set NEXT_PUBLIC_USE_KIRIMINAJA_API=true in .env when a valid API key is configured
export const USE_KIRIMINAJA_API = process.env.NEXT_PUBLIC_USE_KIRIMINAJA_API === 'true'

// Toggle for Xendit payment gateway
// Set NEXT_PUBLIC_USE_XENDIT=true in .env when a valid API key is configured
export const USE_XENDIT = process.env.NEXT_PUBLIC_USE_XENDIT === 'true'

// Default store origin (Palembang) — kecamatan_id for KiriminAja
export const STORE_KECAMATAN_ID = 548 // Palembang Ilir Timur I
export const STORE_KABUPATEN_ID = 419 // Palembang city ID for KiriminAja
export const STORE_ADDRESS = 'Jl. Kebon Jahe, Ilir Timur I, Palembang'
export const STORE_PHONE = '081234567890'
export const STORE_NAME = 'Dunia Pancing Palembang'

// Package defaults
export const DEFAULT_PACKAGE_WIDTH = 10
export const DEFAULT_PACKAGE_LENGTH = 20
export const DEFAULT_PACKAGE_HEIGHT = 10
export const DEFAULT_PACKAGE_TYPE_ID = 7
