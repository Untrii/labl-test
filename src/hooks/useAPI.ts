import { computed, watch, ref, nextTick, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'
import router from '@/router'
import { baseApiUrl } from '@/config'

import IProduct from '@/models/IProduct'
import IVariant from '@/models/IVariant'

export default function useAPI(
  selectOption: (value: string) => void,
  selectSubOption: (name: string, value: string) => void
) {
  const store = useStore(key)

  const isQueryPending = ref(false)
  const isDataFetched = ref(false)

  watch(isQueryPending, (newValue) => {
    if (!newValue) {
      //@ts-ignore
      document.activeElement?.blur?.()
    }
  })

  const fillSubOptions = function(variants: IVariant[], options: string[]) {
    for (const option of options) selectOption(option)
    for (const variant of variants) {
      for (let i = 0; i < variant.options.length; i++) {
        const element = variant.options[i]
        selectSubOption(options[i], element)
      }
    }
  }

  const fetchedProduct = ref({} as IProduct)
  const fetchData = async function() {
    isQueryPending.value = true
    const currentRoute = router.currentRoute.value
    const productId = currentRoute.params.id ?? 'rose'
    try {
      const product = await fetch(baseApiUrl + '/products/' + productId)
      const response = await product.text()

      //Дважды вызываем JSON.parse, чтобы store и fetchedProduct ссылались на разные объекты
      fetchedProduct.value = JSON.parse(response)
      const responseObject = JSON.parse(response) as IProduct
      fillSubOptions(responseObject.product.variants, responseObject.product.options)
      nextTick(() => {
        store.commit('setData', responseObject)
      })
      isDataFetched.value = true
    } catch {
      alert('Ошибка при отправке запроса')
    }
    isQueryPending.value = false
  }

  const uploadData = async function() {
    const data = JSON.stringify(store.state)
    const currentRoute = router.currentRoute.value
    const productId = currentRoute.params.id ?? 'rose'

    isQueryPending.value = true
    try {
      await fetch(baseApiUrl + '/products/' + productId, {
        method: 'PUT',
        body: data,
      })
      fetchedProduct.value = JSON.parse(data)
    } catch {
      alert('Ошибка при отправке запроса')
    }
    isQueryPending.value = false
  }

  const deleteData = async function() {
    const currentRoute = router.currentRoute.value
    const productId = currentRoute.params.id ?? 'rose'

    isQueryPending.value = true
    try {
      await fetch(baseApiUrl + '/products/' + productId, {
        method: 'DELETE',
      })
      alert('Продукт удалён')
      router.push('/')
    } catch {
      alert('Ошибка при отправке запроса')
    }
    isQueryPending.value = false
  }

  onBeforeMount(() => {
    fetchData()
  })

  return computed(() => ({
    isQueryPending: isQueryPending.value,
    isDataFetched: isDataFetched.value,
    fetchedProduct: fetchedProduct.value,
    fetchData,
    uploadData,
    deleteData,
  }))
}
