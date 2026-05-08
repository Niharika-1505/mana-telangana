'use client'
import { useState, useEffect } from 'react'
import { Smartphone, CheckCircle2 } from 'lucide-react'

type Platform = 'android' | 'ios' | 'desktop'

function getPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'desktop'
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  )
}

export default function InstallBanner() {
  const [platform, setPlatform]         = useState<Platform>('desktop')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installed, setInstalled]       = useState(false)
  const [installOutcome, setInstallOutcome] = useState<'accepted' | null>(null)

  useEffect(() => {
    setPlatform(getPlatform())
    setInstalled(isStandalone())

    // Retrieve prompt stored before this component mounted
    const stored = (window as any).__pwaInstallPrompt
    if (stored) setDeferredPrompt(stored)

    const onPrompt = (e: Event) => {
      e.preventDefault()
      ;(window as any).__pwaInstallPrompt = e
      setDeferredPrompt(e)
    }
    const onInstalled = () => { setInstalled(true); setDeferredPrompt(null) }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function triggerInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallOutcome('accepted')
      setInstalled(true)
    }
    setDeferredPrompt(null)
    ;(window as any).__pwaInstallPrompt = null
  }

  const baseCard = 'rounded-xl border px-4 py-3.5 mb-4'

  // Already running as installed PWA
  if (installed || installOutcome === 'accepted') {
    return (
      <div className={`${baseCard} bg-green-50 border-green-200 flex items-center gap-2.5`}>
        <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
        <div>
          <div className="text-sm font-medium text-green-800">You're using the installed app!</div>
          <div className="te text-xs text-green-700 mt-0.5">మీరు ఇన్‌స్టాల్ చేసిన యాప్ వాడుతున్నారు!</div>
        </div>
      </div>
    )
  }

  // Android Chrome — native install prompt available
  if (platform === 'android' && deferredPrompt) {
    return (
      <div className={`${baseCard} bg-gradient-to-r from-green-50 to-emerald-50 border-green-200`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">📱</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-green-900">Save to your home screen</div>
            <div className="te text-xs text-green-700 mt-0.5">హోమ్ స్క్రీన్‌కు జోడించుకోండి</div>
          </div>
          <button
            onClick={triggerInstall}
            className="flex-shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Smartphone size={14} /> Add to Home Screen
          </button>
        </div>
      </div>
    )
  }

  // iOS Safari — no beforeinstallprompt, show Share menu instructions
  if (platform === 'ios') {
    return (
      <div className={`${baseCard} bg-gradient-to-r from-green-50 to-emerald-50 border-green-200`}>
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl flex-shrink-0">📱</span>
          <div>
            <div className="text-sm font-semibold text-green-900">Save to your home screen</div>
            <div className="te text-xs text-green-700 mt-0.5">హోమ్ స్క్రీన్‌కు జోడించుకోండి</div>
          </div>
        </div>
        <div className="text-xs text-green-800 bg-white/70 rounded-lg px-3 py-2.5 leading-relaxed">
          Tap the{' '}
          <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-900 font-semibold px-1.5 py-0.5 rounded text-[11px]">
            Share □↑
          </span>
          {' '}button at the bottom of Safari, then tap{' '}
          <strong>"Add to Home Screen"</strong>, then <strong>"Add"</strong>.
          <div className="te mt-1.5 text-green-700">
            Safari లో Share (□↑) నొక్కి, "హోమ్ స్క్రీన్‌కు జోడించు" ఎంచుకోండి.
          </div>
        </div>
      </div>
    )
  }

  // Android Chrome — but beforeinstallprompt hasn't fired yet (no service worker / not eligible)
  if (platform === 'android') {
    return (
      <div className={`${baseCard} bg-slate-50 border-slate-200`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">📱</span>
          <div>
            <div className="text-sm font-medium text-slate-700">Save to your home screen</div>
            <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Tap the{' '}
              <span className="font-semibold">⋮</span>
              {' '}menu in Chrome, then tap <strong>"Add to Home screen"</strong>.
            </div>
            <div className="te text-xs text-slate-400 mt-1">
              Chrome లో ⋮ మెనూ నొక్కి "హోమ్ స్క్రీన్‌కు జోడించు" ఎంచుకోండి.
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Desktop — point to mobile
  return (
    <div className={`${baseCard} bg-slate-50 border-slate-200`}>
      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
        <Smartphone size={16} className="flex-shrink-0" />
        <span>Open <strong>manatelangana.org.in</strong> on your phone to save it as an app.</span>
      </div>
    </div>
  )
}
