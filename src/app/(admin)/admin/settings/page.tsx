import AdminSidebar from '@/components/layout/AdminSidebar'
import ComingSoon from '@/components/ui/ComingSoon'

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AdminSidebar active="Settings" />
      <ComingSoon
        title="Platform Settings"
        description="Global configuration, feature flags, and platform-wide settings coming soon."
        backHref="/admin"
        backLabel="Back to overview"
      />
    </div>
  )
}
