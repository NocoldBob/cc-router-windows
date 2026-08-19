import { describe, expect, it } from 'vitest'
import { defaultProviders, providerMatchesDefaultTemplate } from './defaultProviders'

describe('built-in Provider template metadata', () => {
  it('only treats unchanged built-in route values as verified', () => {
    expect(providerMatchesDefaultTemplate(defaultProviders[0])).toBe(true)
    expect(
      providerMatchesDefaultTemplate({
        ...defaultProviders[0],
        mainModel: 'locally-edited-model',
      }),
    ).toBe(false)
    expect(
      providerMatchesDefaultTemplate({
        ...defaultProviders[0],
        id: 'custom-provider',
      }),
    ).toBe(false)
  })
})
