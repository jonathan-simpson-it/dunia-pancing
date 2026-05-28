'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface SearchContextValue {
  searchTerm: string
  setSearchTerm: (s: string) => void
}

const SearchContext = createContext<SearchContextValue>(null!)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('')
  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  return useContext(SearchContext)
}
