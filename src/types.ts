import * as vscode from 'vscode';

export interface IDirectiveFile {
  name: string;
  file: vscode.Uri;
  lineNumber?: number;
}

export interface IConfig {
  ignoreWorkspaceList: string
}
