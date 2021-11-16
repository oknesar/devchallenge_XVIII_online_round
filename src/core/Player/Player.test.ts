import Player from './index'
import Track from '../Track'

describe('Player', () => {
  test('Simple creation', () => {
    new Player()
  })

  test('Add track', () => {
    const player = new Player()
    player.addTrack('main', Track.create())
  })

  test('Get track by name', () => {
    const player = new Player()
    const track = Track.create()
    player.addTrack('main', track)
    expect(player.getTrack('main')).toBe(track)
  })

  test('Remove track', () => {
    const player = new Player()
    player.addTrack('main', Track.create())
    player.removeTrack('main')
    expect(player.getTrack('main')).toBe(undefined)
  })

  // jsdom doesn't support WebAudio API :(
})
