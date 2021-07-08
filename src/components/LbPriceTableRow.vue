<template>
  <tr class="lb-price-table-row" v-if="!isCollapsed" @change.stop>
    <th class="lb-price-table-row__heading" :style="headingStyle" @click="isCollapsedLocal = !isCollapsedLocal">
      <img
        class="lb-price-table-row__expand"
        src="@/assets/img/expand.svg"
        alt="expand"
        v-if="actualNested.length"
        :style="imageStyle"
      />
      {{ headingName }}
    </th>
    <td v-for="(column, index) in data" :key="index">
      <input
        :class="['lb-price-table-row__input', { 'lb-price-table-row__input_dim': isInherited(index) }]"
        type="number"
        v-show="!showMixed(column, index)"
        :value="getValue(column)"
        :ref="'input' + index"
        :disabled="disabled"
        @blur="focused[index] = false"
        @input="onInput(index, $event.target.value)"
      />
      <input
        class="lb-price-table-row__input"
        type="text"
        v-show="showMixed(column, index)"
        :value="getMixedValue(column)"
        :disabled="disabled"
        @focus="onMixedClick($refs['input' + index], index)"
      />
    </td>
  </tr>
  <LbPriceTableRow
    v-for="row in actualNested"
    v-bind="row"
    :key="row.heading"
    :isCollapsed="isCollapsed || isCollapsedLocal"
    :columnCount="columnCount"
    :nestingLevel="nestingLevel + 1"
    :parentData="data"
    @change="onNestedRowChange(row.heading, $event)"
  ></LbPriceTableRow>
</template>

<script lang="ts">
import { computed, ref, nextTick, defineComponent, PropType } from 'vue'
import INestedRow from '@/models/INestedRow'

export default defineComponent({
  props: {
    heading: {
      type: [String, Array] as PropType<string>,
      required: true,
    },
    columnCount: {
      type: Number,
      required: true,
    },
    data: {
      type: Array as PropType<({ min: number; max: number } | number | null)[]>,
      required: true,
    },
    parentData: {
      type: Array as PropType<(number | null)[]>,
    },
    nested: {
      type: Array as PropType<INestedRow[]>,
      default: () => [],
    },
    nestingLevel: {
      type: Number,
      default: () => 0,
    },
    isCollapsed: Boolean,
    disabled: Boolean,
  },
  emits: ['change'],
  setup(props, { emit }) {
    const headingStyle = computed(() => {
      const { nestingLevel } = props
      return {
        paddingLeft: (nestingLevel + 1) * 15 + 'px',
      }
    })

    const onInput = function(index: number, value: number | string) {
      if (typeof value == 'string') value = Number(value)
      emit('change', { path: [], index, value })
    }

    const onNestedRowChange = function(name: string, event: { path: string[]; index: number; value: number }): void {
      const newPath = [...actualPath.value, name, ...event.path]
      emit('change', { path: newPath, index: event.index, value: event.value })
    }

    const showMixed = function(value: { min: number; max: number } | number | null, index: number) {
      return typeof value == 'object' && value !== null && !focused.value[index]
    }

    const onMixedClick = function(ref: any, index: number) {
      focused.value[index] = true
      nextTick(() => {
        ref.focus()
      })
    }

    const focused = ref(Array(props.columnCount).fill(false))

    const getValue = function(value: { min: number; max: number } | number | null) {
      if (typeof value == 'number') return value
      return ''
    }

    const getMixedValue = function(value: { min: number; max: number } | number | null) {
      if (typeof value == 'number' || value === null) return ''
      return `${value.min} - ${value.max}`
    }

    const isCollapsedLocal = ref(false)

    const imageStyle = computed(() => {
      if (isCollapsedLocal.value) {
        return {
          transform: 'rotate(-90deg)',
        }
      }
      return {
        transform: 'none',
      }
    })

    const isInherited = function(index: number) {
      const { data, parentData } = props
      if (typeof data[index] != 'number') return false
      return data[index] === parentData?.[index]
    }

    const actualPath = computed(() => {
      const { nested } = props
      const result: string[] = []
      let currentNested = nested
      while (currentNested.length == 1) {
        result.push(currentNested[0].heading)
        const nextNested = currentNested[0].nested
        if (nextNested) currentNested = nextNested
        else break
      }
      return result
    })

    const headingName = computed(() => {
      const { heading } = props

      if (!actualPath.value.length) return heading
      if (props.nestingLevel == 0) return `${heading} - ${actualPath.value.join(' ')}`
      else return `${heading} ${actualPath.value.join(' ')}`
    })

    const actualNested = computed(() => {
      const { nested } = props
      if (nested.length == 1) {
        let result = nested[0].nested
        while (result && result?.length == 1) {
          result = result[0].nested
        }
        return result ?? []
      }
      return nested
    })

    const isRootHidden = computed(() => {
      return props.nested.length == 1
    })

    return {
      headingStyle,
      onInput,
      onNestedRowChange,
      showMixed,
      focused,
      onMixedClick,
      getValue,
      getMixedValue,
      isCollapsedLocal,
      imageStyle,
      isInherited,
      headingName,
      actualNested,
      isRootHidden,
    }
  },
})
</script>

<style lang="scss" scoped>
@import '@/css/variables.scss';

.lb-price-table-row {
  height: 30px;
  transition: height 0.2s;

  &__heading {
    vertical-align: top;
    text-align: left;
    font-weight: 400;
    padding-right: 12px !important;
  }

  &__input {
    height: 30px;
    padding: 0 8px 0 12px;
    background: transparent;
    border: none;
    outline: none;
    width: 100px;
    color: $text-gray;

    &_dim {
      color: #bbbbbb;
    }
  }

  &__expand {
    width: 11px;
    height: 11px;
  }

  &:first-child {
    th {
      border-top-left-radius: $radius-tiny;
    }

    td:last-child {
      border-top-right-radius: $radius-tiny;
    }

    td,
    th {
      background: white;
      padding: 0;

      border-top: solid #b3b3b3 1px;
    }
  }

  &:last-child {
    th {
      border-bottom-left-radius: $radius-tiny;
    }

    td:last-child {
      border-bottom-right-radius: $radius-tiny;
    }

    td,
    th {
      border-bottom: solid #b3b3b3 1px;
    }
  }

  td,
  th {
    background: white;
    padding: 0;
    border-left: solid #d9d9d9 1px;
    border-top: solid #d9d9d9 1px;
  }
  th {
    border-left: solid #b3b3b3 1px;
  }

  td:last-child {
    border-top-right-radius: $radius-tiny;
    border-right: 1px solid #b3b3b3;
  }
}
</style>
