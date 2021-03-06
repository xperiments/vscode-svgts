import { Injectable, QueryList } from '@angular/core';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import { BehaviorSubject } from 'rxjs';
import { SvgTsViewerIconComponent } from '../svgts-viewer-icon/svgts-viewer-icon.component';
import { IconsDataService, SVGTSExtendedFile } from './icons-data.service';
import { SvgTsService } from './svg-ts.service';
export type IconsServiceColorFilter = 'single' | 'multiple' | 'dynamic' | 'all';
export type IconsServiceSelectFilter = 'all' | 'none';
export function camelCase(str: string) {
  return str
    .replace(/[\s|_|-](.)/g, $1 => {
      return $1.toUpperCase();
    })
    .replace(/[\s|_|-]/g, '')
    .replace(/^(.)/, $1 => {
      return $1.toLowerCase();
    });
}

export function kebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([^a-zA-Z])/g, '-')
    .toLowerCase();
}

export function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

export function pascalCase(str: string) {
  return capitalize(camelCase(str));
}

@Injectable({
  providedIn: 'root'
})
export class IconsService {
  public baseColor = '#000000';
  public browsingMode: 'module' | 'browsing' = 'module';
  public browsingMode$: BehaviorSubject<IconsService['browsingMode']> = new BehaviorSubject<
    IconsService['browsingMode']
  >('module');
  public currentColor = '#ffffff';
  public currentComponent: SvgTsViewerIconComponent;
  public currentIconFile: SVGTSExtendedFile;
  public gridSize = 4;
  public iconColorFilter$: BehaviorSubject<IconsServiceColorFilter> = new BehaviorSubject<IconsServiceColorFilter>(
    'all'
  );
  public selected = 0;
  public selectedAreSingle = false;
  public selectedAreSingleOrBicolor = false;
  public selectedNames: string[];
  public selectFilter$: BehaviorSubject<IconsServiceSelectFilter> = new BehaviorSubject<IconsServiceSelectFilter>(
    'all'
  );
  public viewList: QueryList<SvgTsViewerIconComponent>;

  private _canvas: HTMLCanvasElement = document.createElement('canvas');
  private _canvasCtx: CanvasRenderingContext2D;

  constructor(private _svgTs: SvgTsService, private _iconsData: IconsDataService) {
    this.selectFilter$.subscribe(mode => {
      if (mode === 'all') {
        this.selectAll();
      } else {
        this.deSelectAll();
      }
    });

    this.iconColorFilter$.subscribe(mode => {
      this.deSelectAll();
      this[`select${capitalize(mode)}Color`]();
    });

    this._canvasCtx = this._canvas.getContext('2d');
    document.body.appendChild(this._canvas);
  }

  public deSelectAll() {
    if (!this.viewList) {
      return;
    }
    this.tint();
    this.viewList.forEach(element => {
      if (element.selected) {
        element.deselect();
      }
    });
    this.selectedAreSingle = false;
  }

  public deselectByName(name: string): any {
    this.viewList.forEach(element => {
      if (element.icon.name === name) {
        element.deselect();
        if (element.icon.colorMode === 'single' && !element.icon.contextDefaults) {
          element.tint();
        }
      }
    });
  }

  public export(type: string, size: number) {
    const methodMap = {
      png: this._exportPng.bind(this),
      svg: this._exportSvg.bind(this),
      'svg-sprite': this._exportSvgSprite.bind(this)
    };

    methodMap[type](size);
  }

  public getExported() {
    return this.getExportedAssets().map(element => pascalCase(element));
  }

  public getExportedAssets() {
    return this.viewList.filter(element => element.iconFile.exported).map(element => element.iconFile.name);
  }

  public getSelected() {
    return this.viewList.filter(element => element.selected).length;
  }

  public getSelectedNames() {
    return this.viewList.filter(element => element.selected).map(element => element.icon.name);
  }

