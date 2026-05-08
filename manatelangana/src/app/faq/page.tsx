'use client'
import { useState } from 'react'
import Header from '@/components/shared/Header'
import TransparencyFooter from '@/components/shared/TransparencyFooter'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import Link from 'next/link'
import InstallBanner from '@/components/InstallBanner'

type FAQItem = { q: string; a: string | React.ReactNode }
type FAQSection = { title: string; items: FAQItem[] }

const INSTALL_SECTION_TITLE = '📱 Save to Your Phone'

const FAQ_DATA: FAQSection[] = [
  {
    title: 'About the Platform',
    items: [
      {
        q: 'What is Mana Telangana?',
        a: 'A free, anonymous civic issue reporting platform for Telangana. Citizens submit geo-tagged complaints with photos. MLAs are ranked publicly by how quickly their constituency resolves reported issues.',
      },
      {
        q: 'Who runs this platform?',
        a: 'Mana Telangana is an independent, non-profit civic initiative. We have no affiliation with any political party or government body. The platform is open source.',
      },
      {
        q: 'Is it free to use?',
        a: 'Yes — completely free for everyone. No ads, no user tracking, no login required.',
      },
    ],
  },
  {
    title: 'Reporting Issues',
    items: [
      {
        q: 'What types of issues can I report?',
        a: 'Potholes, garbage dumps, drainage overflow, broken street lights, water supply problems, open drains, illegal encroachments, fallen trees, stray animal menace, and more. If it affects daily life in your ward, report it.',
      },
      {
        q: 'Do I need an account or login?',
        a: 'No. Reports are submitted anonymously. We use a browser fingerprint — a random ID stored on your device — to let you track your own reports. No name, email, or phone is collected when you report an issue.',
      },
      {
        q: 'Why is a photo required?',
        a: 'Photos are the primary evidence that an issue exists and has not yet been fixed. They also help community members independently verify whether a fix has actually happened. Without a photo, claims are unverifiable.',
      },
      {
        q: 'How does location detection work?',
        a: 'We use your device GPS (with your permission) to detect the nearest ward automatically. You can also select your ward manually from the dropdown if GPS is unavailable or inaccurate.',
      },
      {
        q: 'What is the "This is a test submission" checkbox?',
        a: 'If you are testing the app or exploring the form, tick this box. Test reports are hidden from the public map and can be bulk-deleted by the admin at any time.',
      },
    ],
  },
  {
    title: 'After You Report',
    items: [
      {
        q: 'What happens after I submit a report?',
        a: 'Your report is immediately visible on the public map. The admin reviews it and marks it "In Progress" once acknowledged. The issue remains live until marked resolved or inactive.',
      },
      {
        q: 'How do I track my report?',
        a: 'Visit this site on the same browser and device you used to submit. A banner at the top of the homepage will show all your open reports and let you mark them as fixed once resolved.',
      },
      {
        q: 'Why can you not email or text me updates?',
        a: 'We collect no contact information. This is a deliberate privacy decision — you are fully anonymous. The trade-off is that updates are pull-based: you visit the site to check status rather than receiving a push notification.',
      },
      {
        q: 'What if I clear my browser data?',
        a: 'Your report still exists on the map and in the database — it has not been deleted. But we can no longer connect it to you, so the homepage banner will not show it anymore. The report remains public and is still tracked.',
      },
      {
        q: 'What if I switch to a different browser or device?',
        a: 'The browser fingerprint is specific to one browser on one device. Switching browsers or devices creates a new identity — the banner will not show reports from your other browser. The reports are still live on the map.',
      },
    ],
  },
  {
    title: 'Community Verification',
    items: [
      {
        q: 'What is community verification?',
        a: 'Anyone can tap a report pin on the map and submit a photo saying "Yes, this is fixed" or "No, still broken." This creates a crowd-sourced evidence trail visible to everyone — including the admin.',
      },
      {
        q: 'Can I verify someone else\'s report?',
        a: 'Yes, and this is actively encouraged. If you pass by a reported issue, take a photo and submit a verification. Even a "still broken" verdict is valuable — it proves the issue has not been addressed.',
      },
      {
        q: 'Who finally marks an issue as resolved?',
        a: 'The admin marks it resolved — typically after community verifications show the fix has happened, or after the MLA or municipal office provides evidence. The reporter\'s "It\'s fixed" flag and community verification photos are shown to the admin as evidence, but the final call is always the admin\'s.',
      },
    ],
  },
  {
    title: 'The MLA Leaderboard',
    items: [
      {
        q: 'How is the MLA score calculated?',
        a: 'Score = percentage of reports filed in that MLA\'s constituency that were marked resolved within 7 days. Higher score means faster response. The leaderboard updates in real time as reports are filed and resolved.',
      },
      {
        q: 'Can MLAs or officials game the score?',
        a: 'The admin — not the MLA — marks issues as resolved. Community verification photos provide independent evidence of whether a fix actually happened. If an issue is marked resolved but community members keep submitting "still broken" verifications, that contradiction is visible to everyone.',
      },
    ],
  },
  {
    title: "Do's and Don'ts",
    items: [
      {
        q: 'What should I do after reporting?',
        a: (
          <ul className="list-none space-y-1.5">
            {[
              'Return to the site periodically to check your report status',
              "Verify other people's reports if you pass by the location",
              'Spread the word — more reports = more accountability pressure',
              'Submit a community verification photo when you see a fix',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ),
      },
      {
        q: 'What should I avoid?',
        a: (
          <ul className="list-none space-y-1.5">
            {[
              'Do not file false or duplicate reports — they dilute genuine issues',
              'Do not clear browser data if you want to track your report',
              'Do not switch browsers expecting to see your old reports',
              'Do not submit test reports without ticking the "This is a test" checkbox',
              'Do not report issues outside Telangana — ward data may not be available for all areas yet',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-400 font-bold mt-0.5">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ),
      },
    ],
  },
  {
    title: INSTALL_SECTION_TITLE,
    items: [
      {
        q: 'Can I save this as an app on my phone?',
        a: (
          <div className="space-y-4">
            <p>
              Yes! You can add మన తెలంగాణ to your phone&apos;s home screen and use it just like
              a regular app — no app store needed.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  🤖 Android (Chrome)
                </div>
                <ol className="list-none space-y-1.5 text-sm text-slate-600">
                  {[
                    <>Open <strong>manatelangana.org.in</strong> in Chrome</>,
                    <>Tap the three-dots menu <strong>⋮</strong> at the top right</>,
                    <>Tap <strong>"Add to Home screen"</strong></>,
                    <>Tap <strong>"Add"</strong> to confirm</>,
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="flex-shrink-0 w-4 h-4 bg-green-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  🍎 iPhone (Safari)
                </div>
                <ol className="list-none space-y-1.5 text-sm text-slate-600">
                  {[
                    <>Open <strong>manatelangana.org.in</strong> in Safari</>,
                    <>Tap the Share button <strong>□↑</strong> at the bottom</>,
                    <>Scroll down and tap <strong>"Add to Home Screen"</strong></>,
                    <>Tap <strong>"Add"</strong> to confirm</>,
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="flex-shrink-0 w-4 h-4 bg-slate-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <p className="te text-xs text-slate-400 leading-relaxed">
              అవును! మన తెలంగాణను మీ ఫోన్ హోమ్ స్క్రీన్‌కు జోడించవచ్చు — యాప్ స్టోర్ అవసరం లేదు.
              Android లో Chrome మెనూ (⋮) నొక్కి "హోమ్ స్క్రీన్‌కు జోడించు" ఎంచుకోండి.
              iPhone లో Safari Share బటన్ (□↑) నొక్కి "హోమ్ స్క్రీన్‌కు జోడించు" ఎంచుకోండి.
            </p>
          </div>
        ),
      },
      {
        q: 'Does it work without internet?',
        a: (
          <div>
            <p>
              Basic pages load even without internet once you have visited them before. However
              submitting new reports requires an internet connection.
            </p>
            <p className="te text-xs text-slate-400 mt-2 leading-relaxed">
              మీరు ముందే చూసిన పేజీలు ఇంటర్నెట్ లేకుండా తెరుచుకుంటాయి. కానీ కొత్త సమస్యలు
              నివేదించడానికి ఇంటర్నెట్ అవసరం.
            </p>
          </div>
        ),
      },
      {
        q: 'Is it free to install?',
        a: (
          <div>
            <p>
              Completely free! No app store, no account, no charges. Just save it to your home
              screen and use it.
            </p>
            <p className="te text-xs text-slate-400 mt-2 leading-relaxed">
              పూర్తిగా ఉచితం! యాప్ స్టోర్ అవసరం లేదు, ఖాతా అవసరం లేదు, ఎలాంటి చార్జీలు లేవు.
              హోమ్ స్క్రీన్‌కు సేవ్ చేసి వాడండి.
            </p>
          </div>
        ),
      },
      {
        q: 'Why should I save it to my home screen?',
        a: (
          <div>
            <p>
              It loads faster, works like a native app, and makes it easier to quickly report an
              issue when you spot one on the street.
            </p>
            <p className="te text-xs text-slate-400 mt-2 leading-relaxed">
              వేగంగా తెరుచుకుంటుంది, నేటివ్ యాప్‌లా పని చేస్తుంది, వీధిలో సమస్య కనిపించినప్పుడు
              వెంటనే నివేదించడం సులభమవుతుంది.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    title: 'Getting Involved',
    items: [
      {
        q: 'How can I contribute to the platform?',
        a: (
          <span>
            Visit our{' '}
            <Link href="/join" className="text-green-600 underline font-medium hover:text-green-700">
              Join Us
            </Link>{' '}
            page to express interest as a ward data contributor, local activist, developer,
            designer, or researcher. We will reach out when we need your help — no commitment
            required now.
          </span>
        ),
      },
      {
        q: 'What is a Ward Data Contributor?',
        a: 'Someone who helps us collect or verify ward-level data for Telangana — ward boundaries, GPS coordinates, mandal names, MLA and MP information. This is the most urgent need right now as we build out the platform.',
      },
      {
        q: 'Is the platform open source?',
        a: 'Yes. The code is publicly available on GitHub. Developers are welcome to contribute.',
      },
    ],
  },
]

function AccordionItem({ q, a }: FAQItem) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
      >
        <span className="text-sm font-medium text-slate-800 group-hover:text-green-700 transition-colors">
          {q}
        </span>
        {open
          ? <ChevronUp size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
          : <ChevronDown size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
        }
      </button>
      {open && (
        <div className="pb-4 text-sm text-slate-600 leading-relaxed -mt-1">
          {a}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const { lang, t } = useLang()

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {t('nav_faq')} — Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-400">
            Everything you need to know about reporting, tracking, and verifying civic issues.
          </p>
        </div>

        <div className="space-y-5">
          {FAQ_DATA.map(section => (
            <div key={section.title} className="card overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  {section.title}
                </h2>
              </div>
              {section.title === INSTALL_SECTION_TITLE && (
                <div className="px-5 pt-4">
                  <InstallBanner />
                </div>
              )}
              <div className="px-5">
                {section.items.map(item => (
                  <AccordionItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 card p-5 text-center bg-green-50 border-green-200">
          <p className="text-sm text-green-800 mb-3">
            Still have a question? Want to get involved?
          </p>
          <Link
            href="/join"
            className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2"
          >
            💚 {t('nav_join')}
          </Link>
        </div>
      </main>
      <TransparencyFooter />
    </>
  )
}
