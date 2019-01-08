import { Injectable } from '@angular/core';

declare function acquireVsCodeApi(): { postMessage: (message: any) => void };

let vscodeRef: { postMessage: ((message: any) => void) | ((message: any) => void) | ((message: any) => void) };
// yeye
try {
  vscodeRef = acquireVsCodeApi();
} catch {
  vscodeRef = { postMessage: (message: any) => {} };
}

export const vscode = vscodeRef;

@Injectable()
export class VscodeService {
  public get editor(): { postMessage: (message: any) => void } {
    return vscode;
  }
}
