import * as vscode from 'vscode';
import { FindDefinitionExt } from './find.definition.ext';

export async function activate(context: vscode.ExtensionContext) {

  const extension = new FindDefinitionExt();
  extension.showOutputMessage();
  extension.analyseAndCacheFiles();

  vscode.workspace.onDidChangeConfiguration(() => {
    let disposeStatus = extension.showStatusMessage('FindDefinition: Reloading config.');
    extension.loadConfig();
    extension.analyseAndCacheFiles();
    disposeStatus.dispose();
  });

  vscode.commands.registerCommand('extension.findDefinition', () => {
    extension.findDefinition()
  });

  vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
    extension.analyzeAndCacheFile(document);
  });
}

// this method is called when your extension is deactivated
export function deactivate() {

}
