import * as vscode from 'vscode'

const chinese = vscode.env.language.toLowerCase().startsWith('zh')

export function text(chineseText: string, englishText: string): string {
  return chinese ? chineseText : englishText
}
