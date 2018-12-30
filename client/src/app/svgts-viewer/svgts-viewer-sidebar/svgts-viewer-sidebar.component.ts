import { Component } from "@angular/core";
import {
  IconsService,
  IconsServiceColorFilter,
  IconsServiceSelectFilter
} from "../services/icons.service";
import { ClipboardService } from "../services/clipboard.service";
import { Svg2TsService } from "../services/svg2ts.service";
import { FormGroup, Validators, FormControl } from "@angular/forms";

declare var acquireVsCodeApi;
let vscode;
// yeye
try {
  vscode = acquireVsCodeApi();
} catch {}

@Component({
  selector: "svgts-viewer-sidebar",
  templateUrl: "./svgts-viewer-sidebar.component.html",
  styleUrls: ["./svgts-viewer-sidebar.component.scss"]
})
export class SvgTsViewerSidebarComponent {
  public infoKeys: Array<string> = ["name", "width", "height"];
  public gridSize: number = 5;
  public baseColor: string = "#000000";
  public baseColorFormGroup: FormGroup;

  constructor(
    public icons: IconsService,
    private _clipboard: ClipboardService,
    private _svg2ts: Svg2TsService
  ) {}

  public showGrid(size: number) {
    this.icons.setGridSize(size);
    this.gridSize = size;
  }

  public copyToClipboard(value: string | {}) {
    this._clipboard.copy(value);
  }

  public getCurrentViewBox() {
    return this._svg2ts.viewBoxString(this.icons.currentIconFile);
  }

  public change(e) {}

  public changeBaseColor() {}

  public ngOnInit() {
    this.baseColorFormGroup = new FormGroup({
      baseColor: new FormControl(this.baseColor)
    });
    this.baseColorFormGroup.valueChanges.subscribe(() => {
      this.baseColor = this.baseColorFormGroup.value.baseColor;
      this.icons.tint(this.baseColor);
    });
  }

  public updateBaseColorForm() {
    const value = this.baseColorFormGroup.get("baseColor").value;
    this.baseColorFormGroup.get("baseColor").setValue(value);
  }

  public colorMode(mode: IconsServiceColorFilter) {
    this.icons.iconColorFilter$.next(mode);
  }

  public select(mode: IconsServiceSelectFilter) {
    this.icons.selectFilter$.next(mode);
  }

  public deselectByName(name: string) {
    this.icons.deselectByName(name);
  }

  public export(type: string, size: number) {
    this.icons.export(type, size);
  }

  public toggleExport() {
    this.icons.currentIconFile.exported = !this.icons.currentIconFile.exported;
    this.icons.currentComponent.detectChanges();

    if (vscode) {
      vscode.postMessage({
        command: "updateExports",
        exports: this.icons.getExported(),
        assets: this.icons.getExportedAssets()
      });
    }
  }
}
