import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const tauriConfig = JSON.parse(await readFile(resolve(root, 'src-tauri', 'tauri.conf.json'), 'utf8'))
const helperSource = resolve(root, 'src-tauri', 'target', 'release', 'cc-router-helper.exe')
const helperDestination = resolve(root, 'vscode-extension', 'bin', 'cc-router-helper.exe')
const installerSource = resolve(
  root,
  'src-tauri',
  'target',
  'release',
  'bundle',
  'nsis',
  `CC Router_${tauriConfig.version}_x64-setup.exe`,
)
const installerDestination = resolve(
  root,
  'vscode-extension',
  'desktop',
  'cc-router-desktop-setup.exe',
)

await mkdir(dirname(helperDestination), { recursive: true })
await mkdir(dirname(installerDestination), { recursive: true })
await copyFile(helperSource, helperDestination)
await copyFile(installerSource, installerDestination)
