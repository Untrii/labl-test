<template>
  <div v-show="api.isDataFetched" :class="['product', { product_blocked: api.isQueryPending }]">
    <header class="product__header">
      <div class="product__header-left">
        <LbHeading class="product__heading" :level="1">{{ locales.defaultProductName }}</LbHeading>
        <LbLink class="product__back" to="/" :icon="require('@/assets/img/arrow-left.svg')">Back to Products</LbLink>
      </div>
      <div class="product__header-right">
        <span class="product__last-update">{{ lastUpdated }} </span>
        <LbButton :disabled="!isDataChanged || api.isQueryPending" @click="api.uploadData">Publish</LbButton>
      </div>
    </header>
    <main class="product__main">
      <section class="product__basic">
        <div class="product__basic-caption">
          <LbHeading :level="2">Basics</LbHeading>
          <LbTabs :tabs="locales.model" :selected="locales.selected" @change="locales.select($event.value)" />
        </div>
        <LbInput
          class="product__input"
          label="Name"
          :value="locales.currentProductName"
          :disabled="api.isQueryPending"
          @input="locales.changeName"
        ></LbInput>
        <LbInput
          class="product__input"
          multiline
          placeholder="Product description"
          label="Name"
          :value="locales.currentDescription"
          :disabled="api.isQueryPending"
          @input="locales.changeDescription"
        ></LbInput>
      </section>
      <section class="product__images">
        <LbHeading :level="2">Images</LbHeading>
        <LbImageUpload :disabled="api.isQueryPending" :images="images.value" @upload="images.add"></LbImageUpload>
      </section>
      <section class="product__options">
        <LbHeading :level="2">Options</LbHeading>
        <LbOptionCollection
          class="product__base-options"
          :preset="options.preset"
          :selected="state.product.options"
          :disabled="api.isQueryPending"
          @select="options.selectOption"
          @delete="options.deleteOption"
          canAdd
        ></LbOptionCollection>
        <LbOptionCollection
          class="product__suboption"
          v-bind="options.subOptions[option]"
          v-for="option in options.selected"
          :key="option"
          :disabled="api.isQueryPending"
          @select="options.selectSubOption(option, $event)"
          @delete="options.deleteSubOption(option, $event)"
          canAdd
        ></LbOptionCollection>
      </section>
      <section class="product__variants" v-show="options.used.length > 1">
        <LbHeading :level="2">Variants</LbHeading>
        <LbOptionCollection
          :disabled="api.isQueryPending"
          :preset="variants.preset"
          :selected="variants.selected"
          @select="variants.selectVariant"
          @delete="variants.deleteVariant"
        ></LbOptionCollection>
      </section>
      <section class="product__pricing">
        <LbHeading :level="2">Pricing</LbHeading>
        <LbPriceTable
          class="product__price-table"
          :disabled="api.isQueryPending"
          :name="locales.defaultProductName"
          :regions="state.regions"
          :options="variants.selected"
          :data="state.product.variants"
          @change="table.update"
        ></LbPriceTable>
      </section>
      <section class="product__delete">
        <LbButton :disabled="api.isQueryPending" type="secondary" @click="api.deleteData">Delete</LbButton>
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, reactive, ref, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'

import useLocales from '@/hooks/useLocales'
import useImages from '@/hooks/useImages'
import useTable from '@/hooks/useTable'
import useAPI from '@/hooks/useAPI'
import useOptions from '@/hooks/useOptions'
import useVariants from '@/hooks/useVariants'

import LbHeading from '../components/LbHeading.vue'
import LbLink from '../components/LbLink.vue'
import LbButton from '../components/LbButton.vue'
import LbTabs from '../components/LbTabs.vue'
import LbInput from '../components/LbInput.vue'
import LbImageUpload from '../components/LbImageUpload.vue'
import LbOptionCollection from '../components/LbOptionCollection.vue'
import LbPriceTable from '../components/LbPriceTable.vue'

import isProductsEqual from '@/util/isProductsEqual'

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

    const lastUpdated = computed(() => 'Last updated 4 hours ago')
    const locales = useLocales()
    const images = useImages()
    const options = useOptions()
    const variants = useVariants(options)
    const table = useTable(computed(() => options.value.selected))
    const api = useAPI(options.value.selectOption, options.value.selectSubOption)
    const isDataChanged = computed(() => !isProductsEqual(store.state, api.value.fetchedProduct))

    //При изменении опций нужно сгенерировать новые данные таблицы
    //Например { options: ['ColorName'], ... } => { options: ['ColorName', 'XS' ], ... }
    watch([options, variants], ([newOptions, newVariants], [oldOptions]) => {
      console.log('merge')
      table.merge(newOptions.used, newVariants.selected, oldOptions.used)
    })

    return {
      state: store.state,
      commit: store.commit,
      lastUpdated,
      locales,
      images,
      options,
      variants,
      table,
      isDataChanged,
      api,
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
