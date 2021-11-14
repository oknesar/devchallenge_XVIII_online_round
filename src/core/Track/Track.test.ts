import Track from './index'
import Sequence from '../Sequence'
import Note from '../Note'

describe('Track', () => {
  const empireMarsh =
    'E4/4 E4/4 E4/4 D#4/8. A#4/16 E4/4 D#4/8. A#4/16 E4/2\n' +
    'D5/4 D5/4 D5/4 D#5/8. A#4/16 F#4/4 D#4/8. A#4/16 E4/2'

  test('Simple creation', () => {
    Track.create()
  })

  test('Able to add sequence', () => {
    Track.create().addSequence(empireMarsh)
    Track.create().addSequence(new Sequence(empireMarsh))
  })

  test('Able to set bpm', () => {
    expect(Track.create().getBpm()).toBe(Track.defaultBpm)
    expect(Track.create().setBpm(100).getBpm()).toBe(100)
  })

  test('Able to set volume', () => {
    expect(Track.create().getVolume()).toBe(Track.defaultVolume)
    expect(Track.create().setVolume(1).getVolume()).toBe(1)
  })

  test('Tack should be iterable', () => {
    for (const trackElement of Track.create()) {
      expect(trackElement).toEqual(
        expect.objectContaining({
          note: expect.any(Note),
          start: expect.any(Number),
          end: expect.any(Number),
          volume: expect.any(Number),
        })
      )
    }
  })
  test('Start of N note should be end of note N-1', () => {
    let lastEnd = 0
    for (const { start, end } of Track.create().addSequence(empireMarsh)) {
      expect(start).toBe(lastEnd)
      lastEnd = end
    }
    lastEnd = 0
    for (const { start, end } of Track.create().setBpm(100).addSequence(empireMarsh)) {
      expect(start).toBe(lastEnd)
      lastEnd = end
    }
  })
})
