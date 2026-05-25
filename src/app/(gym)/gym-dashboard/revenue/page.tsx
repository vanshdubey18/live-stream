import GymSidebar from '@/components/layout/GymSidebar'
import ComingSoon from '@/components/ui/ComingSoon'

export default function GymRevenuePage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <GymSidebar active="Revenue" />
      <ComingSoon
        title="Revenue & Payouts"
        description="Detailed revenue breakdown, payout history, and earnings forecasts coming soon."
        backHref="/gym-dashboard"
        backLabel="Back to dashboard"
      />
    </div>
  )
}
