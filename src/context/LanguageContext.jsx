import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

const STORAGE_KEY = 'dunia-pancing-lang'

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'id'
    } catch {
      return 'id'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {}
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
