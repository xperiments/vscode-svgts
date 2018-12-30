import { Injectable } from "@angular/core";
import { Svg2TsService } from "./svg2ts.service";

export interface SVG2TSExtendedFile extends SVG2TSFile {
  colorMode: "single" | "multiple";
  visible: boolean;
  selected: boolean;
  exported: boolean;
}

const loadedIcons = window["svg2ts"] ? window["svg2ts"].icons.files : [];
const exportedIcons: string[] = window["svg2ts"]
  ? window["svg2ts"].icons.exports
  : [];

@Injectable({
  providedIn: "root"
})
export class IconsDataService {
  public icons = this._getIcons();

  constructor(private _svg2ts: Svg2TsService) {}
  private _getIcons(): SVG2TSExtendedFile[] {
    return loadedIcons.map(icon => {
      return {
        ...icon,
        colorMode: this._svg2ts.determineColorMode(icon),
        visible: true,
        selected: false,
        exported: exportedIcons.includes(icon.name)
      };
    });
  }
}
