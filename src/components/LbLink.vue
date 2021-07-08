<template>
  <RouterLink class="lb-link" :to="to">
    <img class="lb-link__icon" :src="icon" alt="icon" v-if="icon" />
    <slot></slot>
  </RouterLink>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LbLink',
  props: {
    to: String,
    icon: String,
  },
})
</script>

<style lang="scss" scoped>
@import '@/css/variables.scss';

.lb-link {
  display: flex;
  color: $text-gray;
  align-items: center;
  width: fit-content;

  &__icon {
    margin-right: 5px;
  }
}
</style>
