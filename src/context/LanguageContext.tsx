import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface LanguageContextValue {
  lang: 'id' | 'en'
  toggleLang: () => void
}

const LanguageContext = createContext<LanguageContextValue>(null!)

const STORAGE_KEY = 'dunia-pancing-lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<'id' | 'en'>('id')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'en') setLang('en')
    } catch { /* noop */ }
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(STORAGE_KEY, lang)
      } catch { /* noop */ }
    }
  }, [lang, ready])

  const toggleLang = () => setLang(l => l === 'id' ? 'en' : 'id')

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
