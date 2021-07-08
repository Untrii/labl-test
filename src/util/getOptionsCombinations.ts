export default function getOptionsCombinations(optionCollections: string[][]) {
  optionCollections = optionCollections.filter((item) => item.length)
  if (optionCollections.length == 0) return []
  if (optionCollections.length == 1) return optionCollections[0].map((item) => [item])

  let variants = [] as string[][]

  for (const optionCollection of optionCollections) {
    const newVariants = [] as string[][]
    if (variants.length) {
      for (const variant of variants) {
        for (const option of optionCollection) {
          newVariants.push([...variant, option])
        }
      }
    } else {
      for (const option of optionCollection) {
        newVariants.push([option])
      }
    }
    variants = newVariants
  }
  return variants
}
