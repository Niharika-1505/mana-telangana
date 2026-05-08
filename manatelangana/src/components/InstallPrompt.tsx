'use client'
import { useState, useEffect } from 'react'
import { Smartphone, X } from 'lucide-react'

const DISMISS_KEY = 'pwa_prompt_dismissed_until'
const DISMISS_DAYS = 7

export default function InstallPrompt() {
  const [show, setShow]                     = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Don't show if already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // Don't show on desktop
    if (window.innerWidth >= 768) return
    // Don't show if user dismissed recently
    const until = localStorage.getItem(DISMISS_KEY)
    if (until && Date.now() < parseInt(until)) return

    // Retrieve prompt stored on window before this component mounted
    const stored = (window as any).__pwaInstallPrompt
    if (stored) {
      setDeferredPrompt(stored)
      setShow(true)
    }

    const onPrompt = (e: Event) => {
      e.preventDefault()
      ;(window as any).__pwaInstallPrompt = e
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', () => setShow(false))
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    ;(window as any).__pwaInstallPrompt = null
    setShow(false)
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000))
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 max-w-sm mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Smartphone size={20} className="text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900">
              Install మన తెలంగాణ
            </div>
            <div className="te text-xs text-slate-500 mt-0.5">
              హోమ్ స్క్రీన్‌కు జోడించుకోండి
            </div>
            <div className="text-xs text-slate-500 mt-0.5 leading-snug">
              Get faster access to report issues
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors p-0.5"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
