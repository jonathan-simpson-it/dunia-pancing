import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface LanguageContextValue {
  lang: 'id' | 'en'
  toggleLang: () => void
}

const LanguageContext = createContext<LanguageContextValue>(null!)

const STORAGE_KEY = 'dunia-pancing-lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<'id' | 'en'>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored === 'en' ? 'en' : 'id'
    } catch {
      return 'id'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch { /* noop */ }
  }, [lang])

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