  public isSingleColor() {
    let contextDefaults = false;
    const colorSet = this.viewList.reduce((acc, element) => {
      if (element.selected) {
        acc.add(element.icon.colorMode);
        if (element.icon.contextDefaults) {
          // tslint:disable-next-line
          contextDefaults = true;
        }
      }

      return acc;
    }, new Set());
    return !contextDefaults && colorSet.has('single') && colorSet.size === 1 ? true : false;
  }

  public isSingleOrBiColor() {
    let contextDefaults = false;
    const colorSet = this.viewList.reduce((acc, element) => {
      if (element.selected) {
        acc.add(element.icon.colorMode);
        if (element.icon.contextDefaults) {
          // tslint:disable-next-line
          contextDefaults = true;
        }
      }

      return acc;
    }, new Set());
    return !contextDefaults && (colorSet.has('single') || colorSet.has('bicolor')) && colorSet.size === 1
      ? true
      : false;
  }

  public selectAll() {
    if (!this.viewList) {
      return;
    }
    let first = false;

    this.viewList.forEach(element => {
      if (!element.selected && element.icon.visible) {
        element.select();

        if (!first) {
          if (!this.currentComponent) {
            element.iconClick();
          }
          first = true;
        }

        if (this.baseColor && this.selectedAreSingle) {
          element.tint(this.baseColor, this.currentColor);
        }
      }
    });
    this.updateSelected();
  }

  public selectAllColor() {
    if (!this.viewList) {
      return;
    }
    this.viewList.forEach(element => {
      element.show();
    });
  }

  public selectDynamicColor() {
    if (!this.viewList) {
      return;
    }
    this.viewList.forEach(element => {
      element[element.icon.contextDefaults ? 'show' : 'hide']();
    });
  }

  public selectMultipleColor() {
    if (!this.viewList) {
      return;
    }
    this.viewList.forEach(element => {
      element[element.icon.colorMode === 'multiple' && !element.icon.contextDefaults ? 'show' : 'hide']();
    });
  }

  public selectSingleColor() {
    if (!this.viewList) {
      return;
    }
    this.deSelectAll();
    this.viewList.forEach(element => {
      element[element.icon.colorMode === 'single' && !element.icon.contextDefaults ? 'show' : 'hide']();
    });
  }

  public setBrowsingMode(mode: IconsService['browsingMode']): any {
    this.browsingMode = mode;
    this.browsingMode$.next(mode);
  }

  public setGridSize(size: number) {
    this.gridSize = size;
  }

  public tint(baseColor?: string, currentColor?: string) {
    this.baseColor = baseColor;
    this.currentColor = currentColor;
    this.viewList.forEach(element => {
      if (element.selected) {
        if (this.selectedAreSingle && element.icon.colorMode === 'single' && !element.icon.contextDefaults) {
          element.tint(this.baseColor, this.currentColor);
        }
      } else {
        if (this.selectedAreSingle && element.icon.colorMode === 'single' && !element.icon.contextDefaults) {
          element.tint();
        }
      }
    });
  }

  public updateSelected() {
    this.selected = this.getSelected();
    this.selectedAreSingle = this.isSingleColor();
    this.selectedAreSingleOrBicolor = this.isSingleOrBiColor();
    this.selectedNames = this.getSelectedNames();
  }

