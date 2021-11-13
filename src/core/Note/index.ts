class Note {
  protected name: string
  protected length: number

  constructor(spec: string) {
    const [name, length] = spec.split('/')
    this.name = name
    this.length = (1 / parseInt(length)) * (length.endsWith('.') ? 1.5 : 1)
  }

  getName() {
    return this.name
  }

  getLength() {
    return this.length
  }
}

export default Note
