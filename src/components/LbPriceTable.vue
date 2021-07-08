<template>
  <table class="lb-price-table">
    <thead>
      <tr>
        <th class="lb-price-table__heading" v-for="heading in tableHeadings" :key="heading" scope="col">
          {{ heading }}
        </th>
      </tr>
    </thead>
    <tbody class="lb-price-table__body">
      <LbPriceTableRow
        :disabled="disabled"
        :columnCount="regions.length"
        v-bind="tableTree"
        @change="onChange"
      ></LbPriceTableRow>
    </tbody>
  </table>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, watch } from 'vue'
import LbPriceTableRow from './LbPriceTableRow.vue'
import INestedRow from '@/models/INestedRow'
import getOptionsCombinations from '@/util/getOptionsCombinations'
import isPrefixOf from '@/util/isPrefixOf'
import containsSame from '@/util/containsSame'
import isSubsetOf from '@/util/isSubsetOf'

export default defineComponent({
  name: 'LbPriceTable',
  components: {
    LbPriceTableRow,
  },
  props: {
    name: {
      type: String,
      default: () => 'Product',
    },
    regions: {
      type: Array as PropType<{ name: string; currency: string }[]>,
      default: () => [],
    },
    options: {
      type: Array as PropType<string[][]>,
      default: () => [],
    },
    data: {
      type: Array as PropType<
        {
          options: string[]
          prices: {
            price: number
            region: string
          }[]
        }[]
      >,
      default: () => [],
    },
    disabled: Boolean,
  },
  setup(props, { emit }) {
    const tableHeadings = computed(() => {
      const { regions, name } = props
      return [
        'Product',
        ...regions.map((item) => {
          return `${item.name}, ${item.currency}`
        }),
      ]
    })

    const computeNestedPrices = function(row: INestedRow) {
      const { nested } = row
      if (!nested || !nested.length) return
      let prices: ({ min: number; max: number } | number)[] = []
      let minNestedPrices: number[] = []
      let maxNestedPrices: number[] = []

      for (const item of nested) {
        computeNestedPrices(item)
        const nestedPrices = item.data

        if (!prices.length) {
          prices = [...nestedPrices]
          minNestedPrices = nestedPrices.map((item) => {
            if (typeof item == 'number') return item
            else return item.min
          })
          maxNestedPrices = nestedPrices.map((item) => {
            if (typeof item == 'number') return item
            else return item.max
          })
          continue
        }
        for (let i = 0; i < nestedPrices.length; i++) {
          const element = nestedPrices[i] as any
          if (typeof element == 'number') minNestedPrices[i] = Math.min(minNestedPrices[i], element)
          else minNestedPrices[i] = Math.min(minNestedPrices[i], element.min)

          if (typeof nestedPrices[i] == 'number') maxNestedPrices[i] = Math.max(maxNestedPrices[i], element)
          else maxNestedPrices[i] = Math.max(maxNestedPrices[i], element.max)
        }
      }
      for (let i = 0; i < prices.length; i++) {
        if (minNestedPrices[i] != maxNestedPrices[i]) prices[i] = { min: minNestedPrices[i], max: maxNestedPrices[i] }
        else prices[i] = minNestedPrices[i]
      }

      for (let i = 0; i < prices.length; i++) {
        if (row.data[i] == null) row.data[i] = prices[i]
      }
    }

    const buildTableTree = function(rootName: string, options: string[][], columnCount: number): INestedRow {
      const root = { heading: rootName, data: Array(columnCount).fill(null) } as INestedRow
      const { data } = props
      for (const optionCollection of options) {
        let currentNode = root
        let currentOptionChain = [] as string[]
        for (const option of optionCollection) {
          if (!currentNode.nested) currentNode.nested = []
          currentOptionChain.push(option)

          let nextNode = currentNode.nested?.find((item) => item.heading == option)
          if (!nextNode) {
            const { nested } = currentNode
            nextNode = { heading: option, data: [...currentNode.data] } as INestedRow
            nested.push(nextNode)
          }

          const tableRowData = data.find((item) => containsSame(item.options, currentOptionChain))
          if (tableRowData) nextNode.data = tableRowData.prices.map((price) => price.price)

          currentNode = nextNode
        }
      }
      if (options.length == 1 && options[0].length == 0) {
        for (let i = 0; i < data[0].prices.length; i++) {
          const element = data[0].prices[i]
          root.data[i] = element.price
        }
      }
      computeNestedPrices(root)
      return root
    }

    const tableTree = computed(() => {
      return buildTableTree(props.name, props.options, props.regions.length)
    })

    const optionsCombinations = computed(() => {
      return getOptionsCombinations(props.options)
    })

    const onChange = function({ path, index, value }: { path: string[]; index: number; value: number }) {
      const { data } = props
      for (const row of data) {
        if (isSubsetOf(row.options, path)) emit('change', { options: row.options, index, value })
      }
    }

    return { tableHeadings, tableTree, onChange }
  },
})
</script>

<style lang="scss" scoped>
@import '@/css/variables.scss';
.lb-price-table {
  border-spacing: 0;
  color: gray;

  &__heading {
    padding-left: 12px;
    padding-right: 32px;
    font-weight: 400;
    text-align: left;
  }

  &__body {
    border-radius: $radius-tiny;
    box-shadow: inset 0 0 0 1px #b3b3b3;
  }
}
</style>
