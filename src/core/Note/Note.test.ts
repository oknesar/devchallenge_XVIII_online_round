import Note from './index'

describe('Note', () => {
  test('Simple creation', () => {
    const note = new Note('E4/4')
    expect(note.getName()).toBe('E4')
    expect(note.getLength()).toBe(0.25)
  })

  test('Length with dot', () => {
    const note = new Note('E4/4.')
    expect(note.getName()).toBe('E4')
    expect(note.getLength()).toBe(0.375)
  })
})
