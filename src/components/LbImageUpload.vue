<template>
  <div class="lb-image-upload">
    <div class="lb-image-upload__preview" v-if="images.length">
      <div class="lb-image-upload__preview-item" v-for="image in imageSources" :key="image">
        <img :src="image" alt="preview image" />
        <div></div>
      </div>
    </div>
    <button
      :class="['lb-image-upload__button', { 'lb-image-upload__button_collapsed': images.length }]"
      :disabled="disabled"
      @dragover.prevent
      @drop="onDrop"
      @click="$refs.fileInput.click()"
    >
      <p class="lb-image-upload__button-text">
        Drag and drop or browse to choose a file
      </p>
      <p class="lb-image-upload__button-text lb-image-upload__button-text_size-small">
        JPEG, PNG, GIF, MP4 are allowed
      </p>
    </button>
    <input
      type="file"
      multiple="multiple"
      class="lb-image-upload__file-input"
      ref="fileInput"
      accept="image/jpeg, image/png, image/gif"
      @change="onFileInput"
    />
  </div>
</template>

<script lang="ts">
import { computed, ref, defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'LbImageUploaad',
  props: {
    images: {
      type: Array as PropType<(string | File)[]>,
      default: () => [],
    },
    disabled: Boolean,
  },
  setup(props, { emit }) {
    const cache = new Map<File, string>()

    const imageSources = computed(() => {
      const { images } = props
      return images.map((image) => {
        if (typeof image == 'string') return image
        else if (cache.has(image)) return cache.get(image)

        const url = URL.createObjectURL(image)
        cache.set(image, url)
        return url
      })
    })

    const fileInput = ref((null as any) as HTMLInputElement)

    const handleFiles = function(files?: FileList | null) {
      if (!files) return
      if (files.length == 0) return
      for (const file of files) {
        emit('upload', file)
      }
    }

    const onDrop = function(event: DragEvent) {
      event.preventDefault()
      const files = event.dataTransfer?.files
      handleFiles(files)
    }

    const onFileInput = function(event: Event) {
      const files = fileInput.value.files
      handleFiles(files)
    }

    return { imageSources, onDrop, onFileInput, fileInput }
  },
})
</script>

<style lang="scss" scoped>
@import '@/css/variables.scss';

.lb-image-upload {
  &__preview {
    margin-top: 32px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 17px 23px;

    &-item {
      position: relative;
      width: 100%;
      padding-top: 100%;
      box-shadow: $shadow-small;
      border-radius: $radius-large;
      animation: image-appear 0.4s;

      div {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;

        border-radius: $radius-large;
        box-shadow: inset 0 0 0 1px rgba($color: black, $alpha: 0.3);
      }

      img {
        position: absolute;
        top: 0;

        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: $radius-large;
      }
    }
  }

  &__button {
    height: 207px;
    width: 100%;
    transition: height 0.4s;

    background: linear-gradient(0deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.25)),
      linear-gradient(180deg, #fff1ef 0%, #feeef5 100%);
    border: 1px dashed rgba($color: black, $alpha: 0.3);
    box-sizing: border-box;
    box-shadow: $shadow-large;
    border-radius: $radius-medium;

    margin-top: 57px;

    &_collapsed {
      height: 113px;
      margin-top: 19px;
    }

    &-text {
      margin: 0;
      text-align: center;
      color: $text-darkgray;
      font-size: 1.125rem;
      &_size-small {
        font-size: 0.625rem;
        line-height: 1.5rem;
      }
    }
  }

  &__file-input {
    display: none;
  }
}

@keyframes image-appear {
  from {
    padding-top: 0%;
  }
  to {
    padding-top: 100%;
  }
}
</style>
