import { store } from '@/store'

store.commit('addOption', 'Color')
store.commit('addOption', 'Size')

const sampleOptions = ['SampleColor', 'SampleSize']
const secondVariant = ['SampleColor', 'SampleSize2']

const getPrices = (variantIndex = 0) => store.state.product.variants[0].prices.map((item) => item.price)

describe('store', () => {
  it('should add variants', () => {
    store.commit('addVariant', sampleOptions)
    expect(store.state.product.variants).toHaveLength(1)

    store.commit('addVariant', sampleOptions)
    expect(store.state.product.variants).toHaveLength(1)
  })

  it('should delete variant', () => {
    store.commit('deleteVariant', sampleOptions)
    expect(store.state.product.variants).toHaveLength(0)

    store.commit('deleteVariant', sampleOptions)
    expect(store.state.product.variants).toHaveLength(0)
  })

  it('should update table', () => {
    store.commit('addVariant', sampleOptions)
    store.commit('updateTable', { options: sampleOptions, index: 0, value: 100 })
    store.commit('updateTable', { options: sampleOptions, index: 1, value: 100 })
    expect(getPrices()).toStrictEqual([100, 100])

    store.commit('updateTable', { options: sampleOptions, index: 1, value: 1000 })
    expect(getPrices()).toStrictEqual([100, 1000])
  })

  it('should set same prices as same variants', () => {
    store.commit('addVariant', sampleOptions)
    store.commit('updateTable', { options: sampleOptions, index: 0, value: 100 })
    store.commit('updateTable', { options: sampleOptions, index: 1, value: 100 })

    store.commit('addVariant', secondVariant)
    expect(getPrices(1)).toStrictEqual([100, 100])
  })
})
