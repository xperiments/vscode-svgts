import path = require('path');
import { svg2ts } from 'svg2ts';
import { Uri, window } from 'vscode';
import { kebabCase } from './strings';
import { isDir, registerPanel, showPreview } from './utils';

export const svgtsPreviewDirectoryCommandMethod = (context, openedPanels) => (source: Uri) => {
  if (!source) {
    if (window.activeTextEditor) {
      const docPath = window.activeTextEditor.document.uri.fsPath;
      if (!docPath.endsWith('.svg')) {
        return;
      }
      source = Uri.file(docPath);
    } else {
      return;
    }
  }
  const srcDir = isDir(source.fsPath) ? source.fsPath : path.dirname(source.fsPath);
  const extensionOutputPath = context.storagePath;
  const previewPath = path.join(extensionOutputPath, '/svg-ts-preview/svg-ts-preview.svgts');
  const openPath = Uri.file(previewPath);
  svg2ts({
    input: srcDir,
    output: extensionOutputPath,
    blueprint: 'angular',
    module: 'svg-ts-preview'
  }).then(
    () => {
      registerPanel(showPreview(context, openPath, openedPanels, true, source), openedPanels);
    },
    () => {
      window.showErrorMessage('vscode-svgts: Something was wrong while converting');
    }
  );
};

export const svgtsFromDirCommandMethod = (source: Uri) => {
  if (!source) {
    if (window.activeTextEditor) {
      const docPath = window.activeTextEditor.document.uri.fsPath;
      if (!docPath.endsWith('.svg')) {
        return;
      }
      source = Uri.file(docPath);
    } else {
      return;
    }
  }
  const srcDir = isDir(source.fsPath) ? source.fsPath : path.dirname(source.fsPath);
  const baseName = path.basename(srcDir);
  const outputDir = srcDir.replace(baseName, '/ᗢ' + baseName);

  window
    .showInputBox({ prompt: 'Angular generated Module Name?', value: baseName })
    .then((moduleName: string | undefined) => {
      const { exec } = require('child_process');
      svg2ts({ input: srcDir, output: outputDir, blueprint: 'angular', module: kebabCase(moduleName) }).then(
        () => {
          window.showInformationMessage(`vscode-svgts: Succesfull generated svgts ${moduleName}-module module`);
        },
        () => {
          window.showErrorMessage('vscode-svgts: Something was wrong while converting');
        }
      );
    });
};
