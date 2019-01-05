import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ClipboardService } from '../services/clipboard.service';
import { IconsDataService } from '../services/icons-data.service';
import { IconsService, IconsServiceColorFilter, IconsServiceSelectFilter } from '../services/icons.service';
import { SvgTsService } from '../services/svg-ts.service';

declare var acquireVsCodeApi;
let vscode;
// yeye
try {
  vscode = acquireVsCodeApi();
} catch {}

@Component({
  selector: 'svgts-viewer-sidebar',
  templateUrl: './svgts-viewer-sidebar.component.html',
  styleUrls: ['./svgts-viewer-sidebar.component.scss']
})
export class SvgTsViewerSidebarComponent implements OnInit {
  public baseColor = '#000000';
  public baseColorFormGroup: FormGroup;
  public gridSize: number;
  public infoKeys: Array<string> = ['name', 'width', 'height'];

  constructor(
    public icons: IconsService,
    public iconsData: IconsDataService,
    private _clipboard: ClipboardService,
    private _svgTs: SvgTsService
  ) {
    this.gridSize = this.icons.gridSize;
  }

  public colorMode(mode: IconsServiceColorFilter) {
    this.icons.iconColorFilter$.next(mode);
  }

  public copyIcon(mode: 'angular' | 'css' | 'svg') {
    const svgIcon = this.icons.currentComponent.svgIcon;
    const iconFile = this.icons.currentIconFile;
    const moduleName = this.iconsData.moduleName;
    switch (mode) {
      case 'angular': {
        this.copyToClipboard(`<${moduleName} icon="${iconFile.name}"></${moduleName}>`);
        break;
      }
      case 'svg': {
        this.copyToClipboard(this._svgTs.getIconSvg(iconFile, svgIcon));
        break;
      }
      case 'css': {
        this.copyToClipboard(this._svgTs.getIconEncodedUri(iconFile, svgIcon));
        break;
      }
    }
  }

  public copyToClipboard(value: string | {}) {
    this._clipboard.copy(value);
  }

  public deselectByName(name: string) {
    this.icons.deselectByName(name);
  }

  public export(type: string, size: number) {
    this.icons.export(type, size);
  }

  public getCurrentViewBox() {
    return this._svgTs.viewBoxString(this.icons.currentIconFile);
  }

  public ngOnInit() {
    this.baseColorFormGroup = new FormGroup({
      baseColor: new FormControl(this.baseColor)
    });
    this.baseColorFormGroup.valueChanges.subscribe(() => {
      this.baseColor = this.baseColorFormGroup.value.baseColor;
      this.icons.tint(this.baseColor);
    });
  }

  public select(mode: IconsServiceSelectFilter) {
    this.icons.selectFilter$.next(mode);
  }

  public showGrid(size: number) {
    this.icons.setGridSize(size);
    this.gridSize = size;
  }

  public toggleExport() {
    this.icons.currentIconFile.exported = !this.icons.currentIconFile.exported;
    this.icons.currentComponent.detectChanges();

    if (vscode) {
      vscode.postMessage({
        command: 'updateExports',
        exports: this.icons.getExported(),
        assets: this.icons.getExportedAssets()
      });
    }
  }

  public updateBaseColorForm() {
    const value = this.baseColorFormGroup.get('baseColor').value;
    this.baseColorFormGroup.get('baseColor').setValue(value);
  }
}
