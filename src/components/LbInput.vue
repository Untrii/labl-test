<template>
  <div class="lb-input">
    <label class="lb-input__label" :for="id" v-if="label">{{ label }}</label>
    <input
      class="lb-input__input"
      :id="id"
      :type="type"
      :value="actualValue"
      :maxlength="maxLength"
      :placeholder="placeholder"
      :disabled="disabled"
      @input.stop="onInput"
      v-if="!multiline"
    />
    <textarea
      class="lb-input__input lb-input__input_multiline"
      :id="id"
      :value="actualValue"
      :maxlength="maxLength"
      :placeholder="placeholder"
      :disabled="disabled"
      @input.stop="onInput"
      v-else
    ></textarea>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'LbInput',
  props: {
    id: {
      type: String,
      default: () => 'lb-input' + Math.floor(Math.random() * 1e9),
    },
    type: {
      type: String,
      default: () => 'text',
    },
    label: String,
    multiline: Boolean,
    modelValue: [String, Number],
    value: {
      type: [String, Number],
      default: () => '',
    },
    maxLength: Number,
    placeholder: String,
    disabled: Boolean,
  },
  setup(props, { emit }) {
    const actualValue = computed(() => {
      const { modelValue, value } = props
      if (modelValue !== undefined) return modelValue
      return value
    })

    const onInput = function(event: InputEvent) {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement
      const { value } = target

      emit('input', value)
      emit('update:modelValue', value)
    }

    return { actualValue, onInput }
  },
})
</script>

<style lang="scss" scoped>
@import '@/css/variables.scss';
.lb-input {
  &__label {
    margin-left: 7px;
    margin-bottom: 4px;
    display: block;
    color: $text-gray;
  }

  &__input {
    height: 40px;
    box-sizing: border-box;
    padding: 4px 13px;
    border-radius: $radius-tiny;
    box-shadow: $shadow-small;
    border: $input-border;
    width: 100%;

    transition: border 0.2s, box-shadow 0.3s;

    &_multiline {
      height: 207px;
      line-height: 1.875rem;
      resize: none;
    }

    &:focus {
      outline: none;
      box-shadow: $shadow-focus;
      border: 1px solid $blue;
    }
  }
}
</style>
