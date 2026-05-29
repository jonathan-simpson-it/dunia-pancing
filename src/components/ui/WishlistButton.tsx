'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductStore'
import { useLang } from '../../context/LanguageContext'

interface WishlistButtonProps {
  productId: string
  count: number
}

export default function WishlistButton({ productId, count }: WishlistButtonProps) {
  const { lang } = useLang()
  const { user } = useAuth()
  const { getWishlist, toggleWishlist } = useProducts()
  const [isFav, setIsFav] = useState(false)
  const [favCount, setFavCount] = useState(count)

  useEffect(() => {
    if (user) {
      const list = getWishlist(user.username)
      setIsFav(list.includes(productId))
    }
  }, [user, productId, getWishlist])

  const handleToggle = () => {
    if (!user) return
    const added = toggleWishlist(user.username, productId)
    setIsFav(added)
    setFavCount(prev => added ? prev + 1 : Math.max(0, prev - 1))
  }

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-red-500 transition-colors group"
    >
      <svg
        className={`w-5 h-5 transition-all ${isFav ? 'text-red-500 fill-red-500' : 'text-slate-400 group-hover:text-red-400'}`}
        viewBox="0 0 24 24"
        fill={isFav ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
      {favCount > 0 && (
        <span className="text-slate-400">
          {(favCount >= 1000 ? (favCount / 1000).toFixed(1) + 'RB' : favCount)}
        </span>
      )}
    </button>
  )
}
