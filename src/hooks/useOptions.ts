import { computed, nextTick, Ref, ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'
import findIndex from '@/util/findIndex'

export default function useOptions() {
  const store = useStore(key)
  const selected = computed(() => store.state.product.options)

  const used = computed(() => {
    return selected.value.filter((item) => subOptions[item].selected.length)
  })

  const preset = ref(['Color', 'Size'])

  const removeFromArray = function(array: string[] | string[][], value: string | string[]) {
    const index = findIndex(array, value)
    if (index == -1) return
    array.splice(index, 1)
  }

  const selectOption = function(name: string) {
    store.commit('addOption', name)
    if (!subOptions[name])
      subOptions[name] = {
        preset: [] as string[],
        selected: [] as string[],
        label: name,
      }
  }

  const deleteOption = function(name: string) {
    store.commit('deleteOption', name)
  }

  const subOptions = reactive({
    Color: {
      preset: ['Burnt', 'Olive'],
      selected: [],
      label: 'Color',
    },
    Size: {
      preset: ['XS', 'S', 'M', 'L', 'XL'],
      selected: [],
      label: 'Size',
    },
  } as { [key: string]: { preset: string[]; selected: string[]; label: string } })

  //При каждом изменении опций их необходимо сортировать, чтобы в таблице они отображались в праильном порядке
  const sort = function() {
    for (const option of selected.value) {
      const subOption = subOptions[option]
      const { preset, selected } = subOption

      const newSelected = [] as string[]
      for (const item of preset) {
        if (selected.includes(item)) newSelected.push(item)
      }
      for (const item of selected) {
        if (!preset.includes(item)) newSelected.push(item)
      }
      subOption.selected = newSelected
    }
  }

  const selectSubOption = function(optionName: string, subOptionName: string) {
    const subOption = subOptions[optionName]
    const { selected } = subOption
    selected.push(subOptionName)
    sort()
  }

  const deleteSubOption = function(optionName: string, subOptionName: string) {
    removeFromArray(subOptions[optionName].selected, subOptionName)
  }

  return computed(() => ({
    selected: selected.value,
    used: used.value,
    preset: preset.value,
    subOptions,
    selectOption,
    deleteOption,
    sort,
    selectSubOption,
    deleteSubOption,
  }))
}

export type OptionsHook = ReturnType<typeof useOptions>
