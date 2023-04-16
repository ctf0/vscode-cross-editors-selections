import escapeStringRegexp from 'escape-string-regexp';
import debounce from 'lodash.debounce';
import * as vscode from 'vscode';
import * as util from './util';

const excludedDocs: {
    name: string
    column: number | undefined
}[] = [];

export async function activate(context: vscode.ExtensionContext) {
    util.readConfig();
    await setContext(getDisabledState(), 'cesEnabled');

    context.subscriptions.push(
        // config
        vscode.workspace.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration(util.PACKAGE_NAME)) {
                util.readConfig();
                await setContext(getDisabledState(), 'cesEnabled');
            }
        }),
        // command
        vscode.commands.registerCommand('ces.toggle', async () => await util.config.update('disable', !util.config.disable, util.config.configScope)),
        vscode.commands.registerCommand('ces.toggleForCurrentFile', () => {
            const editor = vscode.window.activeTextEditor;

            if (editor) {
                const item = getItem(editor);

                if (docIsExcluded(item)) {
                    return removeExcludedDoc(item);
                }

                excludedDocs.push(item);
            }
        }),
        // event
        vscode.window.onDidChangeTextEditorSelection(debounce((e: vscode.TextEditorSelectionChangeEvent) => {
            if (util.config.disable) {
                return;
            }

            const { textEditor, selections, kind } = e;

            // dont go back & forth between editors
            if (kind == vscode.TextEditorSelectionChangeKind.Command) {
                return;
            }

            // only when we have something selected
            const nonEmptySelections = selections.filter((selection: vscode.Selection) => !selection.isEmpty);

            if (nonEmptySelections.length) {
                const otherEditors = vscode.window.visibleTextEditors
                    // remove self
                    .filter((editor: vscode.TextEditor) => editor !== textEditor)
                    // remove excluded
                    .filter((editor: vscode.TextEditor) => !docIsExcluded(getItem(editor)));

                if (otherEditors.length) {
                    // text to select
                    const toFind = nonEmptySelections
                        .map((selection: vscode.Selection) => escapeStringRegexp(textEditor.document.getText(selection)))
                        .join('|');

                    const regex = new RegExp(`${toFind}`, 'g');

                    // make selection
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

function setContext(val, key) {
    return vscode.commands.executeCommand('setContext', key, val);
}

function getDisabledState() {
    let val = true;

    if (util.config.disable) {
        val = false;
    }

    return val;
}

function docIsExcluded(item): boolean {
    return excludedDocs.some(({ column, name }) => name == item.name && column == item.column);
}

function removeExcludedDoc(item) {
    return excludedDocs.splice(excludedDocs.indexOf(item), 1);
}

function getItem(editor) {
    const { viewColumn, document } = editor;
    const { fileName } = document;

    return {
        name   : fileName,
        column : viewColumn,
    };
}

export function deactivate() { }
