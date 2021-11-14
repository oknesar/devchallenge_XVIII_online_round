import Note from '../Note'

export default class Sequence extends Array<Note> {
  constructor(track: string) {
    const notes = track.split(/\s/).map((notation) => Note.create(notation))
    super(...notes)
  }
}
