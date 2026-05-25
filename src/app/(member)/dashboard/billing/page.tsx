import MemberSidebar from '@/components/layout/MemberSidebar'
import ComingSoon from '@/components/ui/ComingSoon'

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <MemberSidebar active="Billing" />
      <ComingSoon
        title="Billing & Subscriptions"
        description="Manage your memberships, view invoices, and update payment methods."
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />
    </div>
  )
}
