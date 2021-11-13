import { getNoteFrequency } from '../../helpers/note'

export default class Note {
  protected name: string
  protected length: number
  protected frequency: number

  constructor(spec: string) {
    const [name, length] = spec.split('/')
    this.name = name
    this.length = (1 / parseInt(length)) * (length.endsWith('.') ? 1.5 : 1)
    this.frequency = getNoteFrequency(this.name)
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
}
