<template>
  <div v-show="isDataFetched" :class="['product', { product_blocked: isQueryPending }]">
    <header class="product__header">
      <div class="product__header-left">
        <LbHeading class="product__heading" :level="1">{{ defaultLocaleProductName }}</LbHeading>
        <LbLink class="product__back" to="/" :icon="require('@/assets/img/arrow-left.svg')">Back to Products</LbLink>
      </div>
      <div class="product__header-right">
        <span class="product__last-update">{{ lastUpdated }} </span>
        <LbButton :disabled="!isDataChanged || isQueryPending" @click="uploadData">Publish</LbButton>
      </div>
    </header>
    <main class="product__main">
      <section class="product__basic">
        <div class="product__basic-caption">
          <LbHeading :level="2">Basics</LbHeading>
          <LbTabs :tabs="tabs" :selected="selectedTab" @change="selectedTab = $event.value" />
        </div>
        <LbInput
          class="product__input"
          label="Name"
          :value="productName"
          :disabled="isQueryPending"
          @input="onNameChange"
        ></LbInput>
        <LbInput
          class="product__input"
          multiline
          placeholder="Product description"
          label="Name"
          :value="description"
          :disabled="isQueryPending"
          @input="onDescriptionChange"
        ></LbInput>
      </section>
      <section class="product__images">
        <LbHeading :level="2">Images</LbHeading>
        <LbImageUpload :disabled="isQueryPending" :images="images" @upload="addImage"></LbImageUpload>
      </section>
      <section class="product__options">
        <LbHeading :level="2">Options</LbHeading>
        <LbOptionCollection
          class="product__base-options"
          :preset="presetOptions"
          :selected="state.product.options"
          :disabled="isQueryPending"
          @select="onOptionSelect"
          @delete="onOptionDelete"
          canAdd
        ></LbOptionCollection>
        <LbOptionCollection
          class="product__suboption"
          v-bind="subOptions[option]"
          v-for="option in selectedOptions"
          :key="option"
          :disabled="isQueryPending"
          @select="onSubOptionSelect(option, $event)"
          @delete="onSubOptionDelete(option, $event)"
          canAdd
        ></LbOptionCollection>
      </section>
      <section class="product__variants" v-show="usedOptions.length > 1">
        <LbHeading :level="2">Variants</LbHeading>
        <LbOptionCollection
          :disabled="isQueryPending"
          :preset="presetVariants"
          :selected="selectedVariants"
          @select="onVariantSelect"
          @delete="onVariantDelete"
        ></LbOptionCollection>
      </section>
      <section class="product__pricing">
        <LbHeading :level="2">Pricing</LbHeading>
        <LbPriceTable
          class="product__price-table"
          :disabled="isQueryPending"
          :name="defaultLocaleProductName"
          :regions="state.regions"
          :options="selectedVariants"
          :data="state.product.variants"
          @change="onTableChange"
        ></LbPriceTable>
      </section>
      <section class="product__delete">
        <LbButton :disabled="isQueryPending" type="secondary" @click="deleteData">Delete</LbButton>
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, reactive, ref, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'
import router from '@/router'
import { baseApiUrl } from '@/config'

import LbHeading from '../components/LbHeading.vue'
import LbLink from '../components/LbLink.vue'
import LbButton from '../components/LbButton.vue'
import LbTabs from '../components/LbTabs.vue'
import LbInput from '../components/LbInput.vue'
import LbImageUpload from '../components/LbImageUpload.vue'
import LbOptionCollection from '../components/LbOptionCollection.vue'
import LbPriceTable from '../components/LbPriceTable.vue'

import isInArray from '@/util/isInArray'
import findIndex from '@/util/findIndex'
import containsSame from '@/util/containsSame'
import getOptionsCombinations from '@/util/getOptionsCombinations'
import isProductsEqual from '@/util/isProductsEqual'

import IProduct from '@/models/IProduct'
import IVariant from '@/models/IVariant'

