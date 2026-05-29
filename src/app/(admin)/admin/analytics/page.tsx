import AdminSidebar from '@/components/layout/AdminSidebar'
import ComingSoon from '@/components/ui/ComingSoon'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <AdminSidebar active="Analytics" />
      <ComingSoon
        title="Analytics"
        description="MRR, member growth, viewership, and per-gym revenue charts will appear here once there's enough real activity to plot."
        backHref="/admin"
        backLabel="Back to overview"
      />
    </div>
  )
}
