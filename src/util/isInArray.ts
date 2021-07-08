import findIndex from './findIndex'

export default function isInArray(array: string[] | string[][], value: string | string[]) {
  return findIndex(array, value) != -1
}
