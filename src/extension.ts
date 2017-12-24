'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

  console.log('Extension "angularjs-definition-navigation" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('extension.sayHello', async () => {
      // The code you place here will be executed every time your command is executed
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

      // Display a message box to the user
      const workspaceFiles = await vscode.workspace.findFiles("{**/*.js,**/*.ts,**/*.html}", `{${ignoreWorkspace.join(',')}}`);

      console.log('test => ', workspaceFiles);

      vscode.window.showInformationMessage('Hello World!');
  });

  let goToDefinition = vscode.commands.registerCommand('extension.goToDefinition', async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      console.log('Active editor is not found');
      return;
    }
    
    const selection = editor.selection;
    const text = editor.document.getText();
    vscode.window.showInformationMessage(`Selected text: ${text}`);
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(goToDefinition);
}

// this method is called when your extension is deactivated
export function deactivate() {
  
}