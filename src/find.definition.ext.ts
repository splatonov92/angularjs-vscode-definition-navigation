import * as vscode from 'vscode';
import { ignoreWorkspace } from './config';
import { toSnakeCase } from './utils';
import { DirectiveFile } from './types';

const extensions = "{**/*.js,**/*.ts}";
const ignoreWorkspaceList = ignoreWorkspace.join(',');
const DIRECTIVE_REGEX = /directive\(["']([a-zA-Z]*)["']/;
const COMPONENT_REGEX = /component\(["']([a-zA-Z]*)["']/;

let filesCache: Array<DirectiveFile> = [];

function checkTypeAndCache(file: vscode.Uri, regex: RegExp, matches: RegExpMatchArray) {
  if (matches != null) {
    for (const key of matches) {
      const match = key.match(regex);
      filesCache.push({ name: toSnakeCase(match[1]), file });
    }
  }
}

function checkAndCacheLine(regex, line, lineNumber, file) {
  const match = line.match(regex)
  if (match)
    filesCache.push({ name: toSnakeCase(match[1]), file, lineNumber });
}

async function findDefinitionInFileAndCache(file: vscode.Uri) {

  const document = await vscode.workspace.openTextDocument(file);
  const lineCount = document.lineCount;

  for (let i = 0; i < lineCount; i++) {

    const line = document.lineAt(i).text;
    checkAndCacheLine(DIRECTIVE_REGEX, line, i, file);
    checkAndCacheLine(COMPONENT_REGEX, line, i, file);
  }
}

export async function analyseAndCacheFiles() {

  const workspaceFiles = await vscode.workspace.findFiles(extensions, `{${ignoreWorkspaceList}}`);
  workspaceFiles.forEach(findDefinitionInFileAndCache);
}

function setCursorToLine(editor: vscode.TextEditor, lineNumber: number) {

  let range = editor.document.lineAt(lineNumber).range;
  editor.selection = new vscode.Selection(range.start, range.end);
  editor.revealRange(range);
}

export async function findDefinitionExt() {

  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    console.log('Active editor is not found');
    return;
  }

  const selection = editor.selection;
  const text = editor.document.getText(selection);
  const workspaceFiles = await vscode.workspace.findFiles(extensions, `{${ignoreWorkspaceList}}`);
  const file = filesCache.find(f => f.name.indexOf(text) >= 0);

  if (file != null) {

    await vscode.window.showTextDocument(file.file);
    setCursorToLine(vscode.window.activeTextEditor, file.lineNumber);
  }

  vscode.window.showInformationMessage(`Selected text: ${text}`);
}
