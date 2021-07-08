export default function containsSame(array: string[], subset: string[]) {
  const values = new Map<string, number>()
  for (const item of array) {
    if (!values.has(item)) values.set(item, 1)
    else values.set(item, values.get(item) ?? 0 + 1)
  }

  for (const item of subset) {
    if (!values.has(item)) return false
    const currentValue = values.get(item) ?? 0
    if (currentValue == 1) values.delete(item)
    else values.set(item, currentValue - 1)
  }

  return true
}
