import * as vscode from 'vscode';
import { analyseAndCacheFiles, findDefinition } from './find.definition.ext';

export async function activate(context: vscode.ExtensionContext) {

  analyseAndCacheFiles();

  context.subscriptions
    .push(vscode.commands.registerCommand('extension.findDefinition', findDefinition));
}

// this method is called when your extension is deactivated
export function deactivate() {

}
