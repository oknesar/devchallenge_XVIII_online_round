import { getNoteFrequency } from '../../helpers/note'
import { assert } from '../../helpers/error'

export default class Note {
  protected name: string
  protected length: number
  protected frequency: number

  private static cache = new Map<string, Note>()
  static create(notation: string) {
    if (this.cache.has(notation)) return this.cache.get(notation)
    const note = new this(notation)
    this.cache.set(notation, note)
    return note
  }

  static isNotationValid(notation: string) {
    return /^(([CDEFGAB]#?\d)|_)\/\d\.?$/.test(notation)
  }

  constructor(private notation: string) {
    assert(Note.isNotationValid(notation), 'Invalid note notation')
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

  isEqual(item: any) {
    return item === this || (item instanceof Note && item.toString() === this.toString())
  }
}
