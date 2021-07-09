import IProduct from '@/models/IProduct'
import isProductEquals from '@/util/isProductsEqual'

describe('isProductsEqual', () => {
  it('should detect absolutelly same products', () => {
    const product: IProduct = {
      default_locale: 'en',
      locales: ['en', 'fr', 'es'],
      product: {
        description: 'Sample description',
        images: [],
        localization: {
          fr: {
            name: '',
            description: '',
          },
          es: {
            name: '',
            description: '',
          },
        },
        name: 'Product name',
        options: [],
        variants: [],
      },
      regions: [
        { currency: 'EUR', name: 'EU' },
        { currency: 'RUB', name: 'Russia' },
      ],
    }
    expect(isProductEquals(product, product)).toBeTruthy()
  })

  it('should detect different locales', () => {
    const productA: IProduct = {
      default_locale: 'en',
      locales: ['en', 'fr', 'es'],
      product: {
        description: 'Sample description',
        images: [],
        localization: {
          fr: {
            name: '',
            description: '',
          },
          es: {
            name: '',
            description: '',
          },
        },
        name: 'Product name',
        options: [],
        variants: [],
      },
      regions: [
        { currency: 'EUR', name: 'EU' },
        { currency: 'RUB', name: 'Russia' },
      ],
    }

    const productB: IProduct = {
      default_locale: 'en',
      locales: ['en', 'fr', 'es'],
      product: {
        description: 'Sample description',
        images: [],
        localization: {
          fr: {
            name: 'Le product',
            description: 'Le description',
          },
          es: {
            name: '',
            description: '',
          },
        },
        name: 'Product name',
        options: [],
        variants: [],
      },
      regions: [
        { currency: 'EUR', name: 'EU' },
        { currency: 'RUB', name: 'Russia' },
      ],
    }

    expect(isProductEquals(productA, productB)).toBeFalsy()
  })

  it('should consider different options order', () => {
    const productA: IProduct = {
      default_locale: 'en',
      locales: ['en', 'fr', 'es'],
      product: {
        description: 'Sample description',
        images: [],
        localization: {
          fr: {
            name: '',
            description: '',
          },
          es: {
            name: '',
            description: '',
          },
        },
        name: 'Product name',
        options: ['Color', 'Size'],
        variants: [
          {
            options: ['SampleColor', 'SampleSize'],
            prices: [
              {
                price: 100,
                region: 'EU',
              },
            ],
          },
        ],
      },
      regions: [
        { currency: 'EUR', name: 'EU' },
        { currency: 'RUB', name: 'Russia' },
      ],
    }

    const productB: IProduct = {
      default_locale: 'en',
      locales: ['en', 'fr', 'es'],
      product: {
        description: 'Sample description',
        images: [],
        localization: {
          fr: {
            name: '',
            description: '',
          },
          es: {
            name: '',
            description: '',
          },
        },
        name: 'Product name',
        options: ['Size', 'Color'],
        variants: [
          {
            options: ['SampleSize', 'SampleColor'],
            prices: [
              {
                price: 100,
                region: 'EU',
              },
            ],
          },
        ],
      },
      regions: [
        { currency: 'EUR', name: 'EU' },
        { currency: 'RUB', name: 'Russia' },
      ],
    }

    expect(isProductEquals(productA, productB)).toBeTruthy()
  })

  it('should consider different variants order', () => {
    const productA: IProduct = {
      default_locale: 'en',
      locales: ['en', 'fr', 'es'],
      product: {
        description: 'Sample description',
        images: [],
        localization: {
          fr: {
            name: '',
            description: '',
          },
          es: {
            name: '',
            description: '',
          },
        },
        name: 'Product name',
        options: ['Color', 'Size'],
        variants: [
          {
            options: ['SampleColor', 'SampleSize1'],
            prices: [
              {
                price: 100,
                region: 'EU',
              },
            ],
          },
          {
            options: ['SampleColor', 'SampleSize2'],
            prices: [
              {
                price: 110,
                region: 'EU',
              },
            ],
          },
        ],
      },
      regions: [
        { currency: 'EUR', name: 'EU' },
        { currency: 'RUB', name: 'Russia' },
      ],
    }

    const productB: IProduct = {
      default_locale: 'en',
      locales: ['en', 'fr', 'es'],
      product: {
        description: 'Sample description',
        images: [],
        localization: {
          fr: {
            name: '',
            description: '',
          },
          es: {
            name: '',
            description: '',
          },
        },
        name: 'Product name',
        options: ['Color', 'Size'],
        variants: [
          {
            options: ['SampleColor', 'SampleSize2'],
            prices: [
              {
                price: 110,
                region: 'EU',
              },
            ],
          },
          {
            options: ['SampleColor', 'SampleSize1'],
            prices: [
              {
                price: 100,
                region: 'EU',
              },
            ],
          },
        ],
      },
      regions: [
        { currency: 'EUR', name: 'EU' },
        { currency: 'RUB', name: 'Russia' },
      ],
    }
  })
})
