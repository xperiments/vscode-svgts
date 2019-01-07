'use strict';

import { commands, ExtensionContext, TextDocument, Uri, WebviewPanel, window, workspace } from 'vscode';
import { svgtsFromDirCommandMethod, svgtsPreviewDirectoryCommandMethod } from './commands';
import { openPanel, previewAndCloseSrcDoc } from './utils';

export function activate(context: ExtensionContext) {
  const openedPanels: WebviewPanel[] = [];

  const onDidOpenTextDocument = workspace.onDidOpenTextDocument((document: TextDocument) => {
    previewAndCloseSrcDoc(document, openedPanels, context);
  });

  const svgtsPreviewCommand = commands.registerCommand('extension.svgts-preview', (uri: Uri) => {
    openPanel(uri, openedPanels, context);
  });

  const svgtsFromDirCommand = commands.registerCommand('extension.svgts-generate-from-dir', svgtsFromDirCommandMethod);

  const svgtsPreviewDirectoryCommand = commands.registerCommand(
    'extension.svgts-preview-dir',
    svgtsPreviewDirectoryCommandMethod(context, openedPanels)
  );

  // If vscode-svgts file is already opened when load workspace.
  if (window.activeTextEditor) {
    previewAndCloseSrcDoc(window.activeTextEditor.document, openedPanels, context);
  }

  context.subscriptions.push(
    onDidOpenTextDocument,
    svgtsPreviewCommand,
    svgtsFromDirCommand,
    svgtsPreviewDirectoryCommand
  );
  console.log('vscode-svgts activated');
}

export function deactivate() {
  console.log('vscode-svgts deactivated');
}
