import Mux from '@mux/mux-node'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export const { video } = mux
export default mux

export async function createLiveStream() {
  const stream = await video.liveStreams.create({
    playback_policy: ['public'],
    new_asset_settings: {
      playback_policy: ['public'],
    },
    reduced_latency: true,
    reconnect_window: 60,
  })

  return {
    id: stream.id,
    stream_key: stream.stream_key,
    playback_id: stream.playback_ids?.[0]?.id,
  }
}

export async function getLiveStreamStatus(streamId: string) {
  const stream = await video.liveStreams.retrieve(streamId)
  return {
    status: stream.status, // 'idle' | 'active' | 'disconnected'
    viewer_count: 0,
  }
}

export async function deleteLiveStream(streamId: string) {
  await video.liveStreams.delete(streamId)
}
