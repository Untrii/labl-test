import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'

export default function useTabs() {
  const store = useStore(key)

  const selected = ref(store.state.default_locale)
  const model = computed(() =>
    store.state.locales.map((item) => ({
      name: item,
      value: item,
    }))
  )
  const currentProductName = computed(() => store.getters.getLocale(selected.value).name as string)
  const defaultProductName = computed(() => store.getters.getLocale().name as string)
  const currentDescription = computed(() => store.getters.getLocale(selected.value).description as string)

  const select = (value: string) => (selected.value = value)
  const changeName = (value: string) => store.commit('updateProductName', { locale: selected.value, value })
  const changeDescription = (value: string) =>
    store.commit('updateProductDescription', { locale: selected.value, value })

  return computed(() => ({
    selected: selected.value,
    model: model.value,
    currentProductName: currentProductName.value,
    defaultProductName: defaultProductName.value,
    currentDescription: currentDescription.value,
    select,
    changeName,
    changeDescription,
  }))
}
