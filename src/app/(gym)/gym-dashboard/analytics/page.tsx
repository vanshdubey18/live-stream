import GymSidebar from '@/components/layout/GymSidebar'
import ComingSoon from '@/components/ui/ComingSoon'

export default function GymAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <GymSidebar active="Analytics" />
      <ComingSoon
        title="Analytics"
        description="Viewer stats, peak hours, member retention, and class performance metrics coming soon."
        backHref="/gym-dashboard"
        backLabel="Back to dashboard"
      />
    </div>
  )
}
