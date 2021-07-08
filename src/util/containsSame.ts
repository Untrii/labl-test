import isSubsetOf from './isSubsetOf'

export default function containsSame(array0: string[], array1: string[]) {
  if (array0.length != array1.length) return false
  return isSubsetOf(array0, array1)
}
