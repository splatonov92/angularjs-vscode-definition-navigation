'use strict';

import * as vscode from 'vscode';
import { ETIME } from 'constants';
import { workspace } from 'vscode';

const ignore = [
  'build/**/*',
  'out/**/*',
  'dist/**/*',
  'typings',
  'out',
  '.vscode',
  '.history'
];

const ignoreWorkspace = [
  ...ignore,
  'node_modules/**/*',
  'bower_components/**/*'
];

const extensions = "{**/*.js,**/*.ts}";
const ignoreWorkspaceList = ignoreWorkspace.join(',');

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); }); 
} 

function 

export function activate(context: vscode.ExtensionContext) {

  console.log('Extension "angularjs-definition-navigation" is now active!');

  let goToDefinition = vscode.commands.registerCommand('extension.goToDefinition', async () => {

    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      console.log('Active editor is not found');
      return;
    }
    
    const selection = editor.selection;
    const text = toCamelCase(editor.document.getText(selection));
    const workspaceFiles = await vscode.workspace.findFiles(extensions, `{${ignoreWorkspaceList}}`);

    workspaceFiles.forEach(async file => {
      
      const fileName = file.fsPath;
      console.log('process filename', fileName);
      const document = await vscode.workspace.openTextDocument(file);
      const content = document.getText();

      if (content.indexOf(text) >= 0) {
        const directiveFile = file;
        console.log('find', text, 'in', fileName);
      
        if (null != directiveFile) {
      
          console.log('open file', directiveFile)
          vscode.window.showTextDocument(directiveFile);
        }
      }
    });


    vscode.window.showInformationMessage(`Selected text: ${text}`);
  });

  context.subscriptions.push(goToDefinition);
}

// this method is called when your extension is deactivated
export function deactivate() {
  
}