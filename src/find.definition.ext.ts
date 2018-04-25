import * as vscode from 'vscode';
import { ignoreWorkspace } from './config';
import { toSnakeCase } from './utils';
import { DirectiveFile } from './types';

const extensions = "{**/*.js,**/*.ts}";
const ignoreWorkspaceList = ignoreWorkspace.join(',');

let filesCache: Array<DirectiveFile> = [];

function checkTypeAndCache(file: vscode.Uri, regex: RegExp, matches: RegExpMatchArray) {
  if (matches != null) {
    for (const key of matches) {
      const match = key.match(regex);
      filesCache.push({ name: toSnakeCase(match[1]), file });
    }
  }
}

export async function analyseAndCacheFiles() {

  const workspaceFiles = await vscode.workspace.findFiles(extensions, `{${ignoreWorkspaceList}}`);

  workspaceFiles.forEach(async file => {
    const filepath = file.fsPath;
    const document = await vscode.workspace.openTextDocument(file);
    const content = document.getText();

    checkTypeAndCache(file, /directive\(["']([a-zA-Z]*)["']/, content.match(/directive\(["']([a-zA-Z]*)["']/g));
    checkTypeAndCache(file, /component\(["']([a-zA-Z]*)["']/, content.match(/component\(["']([a-zA-Z]*)["']/g));
  });
}

export async function findDefinition() {

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
    vscode.window.showTextDocument(file.file);
  }

  vscode.window.showInformationMessage(`Selected text: ${text}`);
}
