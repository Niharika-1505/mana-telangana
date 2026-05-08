import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from '@/lib/i18n'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'మన తెలంగాణ · Mana Telangana',
  description: 'Citizen-powered civic accountability for Telangana. Report issues, track MLAs, make our state better.',
  keywords: 'Telangana, civic, accountability, Nalgonda, MLA, report, garbage, pothole',
  openGraph: {
    title: 'మన తెలంగాణ · Mana Telangana',
    description: 'Our Telangana, Our Voice. Report civic issues anonymously.',
    url: 'https://manatelangana.org.in',
    siteName: 'Mana Telangana',
    locale: 'te_IN',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="te">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1a4a2a" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-slate-50 text-slate-900 font-sans antialiased">
        <LanguageProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
              success: { iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' } },
            }}
          />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
