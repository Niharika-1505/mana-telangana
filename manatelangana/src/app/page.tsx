import Header from '@/components/shared/Header'
import TransparencyFooter from '@/components/shared/TransparencyFooter'
import StatsBar from '@/components/map/StatsBar'
import MapView from '@/components/map/MapView'
import RecentReports from '@/components/map/RecentReports'
import IssueBreakdown from '@/components/map/IssueBreakdown'
import OpenReportsBanner from '@/components/shared/OpenReportsBanner'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <Header />
      {/* Beta banner — remove once ward data is loaded and app is fully live */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-700">
        🚧 Beta — Ward data is still being added. Some features may be incomplete. &nbsp;
        <Link href="/join" className="underline font-semibold hover:text-amber-900 transition-colors">
          Want to help?
        </Link>
      </div>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <OpenReportsBanner />
        <StatsBar />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
          <div className="lg:col-span-2">
            <MapView />
          </div>
          <div>
            <RecentReports />
          </div>
        </div>
        <div className="mt-6">
          <IssueBreakdown />
        </div>
      </main>
      <TransparencyFooter />
    </>
  )
}
