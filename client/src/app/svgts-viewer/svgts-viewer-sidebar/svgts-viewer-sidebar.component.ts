import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ClipboardService } from '../services/clipboard.service';
import { IconsDataService } from '../services/icons-data.service';
import { IconsService, IconsServiceColorFilter, IconsServiceSelectFilter } from '../services/icons.service';
import { SvgTsService } from '../services/svg-ts.service';
import { VscodeService } from '../services/vscode.service';

@Component({
  selector: 'svgts-viewer-sidebar',
  templateUrl: './svgts-viewer-sidebar.component.html',
  styleUrls: ['./svgts-viewer-sidebar.component.scss']
})
export class SvgTsViewerSidebarComponent implements OnInit {
  public baseColor = '#000000';
  public baseColorFormGroup: FormGroup;
  public currentColor = '#ffffff';
  public gridSize: number;
  public infoKeys: Array<string> = ['name', 'width', 'height'];

  constructor(
    public icons: IconsService,
    public iconsData: IconsDataService,
    private _clipboard: ClipboardService,
    private _svgTs: SvgTsService,
    private _vscode: VscodeService
  ) {
    this.gridSize = this.icons.gridSize;
  }
  public clearCurrentColor() {
    this.currentColor = null;
    this.baseColorFormGroup.get('currentColor').setValue(null);
    this.icons.currentComponent.tint(this.icons.baseColor);
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
      baseColor: new FormControl(this.baseColor),
      currentColor: new FormControl(this.currentColor)
    });
    this.baseColorFormGroup.valueChanges.subscribe(() => {
      this.baseColor = this.baseColorFormGroup.value.baseColor;
      this.currentColor = this.baseColorFormGroup.value.currentColor;
      this.icons.tint(this.baseColor, this.currentColor);
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

    this._vscode.editor.postMessage({
      command: 'updateExports',
      exports: this.icons.getExported(),
      assets: this.icons.getExportedAssets()
    });
  }

  public updateBaseColorForm() {
    const value = this.baseColorFormGroup.get('baseColor').value;
    this.baseColorFormGroup.get('baseColor').setValue(value);
  }
}
