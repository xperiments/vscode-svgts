'use strict';

import * as vscode from 'vscode';
import { ExtensionContext, TextDocument, Uri, WebviewPanel } from 'vscode';
import path = require('path');
import fs = require('fs');

const indexHtmlFile = fs.readFileSync(__dirname + '/index.html', 'utf8');

function showPreview(context: ExtensionContext, uri: Uri): WebviewPanel {
  const configContents = fs.readFileSync(uri.fsPath, 'utf8');
  const basename = path.basename(uri.fsPath);
  const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : 1;
  const panel = vscode.window.createWebviewPanel(
    uri.fsPath, // treated as identity
    basename,
    column,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: getLocalResourceRoots(context, uri)
    }
  );

  panel.webview.html = indexHtmlFile.replace('__icons__', configContents);
  // Handle messages from the webview
  panel.webview.onDidReceiveMessage(
    message => {
      switch (message.command) {
        case 'alert':
          vscode.window.showInformationMessage(message.text);
          return;
        case 'updateExports':
          const exportClasses = message.exports;
          const assets = message.assets;

          const assetsTs = `import {\n${exportClasses.join(',\n  ')}
} from '../assets';

export const assetsMap = { ${exportClasses
            .map(asset => {
              return `[${asset}.name]: ${asset}`;
            })
            .join(',\n  ')}
};
`;

          // update assets index
          fs.writeFileSync(path.dirname(uri.fsPath) + '/components/assets.ts', assetsTs, 'utf8');

          const currentConfig = JSON.parse(configContents);
          currentConfig.exports = assets;
          fs.writeFileSync(uri.fsPath, JSON.stringify(currentConfig, null, 2), 'utf8');
          return;
      }
    },
    undefined,
    context.subscriptions
  );
  return panel;
}

function getLocalResourceRoots(context: ExtensionContext, resource: vscode.Uri): vscode.Uri[] {
  const baseRoots = [vscode.Uri.file(context.extensionPath)];
  const folder = vscode.workspace.getWorkspaceFolder(resource);
  if (folder) {
    return baseRoots.concat(folder.uri);
  }

  if (!resource.scheme || resource.scheme === 'file') {
    return baseRoots.concat(vscode.Uri.file(path.dirname(resource.fsPath)));
  }

  return baseRoots;
}

export function activate(context: ExtensionContext) {
  const openedPanels: WebviewPanel[] = [];

  const revealIfAlreadyOpened = (uri: Uri): boolean => {
    const opened = openedPanels.find(panel => panel.viewType === uri.fsPath);
    if (!opened) {
      return false;
    }
    opened.reveal(opened.viewColumn);
    return true;
  };

  const registerPanel = (panel: WebviewPanel): void => {
    panel.onDidDispose(() => {
      openedPanels.splice(openedPanels.indexOf(panel), 1);
    });
    openedPanels.push(panel);
  };

  const previewAndCloseSrcDoc = async (document: TextDocument): Promise<void> => {
    if (document.uri.toString().indexOf('.svgts') !== -1) {
      vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      setTimeout(() => {
        if (!revealIfAlreadyOpened(document.uri)) {
          registerPanel(showPreview(context, document.uri));
        }
      }, 0);
    }
  };

  const openedEvent = vscode.workspace.onDidOpenTextDocument((document: TextDocument) => {
    previewAndCloseSrcDoc(document);
  });

  const previewCmd = vscode.commands.registerCommand('extension.svgts-preview', (uri: Uri) => {
    if (!revealIfAlreadyOpened(uri)) {
      registerPanel(showPreview(context, uri));
    }
  });

  const svg2tsModuleCmd = vscode.commands.registerCommand('extension.svgts-generate-from-dir', (source: Uri) => {
    vscode.window
      .showInputBox({ prompt: 'svgts module name', value: 'code-svgts' })
      .then((moduleName: string | undefined) => {
        const { exec } = require('child_process');
        exec(
          `cd ${source.fsPath} && svg2ts -i ./ -o ./../ᗢ-${path.basename(source.path)} -b angular -m ${moduleName}`,
          (err, stdout, stderr) => {
            if (err) {
              vscode.window.showErrorMessage('vscode-svgts: Something was wrong while converting');
              return;
            }
            vscode.window.showInformationMessage(`vscode-svgts: Succesfull generated svgts ${moduleName} module`);
          }
        );
      });
  });

  // If pdf file is already opened when load workspace.
  if (vscode.window.activeTextEditor) {
    previewAndCloseSrcDoc(vscode.window.activeTextEditor.document);
  }

  context.subscriptions.push(openedEvent, previewCmd, svg2tsModuleCmd);
}

export function deactivate() {
  console.log('vscode-svgts deactivated');
}
