import PriceTree from '@/models/IPriceTree'
import IProduct from '@/models/IProduct'
import IVariant from '@/models/IVariant'
import containsSame from '@/util/containsSame'
import isSubsetOf from '@/util/isSubsetOf'
import { InjectionKey } from 'vue'
import { createStore, Store, MutationTree, GetterTree } from 'vuex'

export interface State extends IProduct {}

export const key: InjectionKey<Store<State>> = Symbol()

function getDefaultState(): IProduct {
  return {
    default_locale: 'en',
    locales: ['en', 'fr', 'es'],
    product: {
      description: 'Sample description',
      images: [],
      localization: {
        fr: {
          name: '',
          description: '',
        },
        es: {
          name: '',
          description: '',
        },
      },
      name: 'Product name',
      options: [],
      variants: [],
    },
    regions: [
      { currency: 'EUR', name: 'EU' },
      { currency: 'RUB', name: 'Russia' },
    ],
  }
}

const mutations: MutationTree<State> = {
  updateProductName(state, { locale, value }: { locale: string; value: string }) {
    if (locale == state.default_locale) state.product.name = value
    else state.product.localization[locale].name = value
  },
  updateProductDescription(state, { locale, value }: { locale: string; value: string }) {
    if (locale == state.default_locale) state.product.description = value
    else state.product.localization[locale].description = value
  },
  addImage(state, image: File) {
    let maxOrder = 1
    for (const image of state.product.images) {
      maxOrder = Math.max(image.order, maxOrder)
    }
    state.product.images.push({
      url: URL.createObjectURL(image),
      order: maxOrder + 1,
    })
  },
  addOption(state, option: string) {
    const { options } = state.product
    if (!options.includes(option)) options.push(option)
    options.sort()
  },
  deleteOption(state, option: string) {
    const { options } = state.product
    state.product.options = options.filter((item) => item != option)
  },
  addVariant(state, value: string[]) {
    const { product, regions } = state
    const { variants } = product
    if (!variants.find((item) => containsSame(item.options, value))) {
      const prices = [] as {
        price: number
        region: string
      }[]

      for (const region of regions) {
        const priceTree = new PriceTree()

        for (const variant of variants) {
          const price = variant.prices.find((item) => item.region == region.name)?.price ?? 0
          priceTree.addData(variant.options, price)
        }
        prices.push({
          price: priceTree.getDeepValue(value) ?? 0,
          region: region.name,
        })
      }

      variants.push({
        options: value,
        prices,
      })
    }
  },
  deleteVariant(state, value: string[]) {
    for (let i = 0; i < state.product.variants.length; i++) {
      const element = state.product.variants[i]
      if (containsSame(element.options, value)) {
        state.product.variants.splice(i, 1)
        break
      }
    }
  },
  sortVariants(state, preset: string[][]) {
    const selected = state.product.variants

    const newSelected = [] as IVariant[]
    for (const item of preset) {
      const variant = selected.find((entry) => containsSame(item, entry.options))
      if (variant) newSelected.push(variant)
    }
    for (const item of selected) {
      if (!preset.find((entry) => containsSame(item.options, entry))) newSelected.push(item)
    }
    state.product.variants = newSelected
  },
  updateTable(state, { options, index, value }: { options: string[]; index: number; value: number }) {
    const { variants } = state.product
    for (const tableRow of variants) {
      if (isSubsetOf(tableRow.options, options)) tableRow.prices[index].price = value
    }
  },
  setData(state, data: IProduct) {
    for (const key in data) {
      state[key as keyof IProduct] = data[key as keyof IProduct] as any
    }
    for (const locale of data.locales) {
      if (locale == data.default_locale) continue
      const { localization } = state.product

      if (!(locale in localization))
        localization[locale] = {
          name: '',
          description: '',
        }
    }
  },
}

const getters: GetterTree<State, State> = {
  getLocale: (state) => (locale?: string) => {
    locale ??= state.default_locale
    if (locale == state.default_locale) {
      return {
        name: state.product.name,
        description: state.product.description,
      }
    }
    return state.product.localization[locale]
  },
}

export const store = createStore<State>({
  state: getDefaultState,
  mutations,
  getters,
  actions: {},
  modules: {},
})
