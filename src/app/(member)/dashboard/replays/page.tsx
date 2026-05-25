import MemberSidebar from '@/components/layout/MemberSidebar'
import ComingSoon from '@/components/ui/ComingSoon'

export default function ReplaysPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <MemberSidebar active="Replays" />
      <ComingSoon
        title="Replays"
        description="Watch recorded classes from your gyms. Full replay library coming soon."
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />
    </div>
  )
}
