import Link from 'next/link'

const PLATFORM_LINKS = [
  { href: '/',           label: 'Map' },
  { href: '/report',     label: 'Report Issue' },
  { href: '/leaderboard',label: 'Leaderboard' },
  { href: '/coverage',   label: 'Ward Coverage' },
]

const COMMUNITY_LINKS = [
  { href: '/join',                 label: 'Join Us' },
  { href: '/faq',                  label: 'FAQ' },
  { href: '/coverage#contribute',  label: 'Contribute Ward Data' },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 mt-12" style={{ background: '#f8f9fa' }}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <span className="te text-lg font-semibold text-green-700 block mb-2">
              మన తెలంగాణ
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              A civic accountability platform for Telangana citizens.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Platform
            </p>
            <ul className="space-y-2">
              {PLATFORM_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-500 hover:text-green-700 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community links */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Community
            </p>
            <ul className="space-y-2">
              {COMMUNITY_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-500 hover:text-green-700 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200 mt-8 pt-6 text-center space-y-1">
          <p className="text-xs text-slate-400">Built with ❤️ for Telangana citizens</p>
          <p className="text-xs text-slate-400">Data sourced from Election Commission of India</p>
          <p className="text-xs text-slate-400">© 2026 Mana Telangana. Open for public good.</p>
        </div>
      </div>
    </footer>
  )
}
