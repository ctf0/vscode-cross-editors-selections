import escapeStringRegexp from 'escape-string-regexp';
import debounce from 'lodash.debounce';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(debounce((e: vscode.TextEditorSelectionChangeEvent) => {
            const { textEditor, selections, kind } = e;

            if (kind == vscode.TextEditorSelectionChangeKind.Command) {
                return;
            }

            const nonEmptySelections = selections.filter((selection: vscode.Selection) => !selection.isEmpty);

            if (nonEmptySelections.length) {
                const otherEditors = vscode.window.visibleTextEditors.filter((editor: vscode.TextEditor) => editor !== textEditor);

                if (otherEditors.length) {
                    const toFind = nonEmptySelections
                        .map((selection: vscode.Selection) => escapeStringRegexp(textEditor.document.getText(selection)))
                        .join('|');

                    const regex = new RegExp(`${toFind}`, 'g');

                    otherEditors.map((editor: vscode.TextEditor) => {
                        const { document } = editor;
                        const txt = document.getText();
                        const selections: vscode.Selection[] = [];

                        for (const match of txt.matchAll(regex)) {
                            const range = new vscode.Range(
                                // @ts-ignore
                                document.positionAt(match.index),
                                // @ts-ignore
                                document.positionAt(match.index + match[0].length),
                            );

                            selections.push(new vscode.Selection(range.start, range.end));
                        }

                        editor.selections = selections;
                    });
                }
            }
        }, 200)),
    );
}

export function deactivate() { }
