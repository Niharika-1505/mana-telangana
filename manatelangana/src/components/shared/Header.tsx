'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useEffect, useState } from 'react'
import { MapPin, Trophy, Camera, HelpCircle, Heart, ChevronDown } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

const navItems = [
  { href: '/',            key: 'nav_map'         as const, icon: MapPin },
  { href: '/leaderboard', key: 'nav_leaderboard' as const, icon: Trophy },
  { href: '/report',      key: 'nav_report'      as const, icon: Camera },
  { href: '/faq',         key: 'nav_faq'         as const, icon: HelpCircle },
  { href: '/join',        key: 'nav_join'        as const, icon: Heart },
]

const LANG_OPTIONS: { value: Lang; short: string; label: string }[] = [
  { value: 'te', short: 'తె', label: 'తెలుగు' },
  { value: 'en', short: 'EN', label: 'English' },
  { value: 'hi', short: 'हि', label: 'हिंदी'  },
]

export default function Header() {
  const path = usePathname()
  const isAdmin = path.startsWith('/manage-xt92k')
  const { lang, setLang, t } = useLang()
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLang = LANG_OPTIONS.find(o => o.value === lang)!

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/97 backdrop-blur-sm shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Logo — Telugu only, no subtitle */}
          <Link href="/" className="flex-shrink-0">
            <span className="te text-lg font-semibold text-green-700 hover:text-green-800 transition-colors">
              మన తెలంగాణ
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1 min-w-0">
            {!isAdmin && navItems.map(({ href, key, icon: Icon }) => {
              const active = path === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'text-slate-600 hover:text-green-700 hover:bg-green-50'
                    }`}
                >
                  <Icon size={14} />
                  <span className={`hidden sm:inline ${lang === 'te' ? 'te' : ''}`}>{t(key)}</span>
                </Link>
              )
            })}

            {/* Report button (mobile only) */}
            {!isAdmin && (
              <Link
                href="/report"
                className="sm:hidden ml-1 btn-primary text-xs px-2.5 py-1.5 flex items-center gap-1 flex-shrink-0"
              >
                <Camera size={12} />
                <span className="hidden xs:inline">{t('nav_report')}</span>
              </Link>
            )}

            {/* Language dropdown */}
            {!isAdmin && (
              <div ref={langRef} className="relative ml-1 flex-shrink-0">
                <button
                  onClick={() => setLangOpen(o => !o)}
                  className="flex items-center gap-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-green-300 hover:text-green-700 bg-white transition-colors"
                >
                  <span className={lang === 'te' ? 'te' : ''}>{currentLang.short}</span>
                  <ChevronDown
                    size={11}
                    className={`text-slate-400 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden min-w-[120px]">
                    {LANG_OPTIONS.map(o => (
                      <button
                        key={o.value}
                        onClick={() => { setLang(o.value); setLangOpen(false) }}
                        className={`w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center gap-2.5
                          ${lang === o.value
                            ? 'bg-green-50 text-green-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <span className={`w-4 text-center flex-shrink-0 ${o.value === 'te' ? 'te' : ''}`}>{o.short}</span>
                        <span className={o.value === 'te' ? 'te' : ''}>{o.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

          </nav>
        </div>
      </div>
    </header>
  )
}
