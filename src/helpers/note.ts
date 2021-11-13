const scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const A4 = {
  freq: 440,
  index: getNoteIndex('A4'),
}

export function getNoteFrequency(note: string) {
  const noteIndex = getNoteIndex(note)
  const delta = noteIndex - A4.index
  return A4.freq * Math.pow(2, delta / 12)
}

function getNoteIndex(note: string) {
  const withSharp = note[1] === '#'
  const name = withSharp ? note.slice(0, 2) : note.slice(0, 1)
  const scaleIndex = parseInt(withSharp ? note.slice(2) : note.slice(1))

  return scale.indexOf(name) + scale.length * scaleIndex
}
