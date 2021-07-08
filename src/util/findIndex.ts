export default function isInArray(array: string[] | string[][], value: string | string[]) {
  for (let index = 0; index < array.length; index++) {
    const item = array[index]
    if (typeof item == 'string') {
      if (item === value) return index
    } else {
      if (item.length != value.length) continue
      if (typeof value == 'string') continue

      let isEquals = true
      for (let i = 0; i < value.length; i++) {
        if (value[i] != item[i]) isEquals = false
      }
      if (isEquals) return index
    }
  }
  return -1
}
