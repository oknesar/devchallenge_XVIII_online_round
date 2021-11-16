import Sequence from '../Sequence'
import { assert } from '../../helpers/error'
import Note from '../Note'

export interface TrackItem {
  note: Note
  start: number
  end: number
  volume: number
}

export default class Track {
  static create() {
    return new this()
  }

  static defaultBpm = 100
  static defaultVolume = 0.6

  protected sequences: Sequence[] = []
  protected bpm = Track.defaultBpm
  protected volume = Track.defaultVolume

  addSequence(sequence: string | Sequence) {
    this.sequences.push(typeof sequence === 'string' ? new Sequence(sequence) : sequence)
    return this
  }

  replaceSequences(sequence: string | Sequence) {
    this.sequences = [typeof sequence === 'string' ? new Sequence(sequence) : sequence]
    return this
  }

  getBpm() {
    return this.bpm
  }

  setBpm(bpm: number) {
    assert(this.bpm > 0, 'pbm have to be grater than 0')
    this.bpm = bpm
    return this
  }

  getVolume() {
    return this.volume
  }

  getCeilNoteDuration() {
    return (60 / this.getBpm()) * 4
  }

  getLength() {
    const ceilNoteDuration = this.getCeilNoteDuration()
    return this.sequences.reduce(
      (total, seq) =>
        total + seq.reduce((seqTotal, note) => seqTotal + note.getLength() * ceilNoteDuration, 0),
      0
    )
  }

  setVolume(volume: number) {
    assert(volume > 0 && volume <= 1, 'Expected volume between 0 and 1')
    this.volume = volume
    return this
  }

  [Symbol.iterator] = function* (this: Track): Generator<TrackItem> {
    let time = 0
    const ceilNoteDuration = this.getCeilNoteDuration()
    for (const sequence of this.sequences) {
      for (const note of sequence) {
        const noteDuration = note.getLength() * ceilNoteDuration
        yield {
          note,
          start: time,
          end: time + noteDuration,
          volume: this.getVolume(),
        }
        time += noteDuration
      }
    }
  }
}
