import LiveClient from './LiveClient'

interface Props {
  params: { id: string }
}

export default function LivePage({ params }: Props) {
  return <LiveClient />
}
