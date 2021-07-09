import IProduct from '@/models/IProduct'
import IVariant from '@/models/IVariant'
import containsSame from './containsSame'

function isImagesEquals(a: IProduct, b: IProduct) {
  const imgA = [...a.product.images]
  const imgB = [...b.product.images]
  if (imgA.length != imgB.length) return false

  for (let i = 0; i < imgA.length; i++) {
    if (imgA[i].order != imgB[i].order || imgA[i].url != imgB[i].url) return false
  }
  return true
}

function isLocalesEquals(a: IProduct, b: IProduct) {
  const keysA = a.locales
  const keysB = b.locales

  if (!containsSame(keysA, keysB)) return false
  for (const key of keysA) {
    const localeA = a.product.localization[key] ?? { name: '', description: '' }
    const localeB = b.product.localization[key] ?? { name: '', description: '' }

    if (localeA.description != localeB.description || localeA.name != localeB.name) return false
  }
  return true
}

function normalizeVariant(variant: IVariant, options: string[]) {
  const newVariant: IVariant = {
    options: [],
    prices: [...variant.prices],
  }
  newVariant.prices.sort((a, b) => {
    if (a.region > b.region) return -1
    if (a.region == b.region) return 0
    return 1
  })

  const optionValueMapping = {} as { [key: string]: string }
  for (let i = 0; i < options.length; i++) {
    optionValueMapping[options[i]] = variant.options[i]
  }

  for (const key of Object.keys(optionValueMapping).sort()) {
    newVariant.options.push(optionValueMapping[key])
  }
  return newVariant
}

function variantComparator(a: IVariant, b: IVariant) {
  const valueA = a.options.join()
  const valueB = b.options.join()

  if (valueA > valueB) return -1
  if (valueA == valueB) return 0
  return 1
}

function comparePrices(
  a: {
    price: number
    region: string
  }[],
  b: {
    price: number
    region: string
  }[]
) {
  if (a.length != b.length) return false
  const priceMapping = new Map<string, number>()

  for (const price of a) {
    priceMapping.set(price.region, price.price)
  }

  for (const price of b) {
    if (priceMapping.get(price.region) != price.price) return false
  }
  return true
}

function isVariantsSame(a: IProduct, b: IProduct) {
  const variantsA = a.product.variants.map((item) => normalizeVariant(item, a.product.options)).sort(variantComparator)
  const variantsB = b.product.variants.map((item) => normalizeVariant(item, b.product.options)).sort(variantComparator)

  if (variantsA.length != variantsB.length) return false
  for (let i = 0; i < variantsA.length; i++) {
    if (!containsSame(variantsA[i].options, variantsB[i].options)) return false
    if (!comparePrices(variantsA[i].prices, variantsB[i].prices)) return false
  }
  return true
}

function isRegionsSame(a: IProduct, b: IProduct) {
  if (a.regions.length != b.regions.length) return false
  return containsSame(
    a.regions.map((item) => item.name),
    b.regions.map((item) => item.name)
  )
}

export default function isProductEquals(a: IProduct, b: IProduct) {
  return (
    a.default_locale == b.default_locale &&
    containsSame(a.locales, b.locales) &&
    a.product.description == b.product.description &&
    isImagesEquals(a, b) &&
    isLocalesEquals(a, b) &&
    a.product.name == b.product.name &&
    containsSame(a.product.options, b.product.options) &&
    isVariantsSame(a, b) &&
    isRegionsSame(a, b)
  )
}
