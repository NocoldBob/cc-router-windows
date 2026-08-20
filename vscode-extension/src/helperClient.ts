import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { promisify } from 'node:util'
import * as vscode from 'vscode'

const execFileAsync = promisify(execFile)

export interface ProviderSummary {
  id: string
  displayName: string
  baseUrl: string
  mainModel: string
  enabled: boolean
  credentialConfigured: boolean
  selected: boolean
}

export function resolveHelperPath(context: vscode.ExtensionContext): string {
  const configured = vscode.workspace
    .getConfiguration('ccRouter')
    .get<string>('helperPath', '')
    .trim()
  return configured || context.asAbsolutePath('bin/cc-router-helper.exe')
}

export function helperExists(context: vscode.ExtensionContext): boolean {
  return existsSync(resolveHelperPath(context))
}

export async function listProviders(
  context: vscode.ExtensionContext,
  workspace: string,
): Promise<ProviderSummary[]> {
  const output = await runHelper(context, ['list', workspace])
  return JSON.parse(output) as ProviderSummary[]
}

export async function selectProvider(
  context: vscode.ExtensionContext,
  workspace: string,
  providerId: string,
): Promise<void> {
  await runHelper(context, ['select', workspace, providerId])
}

export async function clearProvider(
  context: vscode.ExtensionContext,
  workspace: string,
): Promise<void> {
  await runHelper(context, ['clear', workspace])
}

async function runHelper(context: vscode.ExtensionContext, args: string[]): Promise<string> {
  const helper = resolveHelperPath(context)
  if (!existsSync(helper)) {
    throw new Error(`CC Router helper was not found: ${helper}`)
  }
  try {
    const { stdout } = await execFileAsync(helper, args, {
      windowsHide: true,
      encoding: 'utf8',
      timeout: 10_000,
    })
    return stdout.trim()
  } catch (error) {
    const detail = error as Error & { stderr?: string }
    throw new Error(detail.stderr?.trim() || detail.message)
  }
}
