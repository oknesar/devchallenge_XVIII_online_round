export default class EventEmitter<Events extends object = { [k: string]: any }> {
  private listeners = new Map<keyof Events, Array<(payload: Events[keyof Events]) => void>>()

  emit<Name extends keyof Events, Payload extends Events[Name]>(
    ...args: [Payload] extends [never] ? [name: Name, payload?: Payload] : [name: Name, payload: Payload]
  ) {
    const [name, payload] = args
    const listeners = this.listeners.get(name) ?? []
    for (const cb of listeners) {
      cb(payload)
    }
  }

  on<Name extends keyof Events, Payload extends Events[Name]>(name: Name, cb: (payload: Payload) => void) {
    const listeners = this.listeners.get(name) ?? []
    listeners.push(cb)
    this.listeners.set(name, listeners)
    return this
  }

  off<Name extends keyof Events, Payload extends Events[Name]>(name: Name, cb: (payload: Payload) => void) {
    const listeners = this.listeners.get(name) ?? []
    const index = listeners.indexOf(cb)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }
}
