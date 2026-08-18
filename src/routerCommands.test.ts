import { describe, expect, it } from 'vitest'
import { defaultProviders } from './defaultProviders'
import {
  generateClearCommands,
  generatePersistentCommands,
  generateSessionCommands,
  generateSettingsSnippet,
  generateStatusCommands,
} from './routerCommands'

describe('route command generation', () => {
  it('generates the expected DeepSeek current-session route', () => {
    const output = generateSessionCommands(defaultProviders[0])

    expect(output).toContain(
      "$env:ANTHROPIC_BASE_URL='https://api.deepseek.com/anthropic'",
    )
    expect(output).toContain('$env:ANTHROPIC_AUTH_TOKEN=$env:DEEPSEEK_API_KEY')
    expect(output).toContain("$env:ANTHROPIC_MODEL='deepseek-v4-pro[1m]'")
    expect(output.endsWith('claude')).toBe(true)
  })

  it('references the user key without embedding it by default', () => {
    const output = generatePersistentCommands(defaultProviders[1])

    expect(output).toContain("GetEnvironmentVariable('KIMI_API_KEY', 'User')")
    expect(output).toContain("SetEnvironmentVariable('ANTHROPIC_AUTH_TOKEN', $ccRouterToken, 'User')")
  })

  it('returns parseable settings JSON without inventing key interpolation', () => {
    const output = generateSettingsSnippet(defaultProviders[2])
    const parsed = JSON.parse(output)

    expect(parsed.env.ANTHROPIC_BASE_URL).toBe('https://api.kimi.com/coding/')
    expect(parsed.env.ANTHROPIC_AUTH_TOKEN).toBeUndefined()
    expect(parsed.env.ANTHROPIC_DEFAULT_HAIKU_MODEL).toBe('k3-256k')
    expect(parsed.env.CLAUDE_CODE_AUTO_COMPACT_WINDOW).toBe('1048576')
    expect(parsed.env.CLAUDE_CODE_MAX_CONTEXT_TOKENS).toBe('1048576')
    expect(parsed.env.ANTHROPIC_DEFAULT_FABLE_MODEL).toBe('k3[1m]')
  })

  it('clears both session and optional persistent route variables', () => {
    const output = generateClearCommands()

    expect(output).toContain('Remove-Item Env:ANTHROPIC_BASE_URL')
    expect(output).toContain(
      "[Environment]::SetEnvironmentVariable('ANTHROPIC_MODEL', $null, 'User')",
    )
    expect(output).toContain('Remove-Item Env:CLAUDE_CODE_MAX_CONTEXT_TOKENS')
    expect(output).toContain(
      "[Environment]::SetEnvironmentVariable('CLAUDE_CODE_EFFORT_LEVEL', $null, 'User')",
    )
  })

  it('checks route state without printing the token', () => {
    const output = generateStatusCommands()

    expect(output).toContain('AuthTokenSet')
    expect(output).not.toContain('AuthToken =')
  })
})
