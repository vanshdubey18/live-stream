// Placeholder training photos shown until a replay has a real Cloudflare
// Stream auto-generated thumbnail (cf_video_uid). Swap for real class
// photography when available — these are just to avoid an empty card in the
// meantime.
const MOCK_REPLAY_PHOTOS = [
  'https://images.pexels.com/photos/4761598/pexels-photo-4761598.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/5750947/pexels-photo-5750947.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6296121/pexels-photo-6296121.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/7991692/pexels-photo-7991692.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6793653/pexels-photo-6793653.jpeg?auto=compress&cs=tinysrgb&w=800',
]

export function mockPhotoFor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return MOCK_REPLAY_PHOTOS[hash % MOCK_REPLAY_PHOTOS.length]
}
