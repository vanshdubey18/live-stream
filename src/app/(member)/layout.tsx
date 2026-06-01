import AICoachButton from '@/components/ai/AICoachButton'

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AICoachButton />
    </>
  )
}
