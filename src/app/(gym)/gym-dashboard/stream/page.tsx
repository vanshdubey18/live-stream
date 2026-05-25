import { redirect } from 'next/navigation'

// Stream setup lives on the main gym dashboard
export default function StreamPage() {
  redirect('/gym-dashboard')
}
