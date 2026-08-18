import { describe, expect, it } from 'vitest'
import { defaultProviders } from './defaultProviders'
import { toNativeRoute } from './nativeRouter'

describe('native route payload', () => {
  it('contains route metadata but no credential value', () => {
    const payload = toNativeRoute(defaultProviders[0])

    expect(payload.baseUrl).toBe('https://api.deepseek.com/anthropic')
    expect(payload.authEnvName).toBe('DEEPSEEK_API_KEY')
    expect(payload.subagentModel).toBe('deepseek-v4-flash')
    expect(payload.effortLevel).toBe('max')
    expect(payload).not.toHaveProperty('authToken')
  })
})
