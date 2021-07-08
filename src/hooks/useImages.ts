import { computed } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'

export default function useImages() {
  const store = useStore(key)
  const addImage = function(image: File) {
    store.commit('addImage', image)
  }

  return computed(() => {
    const images = [...store.state.product.images].sort((a, b) => a.order - b.order).map((image) => image.url)

    return {
      value: images,
      add: addImage,
    }
  })
}
