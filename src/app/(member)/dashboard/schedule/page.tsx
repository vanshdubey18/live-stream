import MemberSidebar from '@/components/layout/MemberSidebar'
import ComingSoon from '@/components/ui/ComingSoon'

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <MemberSidebar active="Schedule" />
      <ComingSoon
        title="Your Schedule"
        description="View upcoming classes from your gyms, set reminders, and plan your training week."
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />
    </div>
  )
}
