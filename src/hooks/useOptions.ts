import { computed, ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'
import findIndex from '@/util/findIndex'

export default function useOptions() {
  const store = useStore(key)

  const selected = ref([] as string[])
  const used = computed(() => [...store.state.product.options])
  const preset = ref(['Color', 'Size'])

  const removeFromArray = function(array: string[] | string[][], value: string | string[]) {
    const index = findIndex(array, value)
    if (index == -1) return
    array.splice(index, 1)
  }

  const selectOption = function(name: string) {
    selected.value = [...selected.value, name]
    if (!subOptions[name])
      subOptions[name] = {
        preset: [] as string[],
        selected: [] as string[],
        label: name,
      }
  }

  const deleteOption = function(name: string) {
    selected.value = selected.value.filter((item) => item != name)
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

    if (selected.length == 0) store.commit('addOption', optionName)
    selected.push(subOptionName)
    sort()
  }

  const deleteSubOption = function(optionName: string, subOptionName: string) {
    const subOption = subOptions[optionName]
    removeFromArray(subOption.selected, subOptionName)
    if (subOption.selected.length == 0) store.commit('deleteOption', optionName)
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