  private _exportPng(size: number) {
    const icons = this.viewList.filter(el => el.selected);
    const zip = new JSZip();
    let pending = icons.length;
    icons.forEach(icon => {
      let svgOutput = '';
      let svgContents = '';

      if (this.selectedAreSingle && icon.iconFile.colorMode === 'single' && !icon.iconFile.contextDefaults) {
        svgContents = this._svgTs.getTintInnerHtml(icon.iconFile, this.baseColor)[
          'changingThisBreaksApplicationSecurity'
        ];
      } else {
        svgContents = this._svgTs.getInnerHtml(icon.iconFile)['changingThisBreaksApplicationSecurity'];
      }
      const viewBox = this._svgTs.viewBoxString(icon.iconFile);
      svgOutput = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${icon
        .iconFile.viewBox.width * size}" height="${icon.iconFile.viewBox.height *
        size}" viewBox="${viewBox}">${svgContents}</svg>`;

      const img = new Image();

      const that = this;
      const svgBlob = new Blob([svgOutput], {
        type: 'image/svg+xml;charset=utf-8'
      });
      const url = URL.createObjectURL(svgBlob);
      img.onload = function() {
        that._canvas.width = icon.iconFile.viewBox.width * size;
        that._canvas.height = icon.iconFile.viewBox.height * size;
        that._canvasCtx.clearRect(0, 0, that._canvas.width, that._canvas.height);
        that._canvasCtx.drawImage(img, 0, 0);
        const png = that._canvas.toDataURL('image/png').replace('data:image/png;base64,', '');
        zip.file(icon.iconFile.name + '.png', png, { base64: true });
        URL.revokeObjectURL(png);
        pending--;
        if (pending === 0) {
          zip.generateAsync({ type: 'blob' }).then(content => {
            // see FileSaver.js
            saveAs(content, `svgts-${size}x-${+new Date()}.zip`);
          });
        }
      };
      img.src = url;
    });
  }
  private _exportSvg(size: number) {
    const icons = this.viewList.filter(el => el.selected);
    const zip = new JSZip();
    let pending = icons.length;
    icons.forEach(icon => {
      let svgOutput = '';
      let svgContents = '';

      if (this.selectedAreSingle && icon.iconFile.colorMode === 'single' && !icon.iconFile.contextDefaults) {
        svgContents = this._svgTs.getTintInnerHtml(icon.iconFile, this.baseColor)[
          'changingThisBreaksApplicationSecurity'
        ];
      } else {
        svgContents = this._svgTs.getInnerHtml(icon.iconFile)['changingThisBreaksApplicationSecurity'];
      }
      const viewBox = this._svgTs.viewBoxString(icon.iconFile);
      svgOutput = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="${
        icon.iconFile.svgHash
      }-0" width="${icon.iconFile.viewBox.width * size}" height="${icon.iconFile.viewBox.height *
        size}" viewBox="${viewBox}">${svgContents}</svg>`;

      zip.file(icon.iconFile.name + '.svg', svgOutput);
      pending--;
      if (pending === 0) {
        zip.generateAsync({ type: 'blob' }).then(content => {
          // see FileSaver.js
          saveAs(content, `svgts-${size}x-${+new Date()}.zip`);
        });
      }
    });
  }
  private _exportSvgSprite(size: number) {
    const icons = this.viewList.filter(el => el.selected);
    const zip = new JSZip();
    let pending = icons.length;
    let spriteContent =
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display:none;">';
    icons.forEach(icon => {
      let svgOutput = '';
      let svgContents = '';

      if (this.selectedAreSingle && icon.iconFile.colorMode === 'single' && !icon.iconFile.contextDefaults) {
        svgContents = this._svgTs.getTintInnerHtml(icon.iconFile, this.baseColor)[
          'changingThisBreaksApplicationSecurity'
        ];
      } else {
        svgContents = this._svgTs.getInnerHtml(icon.iconFile)['changingThisBreaksApplicationSecurity'];
      }
      const viewBox = this._svgTs.viewBoxString(icon.iconFile);
      svgOutput = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${icon
        .iconFile.viewBox.width * size}" height="${icon.iconFile.viewBox.height *
        size}" viewBox="${viewBox}">${svgContents}</svg>`;

      spriteContent += `<symbol id="${icon.iconFile.name}" viewBox="${viewBox}">${svgContents}</symbol>`;

      zip.file(icon.iconFile.name + '.svg', svgOutput);
      pending--;
      if (pending === 0) {
        spriteContent += '</svg>';
        zip.file(`${this._iconsData.moduleName}.sprite.svg`, spriteContent);
        zip.generateAsync({ type: 'blob' }).then(content => {
          // see FileSaver.js
          saveAs(content, `svgts-${size}x-${+new Date()}.zip`);
        });
      }
    });
  }
}
