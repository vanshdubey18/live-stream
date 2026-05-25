import GymSidebar from '@/components/layout/GymSidebar'
import ComingSoon from '@/components/ui/ComingSoon'

export default function GymSchedulePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <GymSidebar active="Schedule Classes" />
      <ComingSoon
        title="Schedule Classes"
        description="Advanced scheduling with recurring classes, waitlists, and calendar view coming soon."
        backHref="/gym-dashboard"
        backLabel="Back to dashboard"
      />
    </div>
  )
}
