import Header from '@/components/shared/Header'
import TransparencyFooter from '@/components/shared/TransparencyFooter'
import StatsBar from '@/components/map/StatsBar'
import MapView from '@/components/map/MapView'
import RecentReports from '@/components/map/RecentReports'
import IssueBreakdown from '@/components/map/IssueBreakdown'
import OpenReportsBanner from '@/components/shared/OpenReportsBanner'

export default function HomePage() {
  return (
    <>
      <Header />
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
