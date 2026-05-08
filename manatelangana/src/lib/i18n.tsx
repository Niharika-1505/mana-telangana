'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { T, TKey, Lang } from './translations'

export type { Lang }

type LangContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TKey) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'te',
  setLang: () => {},
  t: (key) => T[key].te,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('te')

  useEffect(() => {
    const saved = localStorage.getItem('lang')
    if (saved === 'en' || saved === 'te' || saved === 'hi') setLangState(saved)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  const t = (key: TKey) => T[key][lang]

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
