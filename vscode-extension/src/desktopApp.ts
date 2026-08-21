import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const focusScript = String.raw`
$process = Get-Process -Name 'cc-router' -ErrorAction SilentlyContinue |
  Where-Object { $_.MainWindowHandle -ne 0 } |
  Select-Object -First 1
if (-not $process) { exit 2 }
$shell = New-Object -ComObject WScript.Shell
[void]$shell.AppActivate($process.Id)
Write-Output 'focused'
`

const stopScript = String.raw`
$processes = Get-Process -Name 'cc-router' -ErrorAction SilentlyContinue
if (-not $processes) { exit 0 }
$processes | Stop-Process -Force -ErrorAction Stop
`

const registryScript = String.raw`
$roots = @(
  'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall',
  'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall',
  'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall'
)
foreach ($root in $roots) {
  if (-not (Test-Path -LiteralPath $root)) { continue }
  foreach ($key in Get-ChildItem -LiteralPath $root -ErrorAction SilentlyContinue) {
    $item = Get-ItemProperty -LiteralPath $key.PSPath -ErrorAction SilentlyContinue
    if ($item.DisplayName -notlike 'CC Router*') { continue }
    $icon = [string]$item.DisplayIcon
    if ($icon) {
      $icon = $icon.Trim('"').Split(',')[0]
      if (Test-Path -LiteralPath $icon -PathType Leaf) { Write-Output $icon; exit 0 }
    }
    $location = [string]$item.InstallLocation
    if (-not $location) { continue }
    foreach ($name in @('CC Router.exe', 'cc-router.exe')) {
      $candidate = Join-Path $location $name
      if (Test-Path -LiteralPath $candidate -PathType Leaf) { Write-Output $candidate; exit 0 }
    }
  }
}
exit 2
`

export async function focusRunningDesktop(): Promise<boolean> {
  try {
    const { stdout } = await runPowerShell(focusScript)
    return stdout.trim() === 'focused'
  } catch {
    return false
  }
}

export async function stopRunningDesktop(): Promise<void> {
  await runPowerShell(stopScript)
}

export async function findDesktopExecutable(configuredPath: string): Promise<string | undefined> {
  const candidates = [
    configuredPath,
    join(process.env.LOCALAPPDATA || '', 'CC Router', 'CC Router.exe'),
    join(process.env.LOCALAPPDATA || '', 'CC Router', 'cc-router.exe'),
    join(process.env.LOCALAPPDATA || '', 'Programs', 'CC Router', 'CC Router.exe'),
    join(process.env.LOCALAPPDATA || '', 'Programs', 'CC Router', 'cc-router.exe'),
    join(process.env.ProgramFiles || '', 'CC Router', 'CC Router.exe'),
    join(process.env.ProgramFiles || '', 'CC Router', 'cc-router.exe'),
  ].filter(Boolean)
  const direct = candidates.find((candidate) => existsSync(candidate))
  if (direct) return direct

  try {
    const { stdout } = await runPowerShell(registryScript)
    const registered = stdout.trim()
    return registered && existsSync(registered) ? registered : undefined
  } catch {
    return undefined
  }
}

export async function installDesktop(installerPath: string): Promise<void> {
  if (!existsSync(installerPath)) {
    throw new Error(`Bundled CC Router installer was not found: ${installerPath}`)
  }
  try {
    const installDirectory = join(process.env.LOCALAPPDATA || '', 'Programs', 'CC Router')
    await execFileAsync(installerPath, ['/S', `/D=${installDirectory}`], {
      windowsHide: true,
      encoding: 'utf8',
      timeout: 120_000,
    })
  } catch (error) {
    const detail = error as Error & { stderr?: string }
    throw new Error(detail.stderr?.trim() || detail.message)
  }
}

function runPowerShell(script: string) {
  return execFileAsync(
    'powershell.exe',
    ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', script],
    { windowsHide: true, encoding: 'utf8', timeout: 5_000 },
  )
}
