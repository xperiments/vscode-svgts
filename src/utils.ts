import fs = require('fs');
import path = require('path');
import { commands, ExtensionContext, TextDocument, Uri, WebviewPanel, window, workspace } from 'vscode';
import { fileWatcher } from './file-watcher';

const indexHtmlFile = fs.readFileSync(__dirname + '/index.html', 'utf8');

export function deleteFolderRecursive(path: string | Buffer) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      const curPath = path + '/' + file;

      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

export function getLocalResourceRoots(context: ExtensionContext, resource: Uri): Uri[] {
  const baseRoots = [Uri.file(context.extensionPath)];
  const folder = workspace.getWorkspaceFolder(resource);

  if (folder) {
    return baseRoots.concat(folder.uri);
  }

  if (!resource.scheme || resource.scheme === 'file') {
    return baseRoots.concat(Uri.file(path.dirname(resource.fsPath)));
  }

  return baseRoots;
}

export function isDir(path: string | Buffer): boolean {
  return fs.lstatSync(path).isDirectory();
}

export function openPanel(uri: Uri, openedPanels: WebviewPanel[], context: ExtensionContext) {
  if (!revealIfAlreadyOpened(uri, openedPanels)) {
    registerPanel(showPreview(context, uri, openedPanels), openedPanels);
  }
}

export const previewAndCloseSrcDoc = async (
  document: TextDocument,
  openedPanels: WebviewPanel[],
  context: ExtensionContext
): Promise<void> => {
  if (document.uri.toString().indexOf('.svgts') !== -1) {
    commands.executeCommand('workbench.action.closeActiveEditor');
    setTimeout(() => {
      openPanel(document.uri, openedPanels, context);
    }, 300);
  }
};

export function revealIfAlreadyOpened(uri: Uri, openedPanels: WebviewPanel[]): boolean {
  const opened = openedPanels.find(panel => panel.viewType === uri.fsPath);

  if (!opened) {
    return false;
  }

  opened.reveal(opened.viewColumn);
  return true;
}

export function registerPanel(panel: WebviewPanel, openedPanels: WebviewPanel[]): void {
  if (!panel) {
    return;
  }

  panel.onDidDispose(() => {
    openedPanels.splice(openedPanels.indexOf(panel), 1);
  });

  openedPanels.push(panel);
}

let previewCount = 0;

export function showPreview(
  context: ExtensionContext,
  uri: Uri,
  openedPanels: WebviewPanel[],
  isBrowsingDir: boolean = false,
  browsingDir: Uri = null
): WebviewPanel {
  if (uri.fsPath.includes('.git')) {
    return;
  }

  const configContents = fs.readFileSync(uri.fsPath, 'utf8');
  const basename = path.basename(uri.fsPath);
  const column = window.activeTextEditor ? window.activeTextEditor.viewColumn : 1;
  const panel = window.createWebviewPanel(
    uri.fsPath, // treated as identity
    isBrowsingDir ? 'ᗢ SVG Browser' : `ᗢ ${basename}`,
    column,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: getLocalResourceRoots(context, uri)
    }
  );

  if (!panel) {
    return;
  }

  panel.webview.html = indexHtmlFile.replace('__icons__', configContents);
  // Handle messages from the webview
  (panel => {
    panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'loaded': {
            if (isBrowsingDir) {
              panel.webview.postMessage({
                command: 'svgts.command.setBrowsingMode',
                data: 'browsing'
              });

              if (browsingDir.fsPath.endsWith('.svg')) {
                panel.webview.postMessage({
                  command: 'svgts.command.iconDetail',
                  data: path.basename(browsingDir.fsPath).replace('.svg', '')
                });
              }
            }
            break;
          }

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
  })(panel);

  const { promise, watcher } = fileWatcher(uri.fsPath);

  promise.then((watcher: fs.FSWatcher) => {
    panel.dispose();
    openPanel(uri, openedPanels, context);
  });

  panel.onDidDispose(() => {
    watcher.close();
  });

  return panel;
}
