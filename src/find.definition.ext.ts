import * as vscode from 'vscode';
import { toSnakeCase } from './utils';
import { IDirectiveFile, IConfig } from './types';
import { isContext } from 'vm';

const extensions = "{**/*.js,**/*.ts}";
const DIRECTIVE_REGEX = /directive\(["']([a-zA-Z0-9]*)["']/;
const COMPONENT_REGEX = /component\(["']([a-zA-Z0-9]*)["']/;
const CONTROLLER_REGEX = /controller\(["']([a-zA-Z0-9]*)["']/;

let filesCache: Array<IDirectiveFile> = [];
let checkCached = false;

function checkTypeAndCache(file: vscode.Uri, regex: RegExp, matches: RegExpMatchArray) {
  if (matches != null) {
    for (const key of matches) {
      const match = key.match(regex);
      filesCache.push({ name: toSnakeCase(match[1]), file });
    }
  }
}

function checkAndCacheLine(regex, line, lineNumber, file, nameTransformFn: Function) {

  const match = line.match(regex)

  if (match) {
    const entity = nameTransformFn(match[1]);

    if (checkCached) {

      for (let i = 0; i < filesCache.length; i++) {
        let cachedIndex = filesCache.findIndex(({name}) => name == entity);
        if (cachedIndex >= 0) {
          filesCache.splice(cachedIndex, 1);
          i--;
        }
      }
    }

    filesCache.push({ name: entity, file, lineNumber });
  }
}

function returnInput(input) {
  return input;
}

async function findDefinitionInFileAndCache(file: vscode.Uri) {

  const document = await vscode.workspace.openTextDocument(file);
  const lineCount = document.lineCount;

  for (let i = 0; i < lineCount; i++) {

    setTimeout(() => {
      const line = document.lineAt(i).text;
      checkAndCacheLine(DIRECTIVE_REGEX, line, i, file, toSnakeCase);
      checkAndCacheLine(COMPONENT_REGEX, line, i, file, toSnakeCase);
      checkAndCacheLine(CONTROLLER_REGEX, line, i, file, returnInput);
    }, 0);
  }
}

function setCursorToLine(editor: vscode.TextEditor, lineNumber: number) {

  let range = editor.document.lineAt(lineNumber).range;
  editor.selection = new vscode.Selection(range.start, range.end);
  editor.revealRange(range);
}

function getIgnoredFileList() {
  const config = vscode.workspace.getConfiguration('angularJSfd');
  const ignoreWorkspace = config.ignoreDirs;
  return ignoreWorkspace.join(',');
}

export class FindDefinitionExt {

  private config: IConfig = { ignoreWorkspaceList: '' } ;
  private outputChannel: vscode.OutputChannel;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('Find definition');
    this.loadConfig();
  }

  public loadConfig(): void {

    const config = vscode.workspace.getConfiguration('angularJSfd');
    const ignoreWorkspace = config.ignoreDirs;
    const ignoreWorkspaceList = ignoreWorkspace.join(',');

    if (ignoreWorkspaceList != this.config.ignoreWorkspaceList) {

      this.config = {
        ignoreWorkspaceList: ignoreWorkspace.join(',')
      };

      filesCache = [];
      this.analyseAndCacheFiles();
    }
  }

  public analyzeAndCacheFile(document: vscode.TextDocument) {
    checkCached = true;
    findDefinitionInFileAndCache(document.uri);
  }

  public async findDefinition() {

    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      this.showInformationMessage('Active editor is not found');
      return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection);
    const file = filesCache.find(f => f.name.indexOf(text) >= 0);

    if (file != null) {
      await vscode.window.showTextDocument(file.file);
      setCursorToLine(vscode.window.activeTextEditor, file.lineNumber);
    }

    this.showInformationMessage(`Find definition of: ${text}`);
  }

  public async analyseAndCacheFiles() {

    const ignoreWorkspaceList = this.config.ignoreWorkspaceList;
    const workspaceFiles = await vscode.workspace.findFiles(extensions, `{${ignoreWorkspaceList}}`);
    workspaceFiles.forEach(findDefinitionInFileAndCache);
  }

  /**
   * Show message in output channel
   */
  public showOutputMessage(message?: string): void {
    this.outputChannel.appendLine(message);
  }

  /**
   * Show message in status bar and output channel.
   * Return a disposable to remove status bar message.
   */
  public showStatusMessage(message: string): vscode.Disposable {
    this.showOutputMessage(message);
    return vscode.window.setStatusBarMessage(message);
  }

  public showInformationMessage(message: string) {
    vscode.window.showInformationMessage(message);
  }
};
