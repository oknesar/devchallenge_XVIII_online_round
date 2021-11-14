export default class AppError extends Error {
  static create(message?: string) {
    return new this(message)
  }

  static throw(message?: string) {
    throw this.create(message)
  }

  constructor(message?: string) {
    super(message)
  }
}
