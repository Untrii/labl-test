<template>
  <div :class="['lb-button', 'lb-button_' + type, { 'lb-button_disabled': disabled }]">
    <button class="lb-button__button" :disabled="disabled">
      <slot></slot>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LbButton',
  props: {
    type: {
      type: String,
      default: () => 'primary',
      validator: (value: string) => ['primary', 'secondary'].includes(value),
    },
    disabled: Boolean,
  },
  setup() {},
})
</script>

<style lang="scss" scoped>
@import '@/css/variables.scss';

.lb-button {
  width: fit-content;
  height: 43px;
  box-sizing: border-box;
  box-shadow: inset 0px 0px 0px 1px black;
  background: $purple;
  transform: translate(-3px, 3px);

  &_secondary {
    background: rgba($color: black, $alpha: 0.15);

    box-shadow: inset 0px 0px 0px 1px rgba($color: black, $alpha: 0.33);

    .lb-button__button {
      background: #fff6f5;
    }
  }

  &__button {
    min-width: 153px;
    box-sizing: border-box;
    border: 1px solid black;
    background: linear-gradient(90deg, #f1c8c5 0%, #c6c5f1 100%);
    padding: 0 16px;
    height: 43px;
    font-size: 1.125rem;
    transform: translate(3px, -3px);
    transition: transform 0.15s;

    &:active {
      transform: none;
    }

    &:disabled {
      color: $text-main;
    }

    &:focus {
      outline: none;
    }
  }

  &_disabled {
    opacity: 0.25;
  }
}
</style>
