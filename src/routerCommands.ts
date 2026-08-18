import type { OutputMode, Provider } from './types'

const psQuote = (value: string) => `'${value.replaceAll("'", "''")}'`

export const routeVariableNames = [
  'ANTHROPIC_BASE_URL',
  'ANTHROPIC_AUTH_TOKEN',
  'ANTHROPIC_MODEL',
  'ANTHROPIC_DEFAULT_OPUS_MODEL',
  'ANTHROPIC_DEFAULT_SONNET_MODEL',
  'ANTHROPIC_DEFAULT_HAIKU_MODEL',
  'ANTHROPIC_DEFAULT_FABLE_MODEL',
  'CLAUDE_CODE_SUBAGENT_MODEL',
  'CLAUDE_CODE_EFFORT_LEVEL',
  'CLAUDE_CODE_AUTO_COMPACT_WINDOW',
  'CLAUDE_CODE_MAX_CONTEXT_TOKENS',
] as const

const effectiveModels = (provider: Provider) => ({
  opus: provider.opusModel || provider.mainModel,
  sonnet: provider.sonnetModel || provider.mainModel,
  haiku: provider.haikuModel || provider.fastModel || provider.mainModel,
  fable: provider.fableModel || provider.mainModel,
  subagent: provider.subagentModel || provider.fastModel || provider.mainModel,
})

const effectiveEnvironment = (provider: Provider): Record<string, string> => {
  const models = effectiveModels(provider)
  return {
    ANTHROPIC_BASE_URL: provider.baseUrl,
    ANTHROPIC_MODEL: provider.mainModel,
    ANTHROPIC_DEFAULT_OPUS_MODEL: models.opus,
    ANTHROPIC_DEFAULT_SONNET_MODEL: models.sonnet,
    ANTHROPIC_DEFAULT_HAIKU_MODEL: models.haiku,
    ANTHROPIC_DEFAULT_FABLE_MODEL: models.fable,
    CLAUDE_CODE_SUBAGENT_MODEL: models.subagent,
    CLAUDE_CODE_EFFORT_LEVEL: provider.effortLevel,
    CLAUDE_CODE_AUTO_COMPACT_WINDOW: provider.autoCompactWindow,
    CLAUDE_CODE_MAX_CONTEXT_TOKENS: provider.maxContextTokens,
  }
}

export function generateSessionCommands(provider: Provider): string {
  const environment = effectiveEnvironment(provider)

  return [
    ...routeVariableNames.map((name) => {
      if (name === 'ANTHROPIC_AUTH_TOKEN') {
        return `$env:ANTHROPIC_AUTH_TOKEN=$env:${provider.authEnvName}`
      }
      const value = environment[name]
      return value
        ? `$env:${name}=${psQuote(value)}`
        : `Remove-Item Env:${name} -ErrorAction SilentlyContinue`
    }),
    'claude',
  ].join('\n')
}

export function generatePersistentCommands(provider: Provider): string {
  const environment = effectiveEnvironment(provider)
  const lines = [
    `$ccRouterToken = [Environment]::GetEnvironmentVariable(${psQuote(provider.authEnvName)}, 'User')`,
    `if ([string]::IsNullOrWhiteSpace($ccRouterToken)) { throw ${psQuote(`${provider.authEnvName} is not set in User environment variables.`)} }`,
  ]

  return [
    ...lines,
    `[Environment]::SetEnvironmentVariable('ANTHROPIC_AUTH_TOKEN', $ccRouterToken, 'User')`,
    ...routeVariableNames
      .filter((name) => name !== 'ANTHROPIC_AUTH_TOKEN')
      .map((name) => {
        const value = environment[name]
        return `[Environment]::SetEnvironmentVariable('${name}', ${value ? psQuote(value) : '$null'}, 'User')`
      }),
    "Remove-Variable ccRouterToken -ErrorAction SilentlyContinue",
    "Write-Host 'Route saved. Open a new terminal, run claude, then use /status.'",
  ].join('\n')
}

export function generateSettingsSnippet(provider: Provider): string {
  const env = Object.fromEntries(
    Object.entries(effectiveEnvironment(provider)).filter(([, value]) => value),
  )

  return JSON.stringify(
    {
      $schema: 'https://json.schemastore.org/claude-code-settings.json',
      env,
    },
    null,
    2,
  )
}

export function generateClearCommands(): string {
  return [
    ...routeVariableNames.map(
      (name) => `Remove-Item Env:${name} -ErrorAction SilentlyContinue`,
    ),
    '',
    '# Optional: also clear the persistent User values',
    ...routeVariableNames.map(
      (name) => `[Environment]::SetEnvironmentVariable('${name}', $null, 'User')`,
    ),
    "Write-Host 'Claude Code route cleared.'",
  ].join('\n')
}

export function generateStatusCommands(): string {
  return [
    '[pscustomobject]@{',
    "  BaseUrl = $env:ANTHROPIC_BASE_URL",
    "  Model = $env:ANTHROPIC_MODEL",
    "  Opus = $env:ANTHROPIC_DEFAULT_OPUS_MODEL",
    "  Sonnet = $env:ANTHROPIC_DEFAULT_SONNET_MODEL",
    "  Haiku = $env:ANTHROPIC_DEFAULT_HAIKU_MODEL",
    "  Fable = $env:ANTHROPIC_DEFAULT_FABLE_MODEL",
    "  Subagent = $env:CLAUDE_CODE_SUBAGENT_MODEL",
    "  Effort = $env:CLAUDE_CODE_EFFORT_LEVEL",
    "  AutoCompactWindow = $env:CLAUDE_CODE_AUTO_COMPACT_WINDOW",
    "  MaxContextTokens = $env:CLAUDE_CODE_MAX_CONTEXT_TOKENS",
    "  AuthTokenSet = -not [string]::IsNullOrWhiteSpace($env:ANTHROPIC_AUTH_TOKEN)",
    '} | Format-List',
  ].join('\n')
}

export function generateOutput(provider: Provider, mode: OutputMode): string {
  if (mode === 'persistent') return generatePersistentCommands(provider)
  if (mode === 'settings') return generateSettingsSnippet(provider)
  if (mode === 'clear') return generateClearCommands()
  return generateSessionCommands(provider)
}
