import ILocalizations from './ILocalizations'
import IVariant from './IVariant'

export default interface IProduct {
  default_locale: string
  locales: string[]

  product: {
    description: string
    images: {
      order: number
      url: string
    }[]
    localization: ILocalizations<string>
    name: string
    options: string[]
    variants: IVariant[]
  }

  regions: {
    currency: string
    name: string
  }[]
}
