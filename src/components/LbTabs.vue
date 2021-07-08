<template>
  <ul class="lb-tabs">
    <li
      :class="['lb-tabs__item', { 'lb-tabs__item_selected': tab.value == selected }]"
      v-for="tab in tabs"
      :key="tab.value"
    >
      <a href="#" @click.prevent="$emit('change', tab)"> {{ tab.name }}</a>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'LbTabs',
  props: {
    tabs: {
      type: Array as PropType<{ name: string; value: string }[]>,
      default: () => [],
    },
    selected: {
      type: String,
    },
  },
  setup() {},
})
</script>

<style lang="scss" scoped>
@import '@/css/variables.scss';
.lb-tabs {
  display: flex;
  padding: 0;
  margin: 0;

  &__item {
    list-style-type: none;
    margin-left: 6px;
    a {
      color: $text-lightgray;
    }

    &_selected > a {
      color: $text-main;
      text-decoration: none;
    }
  }
}
</style>
