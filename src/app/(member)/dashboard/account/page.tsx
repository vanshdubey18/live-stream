import MemberSidebar from '@/components/layout/MemberSidebar'
import ComingSoon from '@/components/ui/ComingSoon'

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <MemberSidebar active="Account" />
      <ComingSoon
        title="Account Settings"
        description="Update your profile, change password, and manage notification preferences."
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />
    </div>
  )
}
