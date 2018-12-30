import { Injectable, QueryList } from "@angular/core";
import { saveAs } from "file-saver";
import * as JSZip from "jszip";
import { BehaviorSubject } from "rxjs";
import { SvgTsViewerIconComponent } from "../svgts-viewer-icon/svgts-viewer-icon.component";
import { Svg2TsService } from "./svg2ts.service";
import { SVG2TSExtendedFile } from "./icons-data.service";

export type IconsServiceColorFilter = "single" | "multiple" | "dynamic" | "all";
export type IconsServiceSelectFilter = "all" | "none";
export function camelCase(str: string) {
  return str
    .replace(/[\s|_|-](.)/g, function($1) {
      return $1.toUpperCase();
    })
    .replace(/[\s|_|-]/g, "")
    .replace(/^(.)/, function($1) {
      return $1.toLowerCase();
    });
}

export function kebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([^a-zA-Z])/g, "-")
    .toLowerCase();
}

export function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

export function pascalCase(str: string) {
  return capitalize(camelCase(str));
}

@Injectable({
  providedIn: "root"
})
export class IconsService {
  public selectFilter$: BehaviorSubject<
    IconsServiceSelectFilter
  > = new BehaviorSubject<IconsServiceSelectFilter>("all");
  public iconColorFilter$: BehaviorSubject<
    IconsServiceColorFilter
  > = new BehaviorSubject<IconsServiceColorFilter>("all");

  public currentIconFile: SVG2TSExtendedFile;
  public currentComponent: SvgTsViewerIconComponent;
  public gridSize = 4;
  public selected = 0;
  public selectedNames: string[];
  public selectedAreSingle = false;
  public viewList: QueryList<SvgTsViewerIconComponent>;
  public baseColor = null;

  private _canvas: HTMLCanvasElement = document.createElement("canvas");
  private _canvasCtx: CanvasRenderingContext2D;

  constructor(private _svg2ts: Svg2TsService) {
    this.selectFilter$.subscribe(mode => {
      if (mode === "all") {
        this.selectAll();
      } else {
        this.deSelectAll();
      }
    });

    this.iconColorFilter$.subscribe(mode => {
      this.deSelectAll();
      this[`select${capitalize(mode)}Color`]();
    });

    this._canvasCtx = this._canvas.getContext("2d");
    document.body.appendChild(this._canvas);
  }

  public setGridSize(size: number) {
    this.gridSize = size;
  }

  public getExported() {
    return this.getExportedAssets().map(element => pascalCase(element));
  }
  public getExportedAssets() {
    return this.viewList
      .filter(element => element.iconFile.exported)
      .map(element => element.iconFile.name);
  }

  public deSelectAll() {
    if (!this.viewList) return;
    this.tint("#000");
    this.viewList.forEach(element => {
      if (element.selected) {
        element.deselect();
      }
    });
    this.selectedAreSingle = false;
  }

  public selectAll() {
    if (!this.viewList) return;
    this.viewList.forEach(element => {
      if (!element.selected && element.icon.visible) {
        element.select();
        if (this.baseColor && this.selectedAreSingle) {
          element.tint(this.baseColor);
        }
      }
    });
    this.updateSelected();
  }

  public isSingleColor() {
    let contextDefaults = false;
    const colorSet = this.viewList.reduce((acc, element) => {
      if (element.selected) {
        acc.add(element.icon.colorMode);
        if (element.icon.contextDefaults) {
          contextDefaults = true;
        }
      }

      return acc;
    }, new Set());
    return !contextDefaults && colorSet.has("single") && colorSet.size === 1
      ? true
      : false;
  }

  public getSelected() {
    return this.viewList.filter(element => element.selected).length;
  }

  public getSelectedNames() {
    return this.viewList
      .filter(element => element.selected)
      .map(element => element.icon.name);
  }

  public updateSelected() {
    this.selected = this.getSelected();
    this.selectedAreSingle = this.isSingleColor();
    this.selectedNames = this.getSelectedNames();
  }

