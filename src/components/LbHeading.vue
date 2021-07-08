<script lang="ts">
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'LbHeader',
  props: {
    level: {
      type: Number,
      required: true,
    },
  },
  setup({ level }, { slots }) {
    return () => h('h' + level, { class: 'lb-heading' }, slots)
  },
})
</script>

<style lang="scss" scoped>
h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
}

h1 {
  font-size: 3rem;
  line-height: 3rem;
  font-weight: 700;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
}
</style>
