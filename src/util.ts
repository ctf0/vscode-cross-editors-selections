import * as vscode from 'vscode';

export let config: vscode.WorkspaceConfiguration;
export const PACKAGE_NAME = 'crossEditorsSelections';

export function readConfig() {
    config = vscode.workspace.getConfiguration(PACKAGE_NAME);
}
