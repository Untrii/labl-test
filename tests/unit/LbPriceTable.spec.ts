import { shallowMount } from '@vue/test-utils'
import LbPriceTable from '@/components/LbPriceTable.vue'
import INestedRow from '@/models/INestedRow'

const wrapper = shallowMount(LbPriceTable, {
  props: {
    data: [
      {
        options: ['Burnt', 'XS'],
        prices: [
          { price: 120, region: 'EU' },
          { price: 4000, region: 'Russia' },
        ],
      },
      {
        options: ['Burnt', 'S'],
        prices: [
          { price: 130, region: 'EU' },
          { price: 4300, region: 'Russia' },
        ],
      },
      {
        options: ['Olive', 'S'],
        prices: [
          { price: 120, region: 'EU' },
          { price: 4000, region: 'Russia' },
        ],
      },
      {
        options: ['Olive', 'M'],
        prices: [
          { price: 120, region: 'EU' },
          { price: 4000, region: 'Russia' },
        ],
      },
    ],
    regions: [
      { currency: 'EUR', name: 'EU' },
      { currency: 'RUB', name: 'Russia' },
    ],
    options: [
      ['Burnt', 'XS'],
      ['Burnt', 'S'],
      ['Olive', 'S'],
      ['Olive', 'M'],
    ],
  },
})

describe('LbPriceTable', () => {
  it('should generate correct table tree', () => {
    const tableTree = wrapper.vm.tableTree as INestedRow
    expect(tableTree).toBeTruthy()
    expect(tableTree.nested).toBeTruthy()
    for (const nestedRow of tableTree.nested as INestedRow[]) {
      expect(nestedRow.nested).toHaveLength(2)
    }
  })

  it('should correct calculate min and max prices', () => {
    const tableTree = wrapper.vm.tableTree as INestedRow
    expect(tableTree).toBeTruthy()

    const data = tableTree.data
    expect(data[0]).toStrictEqual({ min: 120, max: 130 })
    expect(data[1]).toStrictEqual({ min: 4000, max: 4300 })
  })
})
