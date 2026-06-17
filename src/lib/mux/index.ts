import Mux from '@mux/mux-node'

// Create the client at request time so env vars are always loaded and a missing
// key never crashes the module at import (which would take down the route).
function getMux() {
  return new Mux()
}

export async function createLiveStream() {
  const { video } = getMux()
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
  const { video } = getMux()
  const stream = await video.liveStreams.retrieve(streamId)
  return {
    status: stream.status,
    viewer_count: 0,
  }
}

export async function getLiveStreamKey(streamId: string) {
  const { video } = getMux()
  const stream = await video.liveStreams.retrieve(streamId)
  return {
    stream_key: stream.stream_key,
    playback_id: stream.playback_ids?.[0]?.id,
  }
}

export async function deleteLiveStream(streamId: string) {
  const { video } = getMux()
  await video.liveStreams.delete(streamId)
}
