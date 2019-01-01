import { Component, HostBinding, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';

import { KeyboardService } from '../services/keyboard.service';
import { IconsService } from '../services/icons.service';
import { Svg2TsService } from '../services/svg2ts.service';
import { SafeHtml } from '@angular/platform-browser';
import { SVG2TSExtendedFile } from '../services/icons-data.service';
@Component({
  selector: 'svgts-viewer-icon',
  templateUrl: './svgts-viewer-icon.component.html',
  styleUrls: ['./svgts-viewer-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgTsViewerIconComponent implements OnInit {
  @HostBinding('class.-detail') public detail = false;
  @HostBinding('class.-exported') public exported: boolean;
  public iconFile: SVG2TSExtendedFile;
  @HostBinding('class.-selected') public selected = false;
  public svgContents: SafeHtml;

  @Input() public set icon(svgViewerFile: SVG2TSExtendedFile) {
    this.iconFile = svgViewerFile;
    this.exported = this.iconFile.exported;
  }

  public get icon() {
    return this.iconFile;
  }

  constructor(
    private _keyboard: KeyboardService,
    private _svg2ts: Svg2TsService,
    private _cdr: ChangeDetectorRef,
    private _iconService: IconsService
  ) {}

  public deselect() {
    this.selected = false;
    this.icon.selected = false;
    this._iconService.updateSelected();
    this.detectChanges();
  }

  public detectChanges() {
    this.exported = this.iconFile.exported;
    this._cdr.markForCheck();
  }

  public getViewBox() {
    return this._svg2ts.viewBoxString(this.iconFile);
  }

  public hide() {
    this.icon.visible = false;
    this.detectChanges();
  }

  public iconClick() {
    if (this.detail) {
      this.detail = false;
      if (this.iconFile.contextDefaults) {
        this.reset();
      }
    }
    this._iconService.currentIconFile = this.icon;
    this._iconService.currentComponent = this;

    if (this._keyboard.cmdDown) {
      this.toggleSelection();
      return;
    }
  }

  public ngOnInit() {
    this.svgContents = this._svg2ts.getInnerHtml(this.iconFile);
  }

  public render(context?: any) {
    this.svgContents = this._svg2ts.getInnerHtml(this.iconFile, context);

    this.detectChanges();
  }

  public reset() {
    this.iconFile.context = JSON.parse(JSON.stringify(this.iconFile.contextDefaults));
    this.render();
  }

  public select() {
    this.selected = true;
    this.icon.selected = true;
    this._iconService.updateSelected();
    this.detectChanges();
  }

  public show() {
    this.icon.visible = true;
    this.detectChanges();
  }

  public showDetail() {
    this.detail = true;
  }

  public tint(baseColor: any): any {
    this.svgContents = this._svg2ts.getTintInnerHtml(this.iconFile, baseColor);
    this.detectChanges();
  }

  public toggleSelection() {
    this.selected = !this.selected;
    this.icon.selected = !this.icon.selected;

    this._iconService.updateSelected();

    if (this.selected) {
      if (this._iconService.selectedAreSingle && this.icon.colorMode === 'single' && !this.icon.contextDefaults) {
        this.tint(this._iconService.baseColor);
      }
    } else {
      if (this.icon.colorMode === 'single' && !this.icon.contextDefaults) {
        this.tint('#000');
      }
    }
    this.detectChanges();
  }
}
