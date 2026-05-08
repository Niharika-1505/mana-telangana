'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, Trophy, Camera, LayoutDashboard } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

const navItems = [
  { href: '/',            key: 'nav_map'         as const, icon: MapPin },
  { href: '/leaderboard', key: 'nav_leaderboard' as const, icon: Trophy },
  { href: '/report',      key: 'nav_report'      as const, icon: Camera },
]

const LANG_LABELS: Record<Lang, string> = { en: 'EN', te: 'తె', hi: 'हि' }

export default function Header() {
  const path = usePathname()
  const isAdmin = path.startsWith('/admin')
  const { lang, setLang, t } = useLang()

  return (
    <header className="sticky top-0 z-50 border-b border-[#2d442d] bg-[#162016]/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none group">
            <span className="te text-lg font-semibold text-green-400 group-hover:text-green-300 transition-colors">
              మన తెలంగాణ
            </span>
            <span className="text-[10px] text-[#5a7a5a] tracking-[2px] uppercase mt-0.5">
              Mana Telangana · Nalgonda
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {!isAdmin && navItems.map(({ href, key, icon: Icon }) => {
              const active = path === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-green-400/10 text-green-400 border border-green-800'
                      : 'text-[#9ab89a] hover:text-green-400 hover:bg-green-400/5'
                    }`}
                >
                  <Icon size={14} />
                  <span className={`hidden sm:inline ${lang === 'te' ? 'te' : ''}`}>{t(key)}</span>
                </Link>
              )
            })}

            {/* Report button (mobile) */}
            {!isAdmin && (
              <Link
                href="/report"
                className="sm:hidden ml-2 btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <Camera size={12} />
                {t('nav_report')}
              </Link>
            )}

            {/* Language switcher (user-facing pages only) */}
            {!isAdmin && (
              <div className="flex items-center border border-[#2d442d] rounded-lg overflow-hidden ml-2">
                {(['te', 'en', 'hi'] as Lang[]).map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2 py-1 text-xs font-medium transition-colors ${
                      lang === l
                        ? 'bg-green-400/10 text-green-400'
                        : 'text-[#5a7a5a] hover:text-[#9ab89a]'
                    }`}
                  >
                    {LANG_LABELS[l]}
                  </button>
                ))}
              </div>
            )}

            {/* Admin link */}
            <Link
              href="/admin"
              className={`ml-2 p-1.5 rounded-lg transition-colors
                ${isAdmin ? 'text-green-400' : 'text-[#5a7a5a] hover:text-[#9ab89a]'}`}
              title="Admin Dashboard"
            >
              <LayoutDashboard size={16} />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
