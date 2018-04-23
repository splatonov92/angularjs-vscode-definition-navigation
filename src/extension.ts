'use strict';

import * as vscode from 'vscode';
import { ETIME } from 'constants';
import { workspace, Uri } from 'vscode';
import { ignoreWorkspace } from './conig';

const extensions = "{**/*.js,**/*.ts}";
const ignoreWorkspaceList = ignoreWorkspace.join(',');

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); }); 
} 

function toSnakeCase(str) {
  return str.replace(/([A-Z])/g, function (g) { return '-' + g[0].toLowerCase(); }); 
}

type DirectiveFile = {
  name: string;
  file: vscode.Uri;
}

let filesCache: Array<DirectiveFile> = [];

async function analyseAndCacheFiles() {

  const workspaceFiles = await vscode.workspace.findFiles(extensions, `{${ignoreWorkspaceList}}`);

  workspaceFiles.forEach(async file => {
    const filepath = file.fsPath;
    const document = await vscode.workspace.openTextDocument(file);
    const content = document.getText();
    const directiveMatches = content.match(/directive\(["']([a-zA-Z]*)["']/g);
    const componentMatches = content.match(/component\(["']([a-zA-Z]*)["']/g);
    
    if (directiveMatches != null) {
      for (const key of directiveMatches) {
        const match = key.match(/directive\(["']([a-zA-Z]*)["']/);
        filesCache.push({ name: toSnakeCase(match[1]), file });
      }
    }
    
    if (componentMatches != null) {
      for (const key of componentMatches) {
        const match = key.match(/component\(["']([a-zA-Z]*)["']/);
        filesCache.push({ name: toSnakeCase(match[1]), file });
      }
    }
  });
}

export async function activate(context: vscode.ExtensionContext) {

  console.log('Extension "angularjs-definition-navigation" is now active!');

  await analyseAndCacheFiles();

  let goToDefinition = vscode.commands.registerCommand('extension.goToDefinition', async () => {

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
  });

  context.subscriptions.push(goToDefinition);
}

// this method is called when your extension is deactivated
export function deactivate() {
  
}