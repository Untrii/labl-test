import { computed, nextTick, Ref, ref, reactive, watch } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'
import isInArray from '@/util/isInArray'
import containsSame from '@/util/containsSame'
import { OptionsHook } from './useOptions'
import getOptionsCombinations from '@/util/getOptionsCombinations'

export default function useVariants(options: OptionsHook) {
  const store = useStore(key)

  const selected = computed(() => {
    return store.state.product.variants.map((item) => item.options)
  })

  const preset = computed(() => {
    const collections = [] as string[][]
    for (const option of options.value.selected) collections.push(options.value.subOptions[option].selected)
    return getOptionsCombinations(collections)
  })

  //Если мы убрали, например, все варианты с цветом Green, мы должны очистить соответствующую опцию
  const deleteUnusedSuboptions = function() {
    const newSubOptions = {} as Record<string, Set<string>>

    for (const variant of selected.value) {
      for (let i = 0; i < variant.length; i++) {
        const optionValue = variant[i]
        const optionName = options.value.selected[i]

        if (!newSubOptions[optionName]) newSubOptions[optionName] = new Set()
        newSubOptions[optionName].add(optionValue)
      }
    }
    for (const subOption in newSubOptions) {
      options.value.subOptions[subOption].selected = Array.from(newSubOptions[subOption])
    }
    options.value.sort()
  }

  watch(preset, (newPresetVariants, oldPresetVariants) => {
    if (!newPresetVariants.length && !oldPresetVariants.length) return

    for (const variant of selected.value) {
      if (!newPresetVariants.find((item) => containsSame(item, variant))) store.commit('deleteVariant', variant)
    }
    for (const variant of newPresetVariants) {
      if (!isInArray(oldPresetVariants, variant) && !isInArray(selected.value, variant))
        store.commit('addVariant', variant)
    }
    if (newPresetVariants.length == 0 && !selected.value.find((item) => item.length == 0))
      store.commit('addVariant', [])
    store.commit('sortVariants', preset.value)
  })

  const selectVariant = function(variant: string[]) {
    store.commit('addVariant', variant)
    store.commit('sortVariants', preset.value)
  }

  const deleteVariant = function(variant: string[]) {
    store.commit('deleteVariant', variant)
    deleteUnusedSuboptions()
  }

  return computed(() => ({
    selected: selected.value,
    preset: preset.value,
    selectVariant,
    deleteVariant,
  }))
}