export default defineComponent({
  name: 'ProductView',
  components: {
    LbHeading,
    LbLink,
    LbButton,
    LbTabs,
    LbInput,
    LbImageUpload,
    LbOptionCollection,
    LbPriceTable,
  },
  setup() {
    const store = useStore(key)
    //
    // Header
    //
    const lastUpdated = computed(() => 'Last updated 4 hours ago')

    const selectedTab = ref(store.state.default_locale)
    const tabs = computed(() =>
      store.state.locales.map((item) => ({
        name: item,
        value: item,
      }))
    )
    const productName = computed(() => store.getters.getLocale(selectedTab.value).name)
    const defaultLocaleProductName = computed(() => store.getters.getLocale().name)
    const description = computed(() => store.getters.getLocale(selectedTab.value).description)
    const onNameChange = (value: string) => store.commit('updateProductName', { locale: selectedTab.value, value })
    const onDescriptionChange = (value: string) =>
      store.commit('updateProductDescription', { locale: selectedTab.value, value })

    //
    // Images
    //
    const images = computed(() => {
      const images = [...store.state.product.images].sort((a, b) => a.order - b.order)
      return images.map((image) => image.url)
    })

    const addImage = function(image: File) {
      store.commit('addImage', image)
    }

    //
    // Options
    //
    const selectedOptions = computed(() => store.state.product.options)

    const usedOptions = computed(() => {
      return selectedOptions.value.filter((item) => subOptions[item].selected.length)
    })

    const presetOptions = ref(['Color', 'Size'])

    const removeFromArray = function(array: string[] | string[][], value: string | string[]) {
      const index = findIndex(array, value)
      if (index == -1) return
      array.splice(index, 1)
    }

    const onOptionSelect = function(name: string) {
      store.commit('addOption', name)
      if (!subOptions[name])
        subOptions[name] = {
          preset: [] as string[],
          selected: [] as string[],
          label: name,
        }
    }

    const onOptionDelete = function(name: string) {
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
    const sortSelectedSubOptions = function() {
      for (const option of selectedOptions.value) {
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

    const onSubOptionSelect = function(optionName: string, subOptionName: string) {
      const subOption = subOptions[optionName]
      const { selected } = subOption
      selected.push(subOptionName)
      sortSelectedSubOptions()
    }

    const onSubOptionDelete = function(optionName: string, subOptionName: string) {
      removeFromArray(subOptions[optionName].selected, subOptionName)
    }

    //
    // Variants
    //
    const selectedVariants = computed(() => {
      return store.state.product.variants.map((item) => item.options)
    })

    const presetVariants = computed(() => {
      const collections = [] as string[][]
      for (const option of selectedOptions.value) collections.push(subOptions[option].selected)
      return getOptionsCombinations(collections)
    })

    //Если мы убрали, например, все варианты с цветом Green, мы должны очистить соответствующую опцию
    const deleteUnusedSuboptions = function() {
      const newSubOptions = {} as Record<string, Set<string>>

      for (const variant of selectedVariants.value) {
        for (let i = 0; i < variant.length; i++) {
          const optionValue = variant[i]
          const optionName = selectedOptions.value[i]

          if (!newSubOptions[optionName]) newSubOptions[optionName] = new Set()
          newSubOptions[optionName].add(optionValue)
        }
      }
      for (const subOption in newSubOptions) {
        subOptions[subOption].selected = Array.from(newSubOptions[subOption])
      }
      sortSelectedSubOptions()
    }

    watch(presetVariants, (newPresetVariants, oldPresetVariants) => {
      if (!newPresetVariants.length && !oldPresetVariants.length) return

      for (const variant of selectedVariants.value) {
        if (!newPresetVariants.find((item) => containsSame(item, variant))) store.commit('deleteVariant', variant)
      }
      for (const variant of newPresetVariants) {
        if (!isInArray(oldPresetVariants, variant) && !isInArray(selectedVariants.value, variant))
          store.commit('addVariant', variant)
      }
      if (newPresetVariants.length == 0 && !selectedVariants.value.find((item) => item.length == 0))
        store.commit('addVariant', [])
      store.commit('sortVariants', presetVariants.value)
    })

    const onVariantSelect = function(variant: string[]) {
      store.commit('addVariant', variant)
      store.commit('sortVariants', presetVariants.value)
    }

    const onVariantDelete = function(variant: string[]) {
      store.commit('deleteVariant', variant)
      deleteUnusedSuboptions()
    }

    //
    // Table
    //

    //Хранит копию табличных данных, но в отличие от модели API может содержать не все поля
    const extendedTableData = ref(
      [] as {
        options: Record<string, string>
        values: number[]
      }[]
    )

    const getTableRecord = function(options: string[], optionNames: string[], ignoreOption?: string) {
      return extendedTableData.value.find((item) => {
        for (let i = 0; i < options.length; i++) {
          if (optionNames[i] == ignoreOption) continue
          if (item.options[optionNames[i]] != options[i]) return false
        }
        return true
      })
    }

    const addTableRecord = function(options: string[], optionNames: string[], index: number, value: number) {
      const tableRecord = getTableRecord(options, optionNames)
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
          addTableRecord(row.options, selectedOptions.value, index, item.price)
        })
      }
    }

    //При изменении опций нужно сгенерировать новые данные таблицы
    //Например { options: ['ColorName'], ... } => { options: ['ColorName', 'XS' ], ... }
    watch([usedOptions, selectedVariants], ([newUsedOptions, newSelectedVariants], [oldUsedOptions]) => {
      if (newUsedOptions.length != oldUsedOptions.length) {
        const ignoreOption = newUsedOptions.find((option) => !oldUsedOptions.includes(option))
        nextTick(() => {
          for (const selectedVariant of newSelectedVariants) {
            const tableRecord = getTableRecord(selectedVariant, newUsedOptions, ignoreOption)
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
    })

    const onTableChange = function(event: { options: string[]; index: number; value: number }) {
      store.commit('updateTable', event)
      addTableRecord(event.options, selectedOptions.value, event.index, event.value)
    }

    //
    // API
    //
    const isQueryPending = ref(false)
    const isDataFetched = ref(false)

    watch(isQueryPending, (newValue) => {
      if (!newValue) {
        //@ts-ignore
        document.activeElement?.blur?.()
      }
    })

    const fillSubOptions = function(variants: IVariant[], options: string[]) {
      for (const option of options) onOptionSelect(option)
      for (const variant of variants) {
        for (let i = 0; i < variant.options.length; i++) {
          const element = variant.options[i]
          onSubOptionSelect(options[i], element)
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

    const isDataChanged = computed(() => !isProductsEqual(store.state, fetchedProduct.value))

    return {
      state: store.state,
      commit: store.commit,
      lastUpdated,
      tabs,
      selectedTab,
      productName,
      defaultLocaleProductName,
      description,
      onNameChange,
      onDescriptionChange,
      images,
      addImage,
      presetOptions,
      selectedOptions,
      usedOptions,
      onOptionSelect,
      onOptionDelete,
      subOptions,
      onSubOptionSelect,
      onSubOptionDelete,
      selectedVariants,
      presetVariants,
      onVariantSelect,
      onVariantDelete,
      onTableChange,
      isDataChanged,
      fetchedProduct,
      isQueryPending,
      uploadData,
      deleteData,
      isDataFetched,
    }
  },
})
</script>

<style lang="scss" scoped>
@import '@/css/variables.scss';

$first-column-width: 500px;
$second-column-width: 496px;
$column-gap: 102px;

.product {
  min-height: 100vh;
  width: 100%;
  padding-left: 151px;
  padding-right: 57px;
  box-sizing: border-box;

  &_blocked {
    opacity: 0.5;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    margin-top: 47px;
    &-right {
      display: flex;
    }
  }

  &__heading {
    height: 3rem;
    overflow: hidden;
    word-break: break-word;
  }

  &__back {
    margin-top: 15px;
  }

  &__last-update {
    margin-left: 20px;
    margin-right: 55px;
    color: $text-gray;
    white-space: nowrap;
  }

  &__main {
    margin-top: 55px;
    display: grid;
    grid-template-columns: 500fr 496fr;
    grid-template-rows: repeat(3, max-content);
    gap: 59px 102px;
    max-width: $first-column-width + $column-gap + $second-column-width;
  }

  &__basic {
    max-width: $first-column-width;
    &-caption {
      display: flex;
      justify-content: space-between;
    }
  }

  &__images {
    grid-column: 2;
    grid-row: 1;
    max-width: $second-column-width;
  }

  &__input {
    margin-top: 24px;
  }

  &__options {
    margin-bottom: 21px;
    max-width: 270px;
  }

  &__base-options {
    margin-top: 16px;
    margin-bottom: 4px;
  }

  &__suboption {
    margin-top: 32px;
  }

  &__pricing {
    grid-column: 1 / 3;
  }

  &__price-table {
    margin-top: 20px;
  }

  &__delete {
    margin-top: -8px;
    margin-bottom: 507px;
  }
}
</style>
