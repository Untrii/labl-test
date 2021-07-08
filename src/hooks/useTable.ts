import { computed, nextTick, Ref, ref } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'

export default function useTable(selectedOptions: Ref<string[]>) {
  const store = useStore(key)
  //Хранит копию табличных данных, но в отличие от модели API может содержать не все поля
  const extendedTableData = ref(
    [] as {
      options: Record<string, string>
      values: number[]
    }[]
  )

  const getRecord = function(options: string[], optionNames: string[], ignoreOption?: string) {
    return extendedTableData.value.find((item) => {
      for (let i = 0; i < options.length; i++) {
        if (optionNames[i] == ignoreOption) continue
        if (item.options[optionNames[i]] != options[i]) return false
      }
      return true
    })
  }

  const addRecord = function(options: string[], optionNames: string[], index: number, value: number) {
    const tableRecord = getRecord(options, optionNames)
    if (!tableRecord) {
      const newRecord = {
        options: {} as Record<string, string>,
        values: Array(store.state.regions.length).fill(0),
      }

      for (let i = 0; i < options.length; i++) {
        const optionValue = options[i]
        const optionName = selectedOptions.value[i]
        newRecord.options[optionName] = optionValue
      }

      newRecord.values[index] = value
      extendedTableData.value.push(newRecord)
    } else tableRecord.values[index] = value
  }

  const grabTable = function() {
    const table = store.state.product.variants
    for (const row of table) {
      row.prices.forEach((item, index) => {
        addRecord(row.options, selectedOptions.value, index, item.price)
      })
    }
  }

  //При изменении опций нужно сгенерировать новые данные таблицы
  //Например { options: ['ColorName'], ... } => { options: ['ColorName', 'XS' ], ... }
  const merge = function(newUsedOptions: string[], newSelectedVariants: string[][], oldUsedOptions: string[]) {
    if (newUsedOptions.length != oldUsedOptions.length) {
      const ignoreOption = newUsedOptions.find((option) => !oldUsedOptions.includes(option))
      nextTick(() => {
        for (const selectedVariant of newSelectedVariants) {
          const tableRecord = getRecord(selectedVariant, newUsedOptions, ignoreOption)
          tableRecord?.values.forEach((value, index) => {
            store.commit('updateTable', {
              options: selectedVariant,
              index,
              value,
            })
          })
        }
        nextTick(() => grabTable())
      })
    } else nextTick(() => grabTable())
  }

  const update = function(event: { options: string[]; index: number; value: number }) {
    store.commit('updateTable', event)
    addRecord(event.options, selectedOptions.value, event.index, event.value)
  }

  return {
    update,
    merge,
  }
}
