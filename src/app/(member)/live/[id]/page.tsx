import { redirect } from 'next/navigation'

export default function LivePage({ params }: { params: { id: string } }) {
  redirect(`/watch/${params.id}`)
}
