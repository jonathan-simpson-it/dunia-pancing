// ─── Product ───────────────────────────────────────────
export interface Product {
  id: string
  name_id: string
  name_en: string
  category: string
  brand: string
  specifications: string[]
  price_idr: number
  original_price_idr: number
  in_stock: boolean
  sold_count: number
  rating: number
  location: string
  image: string
  images: string[]
  weight: number
  stock_qty: number
  description_id: string
  description_en: string
  key_features: string[][]
}

export interface Category {
  key: string
  name_id: string
  name_en: string
  icon: string
}

// ─── Cart ──────────────────────────────────────────────
export interface CartItem {
  id: string
  name_id: string
  name_en: string
  image: string
  price_idr: number
  original_price_idr: number
  stock_qty: number
  category: string
  brand: string
  qty: number
}

// ─── Order ─────────────────────────────────────────────
export interface OrderItem {
  id: string
  name_id: string
  name_en: string
  image: string
  price_idr: number
  qty: number
}

export interface Customer {
  name: string
  phone: string
  address: string
  city: string
  notes?: string
}

export interface ShippingInfo {
  id: string
  label: string
  fee: number
}

export interface PaymentInfo {
  id: string
  label: string
  method: string
  type?: string
  bank: string
  accountNumber: string
}

export type OrderStatus =
  | 'waiting_payment'
  | 'paid'
  | 'to_ship'
  | 'shipping'
  | 'completed'
  | 'cancelled'

export interface StatusHistoryEntry {
  status: OrderStatus
  timestamp: string
  note?: string
}

export interface LogisticsInfo {
  courier: string
  courierLabel: string
  trackingNumber: string
  awbPrinted: boolean
  pickupType: 'dropoff' | 'pickup'
  pickupWindow?: string
  shippedAt?: string
  deliveredAt?: string
}

export interface Order {
  id: string
  date: string
  status: OrderStatus
  items: OrderItem[]
  customer: Customer
  shipping: ShippingInfo
  payment: PaymentInfo
  subtotal: number
  shipping_fee: number
  total: number
  logistics?: LogisticsInfo
  statusHistory: StatusHistoryEntry[]
  cancelNote?: string
}

export interface ShippingOption {
  id: string
  label_id: string
  label_en: string
  fee: number
  etd_id: string
  etd_en: string
}

export interface PaymentOption {
  id: string
  label_id: string
  label_en: string
  type: string
  bank: string
  accountNumber: string
}

// ─── Auth ──────────────────────────────────────────────
export type UserRole = 'admin' | 'client'

export interface User {
  username: string
  password: string
  role: UserRole
  name: string
  phone?: string
}

export interface Session {
  username: string
  role: UserRole
  name: string
}

// ─── Chat ──────────────────────────────────────────────
export type ChatSender = 'user' | 'admin'

export interface ChatMessage {
  id: string
  text: string
  sender: ChatSender
  timestamp: string
  read?: boolean
}

// ─── Navigation / Search ──────────────────────────────
export interface LayoutRenderProps {
  searchTerm: string
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
}

// ─── Locale ────────────────────────────────────────────
export type Locale = Record<string, string>

// ─── Forms ─────────────────────────────────────────────
export interface FormErrors {
  [key: string]: string
}

// ─── Blog ────────────────────────────────────────────────
export interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  author: string
  image: string
  category: string
}

// ─── Admin Import ──────────────────────────────────────
export interface PriceUpdate {
  id?: string
  name?: string
  price_idr?: number
}

export interface ImportResult {
  id: string
  name: string
  old: number
  new: number
}

// ─── localStorage helper ──────────────────────────────
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
