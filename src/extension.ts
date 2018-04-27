import * as vscode from 'vscode';
import { analyseAndCacheFiles, findDefinitionExt } from './find.definition.ext';
import { SIGCONT } from 'constants';

export async function activate(context: vscode.ExtensionContext) {

  analyseAndCacheFiles();

  context.subscriptions
    .push(vscode.commands.registerCommand('extension.findDefinition', findDefinitionExt));
}

// this method is called when your extension is deactivated
export function deactivate() {

}
