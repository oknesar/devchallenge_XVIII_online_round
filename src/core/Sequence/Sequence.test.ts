import Sequence from './index'
import Note from '../Note'

describe('Sequence', () => {
  const empireMarsh =
    'E4/4 E4/4 E4/4 D#4/8. A#4/16 E4/4 D#4/8. A#4/16 E4/2\n' +
    'D5/4 D5/4 D5/4 D#5/8. A#4/16 F#4/4 D#4/8. A#4/16 E4/2'

  test('Simple creation', () => {
    new Sequence(empireMarsh)
  })

  test('Sequence is iterable', () => {
    const sequence = new Sequence(empireMarsh)
    for (const note of sequence) {
      expect(note).toBeInstanceOf(Note)
    }
  })
})
