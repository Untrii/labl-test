export default function isPrefixOf(array: string[], prefix: string[]) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] != prefix[i]) return false
  }
  return true
}
