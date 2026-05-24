import { useState, useRef } from 'react'
import { useLang } from '../../context/LanguageContext'

const MAX_WIDTH = 800
const MAX_HEIGHT = 800
const QUALITY = 0.8

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Canvas to Blob failed'))
          const fr = new FileReader()
          fr.onload = () => resolve(fr.result)
          fr.readAsDataURL(blob)
        }, 'image/jpeg', QUALITY)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ImageUploader({ value = [], onChange, label, previewClass, maxFiles = 10 }) {
  const { lang } = useLang()
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const images = Array.isArray(value) ? value : (value ? [value] : [])

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remaining = maxFiles - images.length
    if (remaining <= 0) {
      alert(lang === 'id' ? `Maksimal ${maxFiles} gambar` : `Maximum ${maxFiles} images`)
      return
    }

    const toProcess = files.slice(0, remaining)
    for (const file of toProcess) {
      if (!file.type.startsWith('image/')) {
        alert(lang === 'id' ? 'File harus berupa gambar' : 'File must be an image')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(lang === 'id' ? 'Ukuran maksimal 5MB' : 'Maximum size is 5MB')
        return
      }
    }

    setUploading(true)
    try {
      const results = await Promise.all(toProcess.map(compressImage))
      onChange([...images, ...results])
    } catch {
      alert(lang === 'id' ? 'Gagal memproses gambar' : 'Failed to process images')
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const moveImage = (from, to) => {
    if (to < 0 || to >= images.length) return
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div>
      {label && (
        <label className="block text-[12px] font-semibold text-slate-700 mb-1">{label}</label>
      )}

      {/* Gallery */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <img
                src={url}
                alt={`Image ${i + 1}`}
                className={`rounded-lg border border-slate-200 object-cover bg-slate-50 ${previewClass || 'w-20 h-20'}`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                {i > 0 && (
                  <button type="button" onClick={() => moveImage(i, i - 1)}
                    className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-[11px] font-bold hover:bg-white">
                    ◀
                  </button>
                )}
                {i < images.length - 1 && (
                  <button type="button" onClick={() => moveImage(i, i + 1)}
                    className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-[11px] font-bold hover:bg-white">
                    ▶
                  </button>
                )}
                <button type="button" onClick={() => removeImage(i)}
                  className="w-6 h-6 bg-red-500/90 rounded-full flex items-center justify-center text-white text-[11px] font-bold hover:bg-red-500">
                  ✕
                </button>
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-800 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || images.length >= maxFiles}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {uploading
            ? (lang === 'id' ? 'Memproses...' : 'Processing...')
            : (lang === 'id' ? 'Pilih Gambar' : 'Choose Images')}
        </button>
        <span className="text-[10px] text-slate-400">
          {images.length}/{maxFiles} {lang === 'id' ? 'gambar' : 'images'}
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mt-1">
        {lang === 'id' ? 'Format: JPG/PNG, maks. 5MB per gambar. Klik thumbnail untuk atur urutan.' : 'Format: JPG/PNG, max 5MB each. Click thumbnail to reorder.'}
      </p>
    </div>
  )
}
