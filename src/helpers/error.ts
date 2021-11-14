import AppError from '../core/AppError'

export function assert(condition: any, message?: string) {
  if (!condition) AppError.throw(message)
}
