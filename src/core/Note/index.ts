import { getNoteFrequency } from '../../helpers/note'

export default class Note {
  protected name: string
  protected length: number
  protected frequency: number

  constructor(private notation: string) {
    const [name, length] = notation.split('/')
    this.name = name
    this.length = (1 / parseInt(length)) * (length.endsWith('.') ? 1.5 : 1)
    this.frequency = this.name === '_' ? 0 : getNoteFrequency(this.name)
  }

  getName() {
    return this.name
  }

  getLength() {
    return this.length
  }

  getFrequency() {
    return this.frequency
  }

  toString() {
    return this.notation
  }
}
