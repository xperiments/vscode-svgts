import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ClipboardService {
  private _hiddenInput: HTMLInputElement;
  constructor() {
    this._hiddenInput = document.createElement("input");
    this._hiddenInput.setAttribute(
      "style",
      "position:absolute; clip:rect(0 0 0 0);"
    );
    document.body.appendChild(this._hiddenInput);
  }

  public copy(value: string | {}) {
    this._hiddenInput.value = (typeof value === "object"
      ? JSON.stringify(value)
      : value) as string;
    this._hiddenInput.select();
    document.execCommand("Copy");
  }
}
