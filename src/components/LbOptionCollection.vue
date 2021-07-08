<template>
  <div class="lb-option-collection">
    <div class="lb-option-collection__label" v-if="label">
      {{ label }}
    </div>
    <div class="lb-option-collection__items">
      <button
        :class="[
          'lb-option-collection__button',
          {
            'lb-option-collection__button_selected': button.selected,
          },
        ]"
        v-for="button in buttons"
        :key="button.name"
        :disabled="disabled"
        @click="button.selected ? null : $emit('select', button.value)"
      >
        {{ button.name
        }}<button
          class="lb-option-collection__delete"
          v-if="button.selected"
          :disabled="disabled"
          @click.stop="$emit('delete', button.value)"
        >
          <img src="@/assets/img/delete.svg" alt="delete" />
        </button>
      </button>
      <button v-if="canAdd" :disabled="disabled" class="lb-option-collection__button lb-option-collection__button_add">
        + New
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import isInArray from '@/util/isInArray'

export default defineComponent({
  name: 'LbOptionCollection',
  props: {
    preset: {
      type: Array as PropType<string[] | string[][]>,
      default: () => [],
    },
    selected: {
      type: Array as PropType<string[] | string[][]>,
      default: () => [],
    },
    canAdd: Boolean,
    label: String,
    disabled: Boolean,
  },
  setup(props) {
    const buttons = computed(() => {
      const { preset, selected } = props
      const result = []
      for (const button of preset) {
        const name = typeof button == 'string' ? button : button.join(' ')
        result.push({
          name,
          value: button,
          selected: isInArray(selected, button),
        })
      }
      for (const button of selected) {
        if (isInArray(preset, button)) continue
        const name = typeof button == 'string' ? button : button.join(' ')
        result.push({
          name,
          value: button,
          selected: true,
        })
      }
      return result
    })

    return { buttons }
  },
})
</script>

<style lang="scss" scoped>
@import '@/css/variables.scss';

.lb-option-collection {
  &__label {
    color: $text-gray;
  }

  &__items {
    min-height: 36px;
  }

  &__button {
    margin-top: 6px;
    margin-right: 8px;
    padding: 0 16px;
    border-radius: $radius-small;
    background: transparent;
    border: 1px solid $text-main;
    height: 30px;
    box-sizing: border-box;
    outline: none;

    &_selected {
      padding-right: 10px;
      background: $text-main;
      color: white;
    }

    &_add {
      padding: 0 12px;
      border: 1px dashed rgba(35, 35, 35, 0.25);
    }
  }

  &__delete {
    width: 14px;
    height: 14px;
    border-radius: 5px;
    margin-left: 8px;
    padding: 0;
    border: none;
    background: transparent;

    img {
      opacity: 0.5;
    }

    &:hover {
      background: rgba($color: white, $alpha: 0.3);
      img {
        opacity: 1;
      }
    }
  }
}
</style>
