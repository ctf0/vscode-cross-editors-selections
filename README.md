# Cross Editors Selections

based on the 2017 [issue](https://github.com/microsoft/vscode/issues/30014).

> Its different from other extensions as it doesn't have any configuration or coloring options to edit,
>
> instead it searches other <u>**visible**</u> editors using the selection you made & mirror it, no more no less.

because we update the editor selection, it means that any part of the editor being affected by the selection will update as well ex.`minimap highlight, overview ruler, status bar info, etc..`,

so no complementary extensions are required.

## How it works

- the extension will update the visibleTextEditors with the same selection & only when you have a selection, not just moving the cursor around
- if no similar selection is found in other editors, nothing is changed (as if the extension was disabled)
- if you want, you can also disable/enable the auto selection globally & for the opened file

## Notes

- for large files, make sure the editor can make selection/highlights & scroll without any lagging otherwise the extensions will take some time to do its work.
