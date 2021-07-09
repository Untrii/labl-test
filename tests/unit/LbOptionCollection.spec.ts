import { shallowMount } from '@vue/test-utils'
import LbOptionCollection from '@/components/LbOptionCollection.vue'

const wrapper = shallowMount(LbOptionCollection, {
  props: {
    preset: ['Option1', 'Option3'],
    selected: ['Option1', 'Option2', 'Option3'],
  },
})

describe('LbOptionCollection', () => {
  it('should render preset options first', () => {
    const optionButtons = wrapper.findAll('.lb-option-collection__button')
    const expectedOrder = ['Option1', 'Option3', 'Option2']
    expect(optionButtons).toHaveLength(3)
    for (let i = 0; i < expectedOrder.length; i++) {
      const option = expectedOrder[i]
      const buttonText = optionButtons[i].text()
      expect(buttonText).toContain(option)
    }
  })

  it('should not emit select event on selected option', () => {
    const selectedOption = wrapper.find('.lb-option-collection__button_selected')
    selectedOption.trigger('click')
    console.log(wrapper.emitted('select'))
    expect(wrapper.emitted('select')).toBe(undefined)
  })
})
