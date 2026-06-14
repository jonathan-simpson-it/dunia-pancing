'use client'

import { type LucideIcon, FishingRod, RotateCw, Minimize, FishingHook, Fish, Package, Wrench } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  FishingRod,
  RotateCw,
  Minimize,
  FishingHook,
  Fish,
  Package,
  Wrench,
}

interface Props {
  icon: string
  className?: string
  size?: number
}

export default function CategoryIcon({ icon, className, size = 20 }: Props) {
  const Icon = iconMap[icon]
  if (!Icon) return <span className={className}>{icon || '📦'}</span>
  return <Icon className={className} size={size} />
}