  public selectSingleColor() {
    if (!this.viewList) return;
    this.deSelectAll();
    this.viewList.forEach(element => {
      element[
        element.icon.colorMode === "single" && !element.icon.contextDefaults
          ? "show"
          : "hide"
      ]();
    });
  }

  public selectMultipleColor() {
    if (!this.viewList) return;
    this.viewList.forEach(element => {
      element[
        element.icon.colorMode === "multiple" && !element.icon.contextDefaults
          ? "show"
          : "hide"
      ]();
    });
  }

  public selectDynamicColor() {
    if (!this.viewList) return;
    this.viewList.forEach(element => {
      element[element.icon.contextDefaults ? "show" : "hide"]();
    });
  }

  public selectAllColor() {
    if (!this.viewList) return;
    this.viewList.forEach(element => {
      element.show();
    });
  }

  public tint(baseColor: string) {
    this.baseColor = baseColor;
    this.viewList.forEach(element => {
      if (element.selected) {
        if (
          this.selectedAreSingle &&
          element.icon.colorMode === "single" &&
          !element.icon.contextDefaults
        ) {
          element.tint(this.baseColor);
        }
      } else {
        if (
          this.selectedAreSingle &&
          element.icon.colorMode === "single" &&
          !element.icon.contextDefaults
        ) {
          element.tint("#000");
        }
      }
    });
  }

  public deselectByName(name: string): any {
    this.viewList.forEach(element => {
      if (element.icon.name === name) {
        element.deselect();
        if (
          element.icon.colorMode === "single" &&
          !element.icon.contextDefaults
        ) {
          element.tint("#000");
        }
      }
    });
  }

  public export(type: string, size: number) {
    const icons = this.viewList.filter(el => el.selected);
    const zip = new JSZip();
    let pending = icons.length;
    icons.forEach(icon => {
      let svgOutput = "";
      let svgContents = "";

      if (
        this.selectedAreSingle &&
        icon.iconFile.colorMode === "single" &&
        !icon.iconFile.contextDefaults
      ) {
        svgContents = this._svg2ts.getTintInnerHtml(
          icon.iconFile,
          this.baseColor
        )["changingThisBreaksApplicationSecurity"];
      } else {
        svgContents = this._svg2ts.getInnerHtml(icon.iconFile)[
          "changingThisBreaksApplicationSecurity"
        ];
      }
      const viewBox = this._svg2ts.viewBoxString(icon.iconFile);
      svgOutput = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${icon
        .iconFile.viewBox.width * size}" height="${icon.iconFile.viewBox
        .height * size}" viewBox="${viewBox}">${svgContents}</svg>`;

      if (type === "png") {
        const img = new Image();

        const that = this;
        const svgBlob = new Blob([svgOutput], {
          type: "image/svg+xml;charset=utf-8"
        });
        const url = URL.createObjectURL(svgBlob);
        img.onload = function() {
          that._canvas.width = icon.iconFile.viewBox.width * size;
          that._canvas.height = icon.iconFile.viewBox.height * size;
          that._canvasCtx.clearRect(
            0,
            0,
            that._canvas.width,
            that._canvas.height
          );
          that._canvasCtx.drawImage(img, 0, 0);
          const png = that._canvas
            .toDataURL("image/png")
            .replace("data:image/png;base64,", "");
          zip.file(icon.iconFile.name + ".png", png, { base64: true });
          URL.revokeObjectURL(png);
          pending--;
          if (pending === 0) {
            zip.generateAsync({ type: "blob" }).then(content => {
              // see FileSaver.js
              saveAs(content, `svg2ts-${size}x-${+new Date()}.zip`);
            });
          }
        };
        img.src = url;
      } else {
        zip.file(icon.iconFile.name + ".svg", svgOutput);
        pending--;
        if (pending === 0) {
          zip.generateAsync({ type: "blob" }).then(content => {
            // see FileSaver.js
            saveAs(content, `svg2ts-${size}x-${+new Date()}.zip`);
          });
        }
      }
    });
  }
}
