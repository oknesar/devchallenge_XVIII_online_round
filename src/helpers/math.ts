export function round(value: number, precision: number = 2) {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

export function floor(value: number, precision: number = 2) {
  const factor = 10 ** precision
  return Math.floor(value * factor) / factor
}

export function ceil(value: number, precision: number = 2) {
  const factor = 10 ** precision
  return Math.ceil(value * factor) / factor
}
